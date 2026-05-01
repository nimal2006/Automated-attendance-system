#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <LiquidCrystal_I2C.h>

// --- CONFIG ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://192.168.1.5:5000/status"; // Flask server IP

// LCD 16x2 I2C
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  Serial.begin(115200);
  
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0,0);
  lcd.print("Connecting WiFi");

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  lcd.clear();
  lcd.print("System Ready");
  delay(1000);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    
    int httpCode = http.GET();
    
    if (httpCode > 0) {
      String payload = http.getString();
      StaticJsonDocument<200> doc;
      deserializeJson(doc, payload);
      
      const char* name = doc["name"];
      const char* status = doc["status"];

      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("User: ");
      lcd.print(name);
      
      lcd.setCursor(0, 1);
      lcd.print("Stat: ");
      lcd.print(status);
    } else {
      lcd.clear();
      lcd.print("Server Error");
    }
    
    http.end();
  }
  
  delay(2000); // Polling interval
}
