import { Resend } from 'resend';

const resend = new Resend('re_ABFq2wQz_KfWARUE3h6yVoAcPrMFJz2oR');

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      paymentMethod,
      name,
      email,
      phone,
      amount,
      transactionId,
      paymentDateTime,
      service // For mobile money
    } = req.body;

    // Validate required fields
    if (!paymentMethod || !name || !email || !phone || !amount || !transactionId || !paymentDateTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Format the payment date
    const formattedDate = new Date(paymentDateTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    // Build email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ee1e46 0%, #c71939 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .info-row { margin: 15px 0; padding: 15px; background: white; border-left: 4px solid #ee1e46; border-radius: 4px; }
          .label { font-weight: bold; color: #ee1e46; margin-bottom: 5px; }
          .value { color: #333; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 0.9em; }
          .highlight { background: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #ffc107; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">💰 New Payment Submission</h1>
            <p style="margin: 10px 0 0 0;">Smart-Win Consultation Fee</p>
          </div>
          <div class="content">
            <div class="highlight">
              <strong>⚠️ Action Required:</strong> Please verify this ${paymentMethod} payment manually.
            </div>

            <h2 style="color: #ee1e46; margin-top: 0;">Payment Details</h2>
            
            <div class="info-row">
              <div class="label">Payment Method</div>
              <div class="value">${paymentMethod}</div>
            </div>

            ${service ? `
            <div class="info-row">
              <div class="label">Mobile Money Service</div>
              <div class="value">${service}</div>
            </div>
            ` : ''}

            <div class="info-row">
              <div class="label">Transaction ID / Reference</div>
              <div class="value" style="font-family: monospace; background: #e9ecef; padding: 8px; border-radius: 4px;">${transactionId}</div>
            </div>

            <div class="info-row">
              <div class="label">Amount</div>
              <div class="value" style="font-size: 1.2em; color: #28a745; font-weight: bold;">$${amount} USD</div>
            </div>

            <div class="info-row">
              <div class="label">Payment Date & Time</div>
              <div class="value">${formattedDate}</div>
            </div>

            <h2 style="color: #ee1e46; margin-top: 30px;">Customer Information</h2>
            
            <div class="info-row">
              <div class="label">Full Name</div>
              <div class="value">${name}</div>
            </div>

            <div class="info-row">
              <div class="label">Email Address</div>
              <div class="value"><a href="mailto:${email}" style="color: #ee1e46;">${email}</a></div>
            </div>

            <div class="info-row">
              <div class="label">Phone Number (WhatsApp/Telegram)</div>
              <div class="value"><a href="tel:${phone}" style="color: #ee1e46;">${phone}</a></div>
            </div>

            <div style="margin-top: 30px; padding: 20px; background: #e7f3ff; border-radius: 4px; border-left: 4px solid #0066cc;">
              <strong>Next Steps:</strong>
              <ol style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Verify the transaction using the Transaction ID above</li>
                <li>Confirm payment receipt</li>
                <li>Contact customer via WhatsApp/Telegram: ${phone}</li>
                <li>Send confirmation email to: ${email}</li>
                <li>Provide access to premium match intelligence</li>
              </ol>
            </div>

            <div class="footer">
              <p><strong>Smart-Win Official</strong></p>
              <p>Premium Match Intelligence Platform</p>
              <p style="font-size: 0.85em; color: #999;">This is an automated notification from your payment system.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Smart-Win Payments <payments@resend.dev>',
      to: ['info@smartwinofficial.co.uk'],
      subject: `New ${paymentMethod} Payment - $${amount} from ${name}`,
      html: emailHtml,
      reply_to: email
    });

    if (error) {
      console.error('Resend API error:', error);
      return res.status(500).json({ error: 'Failed to send email', details: error });
    }

    console.log('Email sent successfully:', data);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Payment details submitted successfully',
      emailId: data.id
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
