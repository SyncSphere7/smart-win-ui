// Vercel Serverless Function for Payment Notifications
// Sends email via Resend API when user submits payment details

// Get credentials from environment variables (set in Vercel dashboard)
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@smartwinofficial.co.uk';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if API key is configured
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return res.status(500).json({ error: 'Payment notification system not configured' });
  }

  try {
    const {
      paymentMethod,
      fullName,
      email,
      phone,
      transactionId,
      amountSent,
      paymentDate,
      additionalNotes,
      submittedAt
    } = req.body;

    // Validate required fields
    if (!paymentMethod || !fullName || !email || !phone || !transactionId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Format payment date
    const formattedPaymentDate = new Date(paymentDate).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short'
    });

    const formattedSubmittedAt = new Date(submittedAt).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short'
    });

    // Create email HTML content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background-color: #ee1e46;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: white;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .field {
            margin-bottom: 15px;
            padding: 10px;
            background-color: #f5f5f5;
            border-left: 4px solid #ee1e46;
          }
          .field-label {
            font-weight: bold;
            color: #ee1e46;
            margin-bottom: 5px;
          }
          .field-value {
            color: #333;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            padding: 20px;
            font-size: 12px;
            color: #666;
          }
          .alert {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 New Payment Submission</h1>
            <p>Smart-Win $100 Consultation Fee</p>
          </div>
          
          <div class="content">
            <div class="alert">
              <strong>⚠️ Action Required:</strong> Please verify this payment on the blockchain/payment provider and contact the client.
            </div>

            <h2>Customer Information</h2>
            <div class="field">
              <div class="field-label">Full Name:</div>
              <div class="field-value">${fullName}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Email Address:</div>
              <div class="field-value">${email}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Phone Number (WhatsApp/Telegram):</div>
              <div class="field-value">${phone}</div>
            </div>

            <h2>Payment Details</h2>
            <div class="field">
              <div class="field-label">Payment Method:</div>
              <div class="field-value"><strong>${paymentMethod}</strong></div>
            </div>
            
            <div class="field">
              <div class="field-label">Transaction ID / Reference:</div>
              <div class="field-value"><strong>${transactionId}</strong></div>
            </div>
            
            <div class="field">
              <div class="field-label">Amount Sent:</div>
              <div class="field-value">${amountSent}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Payment Date & Time (Client Reported):</div>
              <div class="field-value">${formattedPaymentDate}</div>
            </div>

            ${additionalNotes ? `
            <div class="field">
              <div class="field-label">Additional Notes:</div>
              <div class="field-value">${additionalNotes}</div>
            </div>
            ` : ''}

            <h2>Submission Information</h2>
            <div class="field">
              <div class="field-label">Form Submitted At:</div>
              <div class="field-value">${formattedSubmittedAt}</div>
            </div>

            <div class="alert" style="background-color: #d1ecf1; border-color: #bee5eb;">
              <strong>📋 Next Steps:</strong>
              <ol style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Verify the transaction ID on ${paymentMethod === 'Crypto (Bitcoin)' ? 'blockchain explorer' : 'payment provider dashboard'}</li>
                <li>Confirm payment amount matches $100 USD</li>
                <li>Contact client via ${phone} (WhatsApp/Telegram) or ${email}</li>
                <li>Grant access to premium services once verified</li>
              </ol>
            </div>
          </div>

          <div class="footer">
            <p>This is an automated notification from Smart-Win payment system</p>
            <p>© ${new Date().getFullYear()} Smart-Win Official. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Smart-Win Payments <onboarding@resend.dev>',
        to: [ADMIN_EMAIL],
        subject: `💰 New Payment Submission - ${paymentMethod} - ${fullName}`,
        html: emailHtml
      })
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend API Error:', resendData);
      throw new Error(resendData.message || 'Failed to send email');
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Payment notification sent successfully',
      emailId: resendData.id
    });

  } catch (error) {
    console.error('Payment notification error:', error);
    return res.status(500).json({
      error: 'Failed to send payment notification',
      details: error.message
    });
  }
}
