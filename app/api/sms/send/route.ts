import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { to, message, jobNumber } = await req.json()

    // Validate inputs
    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to and message' },
        { status: 400 }
      )
    }

    // Check if Twilio credentials are configured
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !fromNumber) {
      // Log the SMS that would have been sent (for demo/testing)
      console.log('[SMS] Would send to:', to)
      console.log('[SMS] Message:', message)
      console.log('[SMS] Job:', jobNumber)
      
      // Return success for demo purposes - in production, return error
      return NextResponse.json({
        success: true,
        demo: true,
        message: 'SMS logged (Twilio not configured)',
        to,
        content: message,
      })
    }

    // Send via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    
    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: to,
        From: fromNumber,
        Body: message,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('[SMS] Twilio error:', error)
      return NextResponse.json(
        { error: 'Failed to send SMS', details: error },
        { status: 500 }
      )
    }

    const result = await response.json()
    
    return NextResponse.json({
      success: true,
      messageSid: result.sid,
      to,
    })
  } catch (error) {
    console.error('[SMS] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
