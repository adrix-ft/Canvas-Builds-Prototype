import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { items, customerEmail, userId } = req.body;
    if (!items || items.length === 0 || !customerEmail) {
      return res.status(400).json({ error: 'Missing items or email' });
    }

    const totalAmountInRupees = items.reduce((sum, item) => sum + item.price, 0);
    const amountInPaise = Math.round(totalAmountInRupees * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`
    });

    const { data: dbOrder, error } = await supabase
      .from('orders')
      .insert([{
        user_id: userId || null,
        customer_email: customerEmail,
        items: items,
        total_amount: totalAmountInRupees,
        status: 'pending',
        razorpay_order_id: razorpayOrder.id
      }])
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: amountInPaise,
      dbOrderId: dbOrder.id
    });
  } catch (error) {
    console.error('Checkout Error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to initiate checkout' });
  }
}