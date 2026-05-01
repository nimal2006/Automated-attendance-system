import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;
const enableSMS = process.env.ENABLE_SMS === 'true';

let twilioClient: any = null;

if (enableSMS && accountSid && authToken) {
  try {
    twilioClient = twilio(accountSid, authToken);
  } catch (error) {
    console.error('Failed to initialize Twilio client:', error);
  }
}

export { twilioClient };

export interface SMSParams {
  studentName: string;
  status: string;
  parentPhone: string;
  date: string;
  time: string;
}

export async function sendAttendanceSMS(params: SMSParams) {
  const { studentName, status, parentPhone, date, time } = params;
  
  let message = '';
  switch (status) {
    case 'Present':
      message = `Dear Parent, your child ${studentName} was marked Present on ${date} at ${time}.`;
      break;
    case 'Absent':
      message = `Dear Parent, your child ${studentName} was marked Absent on ${date}. Please contact the school if this is unexpected.`;
      break;
    case 'Late':
      message = `Dear Parent, your child ${studentName} arrived Late on ${date} at ${time}.`;
      break;
    case 'Unconfirmed':
      message = `Dear Parent, attendance for your child ${studentName} is currently Unconfirmed on ${date}. The school will verify shortly.`;
      break;
    default:
      message = `Dear Parent, updated attendance status for ${studentName}: ${status} on ${date}.`;
  }

  if (enableSMS && twilioClient && fromNumber) {
    try {
      const response = await twilioClient.messages.create({
        body: message,
        from: fromNumber,
        to: parentPhone.startsWith('+') ? parentPhone : `+91${parentPhone}`
      });
      return { status: 'sent', sid: response.sid, message };
    } catch (error: any) {
      console.error('Twilio SMS send error:', error);
      return { status: 'failed', error: error.message, message };
    }
  }

  // Demo/Skipped mode
  return { status: 'skipped', message };
}
