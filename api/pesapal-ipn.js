// Vercel Serverless Function to handle Pesapal IPN (Instant Payment Notification)
// This endpoint receives payment status updates from Pesapal

const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;
const PESAPAL_BASE_URL = process.env.PESAPAL_ENV === 'production' 
  ? 'https://pay.pesapal.com/v3'
  : 'https://cybqa.pesapal.com/pesapalv3';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export default async function handler(req, res) {
  // Handle both GET and POST from Pesapal
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get order tracking ID from query parameters
    const { OrderTrackingId, OrderMerchantReference } = req.query;

    if (!OrderTrackingId) {
      return res.status(400).json({ error: 'Missing OrderTrackingId' });
    }

    // Step 1: Get Authentication Token
    const authResponse = await fetch(`${PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        consumer_key: PESAPAL_CONSUMER_KEY,
        consumer_secret: PESAPAL_CONSUMER_SECRET
      })
    });

    const authData = await authResponse.json();
    const token = authData.token;

    // Step 2: Get Transaction Status
    const statusResponse = await fetch(
      `${PESAPAL_BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${OrderTrackingId}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const statusData = await statusResponse.json();

    // Step 3: Send email notification to admin if payment is successful
    if (statusData.payment_status_description === 'Completed' && RESEND_API_KEY) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: 'Smart Win Payments <onboarding@resend.dev>',
            to: [ADMIN_EMAIL],
            subject: '✅ Pesapal Payment Received - Smart Win',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #28a745;">✅ Payment Successful</h2>
                <p>A new payment has been received via <strong>Pesapal</strong>:</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <tr style="background-color: #f8f9fa;">
                    <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Order Reference:</strong></td>
                    <td style="padding: 10px; border: 1px solid #dee2e6;">${statusData.merchant_reference || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Transaction ID:</strong></td>
                    <td style="padding: 10px; border: 1px solid #dee2e6;">${OrderTrackingId}</td>
                  </tr>
                  <tr style="background-color: #f8f9fa;">
                    <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Amount:</strong></td>
                    <td style="padding: 10px; border: 1px solid #dee2e6;">${statusData.currency} ${statusData.amount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Payment Method:</strong></td>
                    <td style="padding: 10px; border: 1px solid #dee2e6;">${statusData.payment_method || 'Pesapal'}</td>
                  </tr>
                  <tr style="background-color: #f8f9fa;">
                    <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Status:</strong></td>
                    <td style="padding: 10px; border: 1px solid #dee2e6; color: #28a745;"><strong>${statusData.payment_status_description}</strong></td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #dee2e6;"><strong>Date:</strong></td>
                    <td style="padding: 10px; border: 1px solid #dee2e6;">${new Date().toLocaleString()}</td>
                  </tr>
                </table>
                
                <p style="color: #6c757d; font-size: 14px; margin-top: 20px;">
                  This is an automated notification from Smart Win payment system.
                </p>
              </div>
            `
          })
        });

        if (!emailResponse.ok) {
          console.error('Failed to send email notification');
        }
      } catch (emailError) {
        console.error('Email notification error:', emailError);
      }
    }

    // Return success response
    return res.status(200).json({
      success: true,
      orderTrackingId: OrderTrackingId,
      status: statusData.payment_status_description,
      transactionDetails: statusData
    });

  } catch (error) {
    console.error('Pesapal IPN error:', error);
    return res.status(500).json({ 
      error: 'IPN processing failed',
      message: error.message 
    });
  }
}
