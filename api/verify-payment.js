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
  let hasSourceCode = false;

  // 1. Process files and generate secure links
  for (const item of order.items) {
    if (item.priceType === 'code') {
      hasSourceCode = true;
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

  // 2. Fetch Logo for Instant Embedding (Bypasses Image Blockers)
  let logoAttachment = [];
  try {
    const logoRes = await fetch("https://canvas-builds-prototype.vercel.app/icon2.png");
    if (logoRes.ok) {
      const arrayBuffer = await logoRes.arrayBuffer();
      logoAttachment = [{
        filename: 'logo.png',
        content: Buffer.from(arrayBuffer),
        cid: 'brandlogo' // This matches the src in the HTML
      }];
    }
  } catch (e) {
    console.error("Failed to fetch logo for embedding:", e);
  }

  // 3. Build Sleek Invoice Rows
  const invoiceRows = order.items.map(item => `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px dashed #cbd5e1; width: 70%; vertical-align: middle;">
        <span class="text-primary" style="color: #0f172a; font-weight: 700; font-size: 15px; display: block; margin-bottom: 4px;">
          ${item.priceType === 'ready' ? '🚀' : '💻'} ${item.title}
        </span>
        <span class="text-secondary" style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
          ${item.priceType === 'ready' ? 'Ready Website Service' : 'Premium Source Code'}
        </span>
      </td>
      <td class="text-primary" style="padding: 16px 0; border-bottom: 1px dashed #cbd5e1; text-align: right; color: #0f172a; font-weight: 600; font-size: 15px; white-space: nowrap; vertical-align: middle;">
        ₹${item.price}
      </td>
    </tr>
  `).join('');

  // 4. Build Download Section
  let downloadSection = '';
  if (downloadLinks.length > 0) {
    const linksList = downloadLinks.map(l => `
      <a href="${l.url}" style="display: block; background-color: #8b5cf6; color: #ffffff; text-decoration: none; padding: 14px 20px; border-radius: 10px; font-weight: bold; font-size: 14px; margin-top: 12px; text-align: center;">
        Download ${l.title}
      </a>
    `).join('');

    downloadSection = `
      <div class="card-bg border-color" style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-top: 32px; border: 1px solid #e2e8f0;">
        <h3 class="text-primary" style="margin: 0 0 8px; font-size: 16px; color: #0f172a; font-weight: 800;">Secure Downloads</h3>
        <p class="text-secondary" style="margin: 0 0 16px; font-size: 13px; color: #475569; line-height: 1.5;">⏱️ Links expire in exactly <strong>24 hours</strong>.</p>
        ${linksList}
        ${hasSourceCode ? `
        <div style="text-align: center; margin-top: 20px;">
          <a href="https://canvas-builds-prototype.vercel.app/faq" style="font-size: 13px; color: #8b5cf6; text-decoration: none; font-weight: 600;">Read our deployment guide &rarr;</a>
        </div>
        ` : ''}
      </div>
    `;
  }

  // 5. Build Ready Website Section
  let readySection = '';
  const hasReady = order.items.some(i => i.priceType === 'ready');
  if (hasReady) {
    readySection = `
      <div style="background-color: #f0fdfa; border-radius: 12px; padding: 24px; margin-top: 32px; border: 1px solid #ccfbf1;">
        <h3 style="margin: 0 0 8px; font-size: 16px; color: #0f766e; font-weight: 800;">Next Steps: Ready Website 🚀</h3>
        <p style="margin: 0; font-size: 13px; color: #115e59; line-height: 1.6;">We've received your order! Please check your WhatsApp or reply to this email so we can collect your custom photos and details to start building.</p>
      </div>
    `;
  }

  // 6. Personalization
  let customerName = "there";
  if (order.user_id) {
    try {
      const { data: authData } = await supabase.auth.admin.getUserById(order.user_id);
      if (authData?.user?.user_metadata?.full_name) {
        customerName = authData.user.user_metadata.full_name.split(' ')[0];
      } else {
        customerName = order.customer_email.split('@')[0];
        customerName = customerName.charAt(0).toUpperCase() + customerName.slice(1);
      }
    } catch (e) {
      console.error("Failed to fetch user metadata:", e);
    }
  } else {
    customerName = order.customer_email.split('@')[0];
    customerName = customerName.charAt(0).toUpperCase() + customerName.slice(1);
  }

  const orderDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  
  // 7. Assemble Premium HTML
  const emailHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <style>
      body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f1f5f9; }
      table { border-collapse: collapse; }
      .wrapper { width: 100%; max-width: 600px; margin: 0 auto; padding: 40px 20px; box-sizing: border-box; }
      .container { background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04); }
      
      @media only screen and (max-width: 600px) {
        .wrapper { padding: 20px 10px !important; }
        .container { border-radius: 12px !important; }
        .mobile-padding { padding: 24px 20px !important; }
      }

      /* Dark Mode Overrides */
      @media (prefers-color-scheme: dark) {
        body, .wrapper { background-color: #020617 !important; }
        .container { background-color: #0f172a !important; border: 1px solid #1e293b !important; box-shadow: none !important; }
        .text-primary { color: #f8fafc !important; }
        .text-secondary { color: #94a3b8 !important; }
        .border-color { border-color: #334155 !important; }
        .card-bg { background-color: #1e293b !important; }
      }
    </style>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; -webkit-text-size-adjust: 100%;">
    <div class="wrapper">
      <div class="container" style="background-color: #ffffff; border-radius: 16px; overflow: hidden;">
        <table width="100%" cellpadding="0" cellspacing="0">
          
          <!-- Header -->
          <tr>
            <td class="mobile-padding" style="padding: 40px 40px 0; text-align: center;">
              <img src="cid:brandlogo" alt="Canvas Builds" width="56" height="56" style="display: block; margin: 0 auto 16px; border-radius: 14px;">
              <h1 class="text-primary" style="margin: 0 0 8px; font-size: 24px; color: #0f172a; font-weight: 800; letter-spacing: -0.5px;">Receipt from Canvas Builds</h1>
              <p class="text-secondary" style="margin: 0; font-size: 15px; color: #64748b;">Receipt #${order.razorpay_order_id.split('_')[1] || order.razorpay_order_id}</p>
            </td>
          </tr>
          
          <!-- Body Content -->
          <tr>
            <td class="mobile-padding" style="padding: 40px;">
              <p class="text-primary" style="margin: 0 0 24px; font-size: 16px; color: #334155; line-height: 1.6;">Hi ${customerName},</p>
              <p class="text-secondary" style="margin: 0 0 32px; font-size: 15px; color: #475569; line-height: 1.6;">Thank you for your purchase. Your payment was successfully processed on ${orderDate}.</p>

              <!-- Stripe-style Invoice Table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                ${invoiceRows}
                <tr>
                  <td style="padding: 20px 0 0; font-size: 13px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Total Paid</td>
                  <td class="text-primary" style="padding: 20px 0 0; text-align: right; font-size: 20px; color: #0f172a; font-weight: 800;">₹${order.total_amount}</td>
                </tr>
              </table>

              <div style="text-align: center; margin-top: 32px;">
                <a href="https://canvas-builds-prototype.vercel.app/account" style="display: inline-block; padding: 10px 20px; background-color: #f1f5f9; color: #475569; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 600; border: 1px solid #e2e8f0;" class="card-bg text-primary border-color">View Invoice Online</a>
              </div>

              ${downloadSection}
              ${readySection}

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="mobile-padding border-color" style="padding: 32px 40px; text-align: center; border-top: 1px solid #f1f5f9;">
              <p class="text-secondary" style="margin: 0 0 24px; font-size: 14px; color: #64748b; line-height: 1.6; font-style: italic;">
                "Thank you for supporting my work as an indie developer. I hope this template makes their day truly special!"<br><br>— Adarsh
              </p>

              <div style="margin-bottom: 16px;">
                <a href="https://wa.me/917906568743" style="display: inline-block; margin: 0 8px; text-decoration: none; color: #10b981; font-weight: bold; font-size: 13px;">WhatsApp Support</a>
                <span style="color: #cbd5e1;">|</span>
                <a href="https://www.instagram.com/canvas_builds?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" style="display: inline-block; margin: 0 8px; text-decoration: none; color: #8b5cf6; font-weight: bold; font-size: 13px;">Instagram</a>
              </div>

              <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                &copy; ${new Date().getFullYear()} Canvas Builds.<br>Sent to ${order.customer_email}
              </p>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </body>
  </html>`;

  // 8. Send the email with the logo attachment
  if (process.env.GMAIL_USER && process.env.GMAIL_PASSWORD) {
    const mailOptions = {
      from: `"Canvas Builds" <${process.env.GMAIL_USER}>`,
      to: order.customer_email,
      subject: `Receipt & Downloads from Canvas Builds [#${order.razorpay_order_id.split('_')[1] || order.razorpay_order_id}]`,
      html: emailHTML,
    };

    // Only attach the logo if the fetch was successful
    if (logoAttachment.length > 0) {
      mailOptions.attachments = logoAttachment;
    } else {
      // Fallback to external URL if fetch fails
      mailOptions.html = mailOptions.html.replace('cid:brandlogo', 'https://canvas-builds-prototype.vercel.app/icon2.png');
    }

    await transporter.sendMail(mailOptions);
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