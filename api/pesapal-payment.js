// Vercel Serverless Function to initiate Pesapal payment
// Handles both Mobile Money and Card payments through Pesapal

const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;
const PESAPAL_IPN_URL = process.env.PESAPAL_IPN_URL || 'https://smartwinofficial.co.uk/api/pesapal-ipn';
const PESAPAL_BASE_URL = process.env.PESAPAL_ENV === 'production' 
  ? 'https://pay.pesapal.com/v3'
  : 'https://cybqa.pesapal.com/pesapalv3'; // Demo environment

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      amount, 
      currency = 'USD',
      description,
      firstName,
      lastName,
      email,
      phoneNumber,
      paymentMethod // 'mobile' or 'card'
    } = req.body;

    // Validate required fields
    if (!amount || !email || !firstName || !lastName) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['amount', 'email', 'firstName', 'lastName']
      });
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

    if (!authResponse.ok) {
      throw new Error('Failed to authenticate with Pesapal');
    }

    const authData = await authResponse.json();
    const token = authData.token;

    // Step 2: Register IPN URL (only needed once, but safe to repeat)
    const ipnResponse = await fetch(`${PESAPAL_BASE_URL}/api/URLSetup/RegisterIPN`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        url: PESAPAL_IPN_URL,
        ipn_notification_type: 'GET'
      })
    });

    const ipnData = await ipnResponse.json();
    const ipn_id = ipnData.ipn_id || 'default-ipn-id';

    // Step 3: Submit Order Request
    const orderReference = `SMARTWIN-${Date.now()}`;
    const orderData = {
      id: orderReference,
      currency: currency,
      amount: parseFloat(amount),
      description: description || `Smart Win Payment - ${paymentMethod === 'mobile' ? 'Mobile Money' : 'Card Payment'}`,
      callback_url: `https://smartwinofficial.co.uk/payment-success?ref=${orderReference}`,
      notification_id: ipn_id,
      billing_address: {
        email_address: email,
        phone_number: phoneNumber || '',
        country_code: 'KE', // Default to Kenya, adjust as needed
        first_name: firstName,
        middle_name: '',
        last_name: lastName,
        line_1: '',
        line_2: '',
        city: '',
        state: '',
        postal_code: '',
        zip_code: ''
      }
    };

    const submitResponse = await fetch(`${PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      throw new Error(`Failed to submit order: ${errorText}`);
    }

    const submitData = await submitResponse.json();

    // Return payment URL to redirect user
    return res.status(200).json({
      success: true,
      orderTrackingId: submitData.order_tracking_id,
      merchantReference: submitData.merchant_reference,
      redirectUrl: submitData.redirect_url,
      message: 'Payment initiated successfully'
    });

  } catch (error) {
    console.error('Pesapal payment error:', error);
    return res.status(500).json({ 
      error: 'Payment initiation failed',
      message: error.message,
      details: 'Please check your payment details and try again'
    });
  }
}
