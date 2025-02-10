import { NextResponse } from 'next/server';
  import axios from 'axios';
  
  export async function POST(req: Request) {
  try {
  const { token } = await req.json();
  
  if (!token) {
  return NextResponse.json({ success: false, message: 'No reCAPTCHA token provided' }, { status: 400 });
  }
  
  const secretKey = process.env.RECAPTCHA_SECRET_KEY; // Add to .env
  if (!secretKey) {
  console.error("RECAPTCHA_SECRET_KEY is not set in environment variables.");
  return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
  }
  
  const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
  
  const response = await axios.post(verificationUrl);
  const { success, score, action } = response.data;
  
  if (success && score >= 0.5) { //  Adjust score threshold as needed.
  //  reCAPTCHA verification successful.
  return NextResponse.json({ success: true, score, action });
  } else {
  //  reCAPTCHA verification failed.
  console.error("reCAPTCHA verification failed:", response.data);
  return NextResponse.json({ success: false, message: 'reCAPTCHA verification failed', ...response.data }, { status: 400 });
  }
  
  } catch (error: any) {
  console.error("Error verifying reCAPTCHA:", error);
  return NextResponse.json({ success: false, message: 'An error occurred during verification', error: error.message }, { status: 500 });
  }
  }
