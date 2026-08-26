import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

// 1. Declare empty variables at the top
let supabase;
let razorpay;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. "Lazy Initialize" inside the handler! 
  // Vercel will have fully loaded the .env.local file by the time this runs.
  if (!supabase) {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  try {
    const { items, customerEmail, userId, promoCode } = req.body;

    if (!items || items.length === 0 || !customerEmail) {
      return res.status(400).json({ error: 'Missing items or email' });
    }

    let totalAmountInRupees = items.reduce((sum, item) => sum + item.price, 0);
    let discountAmount = 0;
    let appliedPromo = null;

    // Secure Server-Side Promo Verification
    if (promoCode) {
      const { data: promo } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (promo && promo.current_uses < promo.max_uses) {
        discountAmount = Math.round(totalAmountInRupees * (promo.discount_percentage / 100));
        totalAmountInRupees -= discountAmount;
        appliedPromo = promo.code;
      } else {
        return res.status(400).json({ error: 'Invalid or expired promo code.' });
      }
    }

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
        discount_amount: discountAmount,
        applied_promo_code: appliedPromo,
        status: 'pending',
        razorpay_order_id: razorpayOrder.id,
        fulfillment_status: 'pending'
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