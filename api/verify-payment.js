import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, 
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

async function deliverOrder(order) {
  const downloadLinks = [];

  for (const item of order.items) {
    if (item.priceType === 'code') {
      if (item.id >= 10000) {
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

  let readySection = '';
  const hasReady = order.items.some(i => i.priceType === 'ready');
  if (hasReady) {
    readySection = `
      <div style="background-color: #ecfeff; border-radius: 16px; padding: 32px; margin-top: 32px; border: 1px solid #a5f3fc;">
        <h3 style="margin: 0 0 12px; font-size: 18px; color: #0891b2; font-weight: 800;">Ready Website Setup 🚀</h3>
        <p style="margin: 0; font-size: 14px; color: #164e63; line-height: 1.6;">Our team has received your order. We will reach out shortly to collect your custom photos and links!</p>
      </div>
    `;
  }

  const orderDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  const emailHTML = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
  <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f6f6f4; margin: 0; padding: 40px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
      <tr>
        <td style="padding: 40px 40px 30px; text-align: center; background-color: #042416;">
          <div style="color: #ffffff; font-weight: 900; font-size: 32px; letter-spacing: -0.5px;">Canvas<span style="color: #10b981;">Builds</span></div>
          <div style="color: #10b981; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 10px; font-weight: bold;">Official Receipt</div>
        </td>
      </tr>
      <tr>
        <td style="padding: 40px;">
          <h1 style="margin: 0 0 12px; font-size: 26px; color: #042416; font-weight: 800; letter-spacing: -0.5px;">Thank you for your order.</h1>
          <p style="margin: 0 0 40px; font-size: 15px; color: #4a5568; line-height: 1.7;">Your payment has been successfully processed.</p>
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
              ${invoiceRows}
              <tr>
                <td style="padding-top: 20px; font-size: 14px; color: #718096; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Total Paid</td>
                <td style="padding-top: 20px; text-align: right; font-size: 24px; color: #10b981; font-weight: 900;">₹${order.total_amount}</td>
              </tr>
            </table>
          </div>
          ${downloadSection}
          ${readySection}
        </td>
      </tr>
      <tr>
        <td style="background-color: #042416; padding: 32px 40px; text-align: center;">
          <p style="margin: 0 0 10px; font-size: 12px; color: #ffffff; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Canvas Builds</p>
          <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.6;">&copy; ${new Date().getFullYear()} Canvas Builds. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </body>
  </html>`;

  if (process.env.GMAIL_USER && process.env.GMAIL_PASSWORD) {
    await transporter.sendMail({
      from: `"Canvas Builds" <${process.env.GMAIL_USER}>`,
      to: order.customer_email,
      subject: `Your Canvas Builds Receipt & Downloads [Order ${order.razorpay_order_id.split('_')[1] || order.razorpay_order_id}]`,
      html: emailHTML,
    });
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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

    if (error || !order) throw new Error("Order not found in database");

    try {
      await deliverOrder(order);
    } catch (emailErr) {
      console.error('SMTP Email Error (Order is still Paid):', emailErr);
    }

    return res.status(200).json({ success: true, orderId: order.id });
  } catch (error) {
    console.error('Verification Error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Payment verification failed' });
  }
}