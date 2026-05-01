import cv2
import face_recognition
import numpy as np
import requests
import time
import json
import threading
from flask import Flask, jsonify, request
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# --- CONFIGURATION ---
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")
ESP32_CAM_URL = "http://192.168.1.10:81/stream"  # Update with your ESP32-CAM IP
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Directory for saving evidence
EVIDENCE_DIR = "static/uploads/anticheat"
if not os.path.exists(EVIDENCE_DIR):
    os.makedirs(EVIDENCE_DIR, exist_ok=True)

# Global state for ESP32 polling
latest_result = {"name": "No Face", "status": "Waiting"}
lock = threading.Lock()

# --- FACE ENGINE ---
class FaceEngine:
    def __init__(self):
        self.known_encodings = []
        self.known_names = []
        self.known_ids = []
        self.load_known_faces()

    def load_known_faces(self):
        print("Loading face data from Supabase...")
        try:
            # We assume 'face_encoding' stores a JSON array of 128 floats
            response = supabase.table("students").select("id, full_name, face_encoding").not_.is_("face_encoding", "null").execute()
            data = response.data
            
            self.known_encodings = []
            self.known_names = []
            self.known_ids = []

            for record in data:
                encoding = np.array(json.loads(record['face_encoding']))
                self.known_encodings.append(encoding)
                self.known_names.append(record['full_name'])
                self.known_ids.append(record['id'])
            
            print(f"Loaded {len(self.known_encodings)} student models.")
        except Exception as e:
            print(f"Error loading faces: {e}")

    def recognize(self, frame):
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        results = []
        for face_encoding in face_encodings:
            if not self.known_encodings:
                results.append(("Unknown", None, 0.0))
                continue

            # Calculate distances for better accuracy control
            distances = face_recognition.face_distance(self.known_encodings, face_encoding)
            best_match_index = np.argmin(distances)
            confidence = 1.0 - distances[best_match_index]
            
            # Threshold (0.45 - 0.6)
            if distances[best_match_index] < 0.5:
                name = self.known_names[best_match_index]
                student_id = self.known_ids[best_match_index]
                results.append((name, student_id, float(confidence)))
            else:
                results.append(("Unknown", None, float(confidence)))
        
        return results

engine = FaceEngine()

def recognition_loop():
    global latest_result
    print("Starting Recognition Thread...")
    cap = cv2.VideoCapture(ESP32_CAM_URL)
    last_unknown_log = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame. Retrying...")
            time.sleep(2)
            cap = cv2.VideoCapture(ESP32_CAM_URL)
            continue

        detections = engine.recognize(frame)
        
        with lock:
            if not detections:
                latest_result = {"name": "No Face", "status": "Scanning"}
            else:
                name, student_id, confidence = detections[0]
                if name != "Unknown":
                    mark_attendance(student_id, name)
                else:
                    latest_result = {"name": "Unknown", "status": "Access Denied"}
                    # Log unknown face with cooldown (every 30 seconds)
                    if time.time() - last_unknown_log > 30:
                        handle_unknown_face(frame, confidence)
                        last_unknown_log = time.time()
        
        time.sleep(0.5) # Prevent CPU hogging

def handle_unknown_face(frame, confidence):
    timestamp = int(time.time())
    filename = f"unknown_{timestamp}.jpg"
    filepath = os.path.join(EVIDENCE_DIR, filename)
    cv2.imwrite(filepath, frame)
    
    web_path = f"/static/uploads/anticheat/{filename}"
    
    try:
        # Log to anti-cheat
        supabase.table("anticheat_logs").insert({
            "type": "Unknown Face Detected",
            "confidence": confidence,
            "evidence_path": web_path
        }).execute()
        
        # Notify admins
        admins = supabase.table("users").select("id").eq("role", "admin").execute()
        for admin in admins.data:
            supabase.table("notifications").insert({
                "user_id": admin["id"],
                "title": "Security Alert",
                "message": f"Unknown individual detected at the scanner. Confidence: {confidence:.2f}. Snapshot: {web_path}",
                "type": "security"
            }).execute()
            
        print(f"Unknown face logged: {web_path}")
    except Exception as e:
        print(f"Error logging unknown face: {e}")
def mark_attendance(student_id, name):
    global latest_result
    today = time.strftime("%Y-%m-%d")
    now_time = time.strftime("%H:%M:%S")
    
    try:
        # Check if already marked today
        check = supabase.table("attendance").select("*").eq("student_id", student_id).eq("date", today).execute()
        
        if not check.data:
            supabase.table("attendance").insert({
                "student_id": student_id,
                "date": today,
                "time": now_time,
                "status": "Present",
                "method": "Face AI"
            }).execute()
            latest_result = {"name": name, "status": "Present"}
            print(f"Attendance marked for {name}")
        else:
            latest_result = {"name": name, "status": "Already Marked"}
    except Exception as e:
        print(f"DB Error: {e}")

# --- API ENDPOINTS ---

@app.route('/status', methods=['GET'])
def get_status():
    with lock:
        return jsonify(latest_result)

@app.route('/reload', methods=['POST'])
def reload_faces():
    engine.load_known_faces()
    return jsonify({"success": True})

@app.route('/verify', methods=['POST'])
def verify_face():
    data = request.json
    frames = data.get('frames', [])
    
    if not frames:
        return jsonify({"success": False, "error": "No frames provided"})

    # Process only the first frame for the verify request
    try:
        import base64
        # Remove header if present (data:image/jpeg;base64,...)
        img_data = frames[0]
        if "," in img_data:
            img_data = img_data.split(",")[1]
            
        nparr = np.frombuffer(base64.b64decode(img_data), np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        detections = engine.recognize(frame)
        
        if not detections:
            # Try to log as unknown if a face was at least detected but not matched
            # This is handled in the recognition loop usually, but for direct verify:
            return jsonify({
                "success": False, 
                "error": "No face detected",
                "confidence": 0,
                "liveness_score": 0.5
            })

        name, student_id, confidence = detections[0]
        
        if name == "Unknown":
            handle_unknown_face(frame, confidence)
            return jsonify({
                "success": False, 
                "error": "Unknown Identity",
                "confidence": float(confidence),
                "liveness_score": 0.6
            })

        # Calculate a simulated liveness score based on frame density/blur
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        liveness_score = min(1.0, laplacian_var / 500.0) # Simple heuristic for clarity

        return jsonify({
            "success": True,
            "student_id": student_id,
            "full_name": name,
            "confidence": float(confidence),
            "liveness_score": float(liveness_score)
        })

    except Exception as e:
        print(f"Verify Error: {e}")
        return jsonify({"success": False, "error": str(e)})

if __name__ == '__main__':
    # Start recognition in background
    thread = threading.Thread(target=recognition_loop, daemon=True)
    thread.start()
    app.run(host='0.0.0.0', port=5000)
