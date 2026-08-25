const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Tell Express to trust Render's reverse proxy
app.set('trust proxy', 1);

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));

// ==========================================
// INITIALIZATION
// ==========================================

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Configure Gmail SMTP transporter matching your Edge Functions
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

// Helper function to build download links and send luxury HTML email
async function deliverOrder(order) {
  const downloadLinks = [];

  for (const item of order.items) {
    if (item.priceType === 'code') {
      if (item.id >= 10000) {
        // Handle Value Bundle
        const realBundleId = item.id - 10000;
        const { data: bundle } = await supabase
          .from('bundles')
          .select('included_items')
          .eq('id', realBundleId)
          .single();

        if (bundle && bundle.included_items) {
          const itemsList = Array.isArray(bundle.included_items)
            ? bundle.included_items
            : JSON.parse(bundle.included_items || '[]');

          if (itemsList.length > 0) {
            const { data: bundleProducts } = await supabase
              .from('products')
              .select('title, zip_filename')
              .in('title', itemsList);

            if (bundleProducts) {
              for (const prod of bundleProducts) {
                if (prod.zip_filename) {
                  const { data: storageData } = await supabase
                    .storage
                    .from('templates')
                    .createSignedUrl(prod.zip_filename, 86400);

                  if (storageData) {
                    downloadLinks.push({ title: prod.title, url: storageData.signedUrl });
                  }
                }
              }
            }
          }
        }
      } else {
        // Handle Single Product
        const { data: product } = await supabase
          .from('products')
          .select('zip_filename')
          .eq('id', item.id)
          .single();

        if (product && product.zip_filename) {
          const { data: storageData } = await supabase
            .storage
            .from('templates')
            .createSignedUrl(product.zip_filename, 86400);

          if (storageData) {
            downloadLinks.push({ title: item.title, url: storageData.signedUrl });
          }
        }
      }
    }
  }

  // --- 1. BUILD INVOICE ROWS ---
  const invoiceRows = order.items.map(item => `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px solid #e2e8f0; color: #042416; font-weight: bold; font-size: 15px;">
        ${item.title}
        <div style="font-size: 11px; color: #718096; font-weight: normal; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
          ${item.priceType === 'ready' ? 'Ready Website' : 'Premium Code'}
        </div>
      </td>
      <td style="padding: 16px 0; border-bottom: 1px solid #e2e8f0; text-align: right; color: #042416; font-weight: bold; font-size: 15px;">
        ₹${item.price}
      </td>
    </tr>
  `).join('');

  // --- 2. BUILD DOWNLOAD SECTION ---
  let downloadSection = '';
  if (downloadLinks.length > 0) {
    const linksList = downloadLinks.map(l => `
      <a href="${l.url}" style="display: inline-block; background-color: #8b5cf6; color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-weight: bold; font-size: 14px; margin-top: 12px; margin-right: 8px; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.25);">
        ⬇ Download ${l.title} (ZIP)
      </a>
    `).join('');

    downloadSection = `
      <div style="background-color: #f8fafc; border-radius: 16px; padding: 32px; margin-top: 32px; border: 1px solid #e2e8f0;">
        <h3 style="margin: 0 0 12px; font-size: 18px; color: #042416; font-weight: 800;">Your Secure Downloads</h3>
        <p style="margin: 0 0 20px; font-size: 14px; color: #4a5568; line-height: 1.6;">These encrypted links will expire in exactly <strong>24 hours</strong>. Please download your files immediately.</p>
        ${linksList}
      </div>
    `;
  }

  // --- 3. BUILD READY WEBSITE SECTION ---
  let readySection = '';
  const hasReady = order.items.some(i => i.priceType === 'ready');
  if (hasReady) {
    readySection = `
      <div style="background-color: #ecfeff; border-radius: 16px; padding: 32px; margin-top: 32px; border: 1px solid #a5f3fc;">
        <h3 style="margin: 0 0 12px; font-size: 18px; color: #0891b2; font-weight: 800;">Ready Website Setup 🚀</h3>
        <p style="margin: 0; font-size: 14px; color: #164e63; line-height: 1.6;">Our development team has securely received your order. We will email you at this address within the next few hours to collect your photos, messages, and music links so we can start building your custom website!</p>
      </div>
    `;
  }

  // --- 4. ASSEMBLE LUXURY HTML EMAIL ---
  const orderDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  const emailHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f6f6f4; margin: 0; padding: 40px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
      <!-- Header -->
      <tr>
        <td style="padding: 40px 40px 30px; text-align: center; background-color: #042416;">
          <div style="color: #ffffff; font-weight: 900; font-size: 32px; letter-spacing: -0.5px;">
            Canvas<span style="color: #10b981;">Builds</span>
          </div>
          <div style="color: #10b981; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 10px; font-weight: bold;">
            Official Receipt
          </div>
        </td>
      </tr>

      <!-- Body Content -->
      <tr>
        <td style="padding: 40px;">
          <h1 style="margin: 0 0 12px; font-size: 26px; color: #042416; font-weight: 800; letter-spacing: -0.5px;">Thank you for your order.</h1>
          <p style="margin: 0 0 40px; font-size: 15px; color: #4a5568; line-height: 1.7;">Your payment has been successfully processed. Below is your luxurious digital receipt and your exclusive access links.</p>

          <!-- Invoice Details -->
          <div style="background-color: #ffffff; border-radius: 16px; padding: 32px; margin-bottom: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
                  <span style="font-size: 10px; color: #a0aec0; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Order ID</span><br>
                  <span style="font-size: 14px; color: #042416; font-weight: bold; margin-top: 4px; display: inline-block;">${order.razorpay_order_id}</span>
                </td>
                <td style="padding-bottom: 20px; border-bottom: 1px solid #e2e8f0; text-align: right;">
                  <span style="font-size: 10px; color: #a0aec0; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Date</span><br>
                  <span style="font-size: 14px; color: #042416; font-weight: bold; margin-top: 4px; display: inline-block;">${orderDate}</span>
                </td>
              </tr>
              
              <!-- Map through items dynamically -->
              ${invoiceRows}
              
              <tr>
                <td style="padding-top: 20px; font-size: 14px; color: #718096; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Total Paid</td>
                <td style="padding-top: 20px; text-align: right; font-size: 24px; color: #10b981; font-weight: 900;">₹${order.total_amount}</td>
              </tr>
            </table>
          </div>

          ${downloadSection}
          ${readySection}

          <div style="margin-top: 48px; text-align: center;">
            <p style="margin: 0 0 8px; font-size: 14px; color: #718096;">Need help with your template?</p>
            <a href="mailto:canvasbuildsofficial@gmail.com" style="color: #ec4899; text-decoration: underline; font-weight: bold; font-size: 14px;">Contact Support</a>
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background-color: #042416; padding: 32px 40px; text-align: center;">
          <p style="margin: 0 0 10px; font-size: 12px; color: #ffffff; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Canvas Builds</p>
          <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.6;">&copy; ${new Date().getFullYear()} Canvas Builds. All rights reserved.<br>Designed & Developed in India.</p>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  if (process.env.GMAIL_USER && process.env.GMAIL_PASSWORD) {
    await transporter.sendMail({
      from: `"Canvas Builds" <${process.env.GMAIL_USER}>`,
      to: order.customer_email,
      subject: `Your Canvas Builds Receipt & Downloads [Order ${order.razorpay_order_id.split('_')[1]}]`,
      html: emailHTML,
    });
    console.log(`✉️ Luxury email dispatched to ${order.customer_email}`);
  }
}
// ==========================================
// ROUTES
// ==========================================

const checkoutLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

// 1. INITIATE CHECKOUT
app.post('/api/checkout', checkoutLimiter, async (req, res) => {
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

    res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: amountInPaise,
      dbOrderId: dbOrder.id
    });
  } catch (error) {
    console.error('Checkout Error:', error);
    res.status(500).json({ error: 'Failed to initiate checkout' });
  }
});

// 2. INSTANT PAYMENT VERIFICATION
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    if (hmac.digest('hex') !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update({ status: 'paid', razorpay_payment_id })
      .eq('razorpay_order_id', razorpay_order_id)
      .select()
      .single();

    if (error || !order) throw new Error("Order not found in DB");

    // 🚨 FIX: Prevent email errors from ruining the checkout UI 🚨
    try {
      await deliverOrder(order);
    } catch (emailErr) {
      console.error('SMTP Email Error (Order is still Paid):', emailErr);
    }

    // Always return success if the database updated!
    res.status(200).json({ success: true, orderId: order.id });
  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ success: false, error: 'Payment verification failed' });
  }
});

// 3. RAZORPAY WEBHOOK (Production Fallback)
app.post('/api/webhook/razorpay', async (req, res) => {
  try {
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET);
    shasum.update(req.rawBody);
    if (shasum.digest('hex') !== req.headers['x-razorpay-signature']) {
      return res.status(400).json({ error: 'Invalid Signature' });
    }

    const event = req.body.event;
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;

      const { data: order, error } = await supabase
        .from('orders')
        .update({ status: 'paid', razorpay_payment_id: paymentEntity.id })
        .eq('razorpay_order_id', razorpayOrderId)
        .select()
        .single();

      if (order && order.status !== 'paid') {
        await deliverOrder(order);
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ error: 'Webhook failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Canvas Builds running on port ${PORT} with Gmail SMTP delivery`);
});