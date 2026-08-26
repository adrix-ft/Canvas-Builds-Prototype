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

  // 2. Build Invoice Rows with Visual Thumbnails
  const invoiceRows = order.items.map(item => `
    <tr>
      <td style="padding: 14px 0; border-bottom: 1px solid #e2e8f0; width: 65%; vertical-align: top;" class="border-color">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <!-- Product Thumbnail Emoji -->
            <td width="28" style="vertical-align: top; padding-top: 1px; font-size: 18px;">
              ${item.priceType === 'ready' ? '🚀' : '💻'}
            </td>
            <td style="vertical-align: top;">
              <span class="text-primary" style="color: #042416; font-weight: bold; font-size: 14px; word-break: break-word;">${item.title}</span>
              <div class="text-secondary" style="font-size: 10px; color: #718096; font-weight: normal; margin-top: 3px; text-transform: uppercase; letter-spacing: 0.5px;">
                ${item.priceType === 'ready' ? 'Ready Website' : 'Premium Code'}
              </div>
            </td>
          </tr>
        </table>
      </td>
      <td class="text-primary border-color" style="padding: 14px 0; border-bottom: 1px solid #e2e8f0; text-align: right; color: #042416; font-weight: bold; font-size: 14px; white-space: nowrap; vertical-align: top;">
        ₹${item.price}
      </td>
    </tr>
  `).join('');

  // 3. Build Download Section with Documentation Links
  let downloadSection = '';
  if (downloadLinks.length > 0) {
    const linksList = downloadLinks.map(l => `
      <a href="${l.url}" style="display: block; background-color: #8b5cf6; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 12px; font-weight: bold; font-size: 13px; margin-top: 10px; text-align: center; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.2);">
        ⬇ Download ${l.title} (ZIP)
      </a>
    `).join('');

    downloadSection = `
      <div class="card-bg border-color" style="background-color: #f8fafc; border-radius: 16px; padding: 20px 16px; margin-top: 24px; border: 1px solid #e2e8f0;">
        <h3 class="text-primary" style="margin: 0 0 8px; font-size: 16px; color: #042416; font-weight: 800;">Your Secure Downloads</h3>
        <p class="text-secondary" style="margin: 0 0 12px; font-size: 13px; color: #4a5568; line-height: 1.5;">⏱️ Links expire in <strong>24 hours</strong>. Please download your files immediately.</p>
        ${linksList}
        ${hasSourceCode ? `
        <div style="text-align: center; margin-top: 16px;">
          <a href="https://canvas-builds-prototype.vercel.app/faq" style="font-size: 12px; color: #8b5cf6; text-decoration: underline; font-weight: bold;">Need help? Read our 5-minute deployment guide &rarr;</a>
        </div>
        ` : ''}
      </div>
    `;
  }

  // 4. Build Ready Website Section
  let readySection = '';
  const hasReady = order.items.some(i => i.priceType === 'ready');
  if (hasReady) {
    readySection = `
      <div style="background-color: #ecfeff; border-radius: 16px; padding: 20px 16px; margin-top: 24px; border: 1px solid #a5f3fc;">
        <h3 style="margin: 0 0 8px; font-size: 16px; color: #0891b2; font-weight: 800;">Ready Website Setup 🚀</h3>
        <p style="margin: 0; font-size: 13px; color: #164e63; line-height: 1.5;">Our team has received your order. We will reach out to this email address shortly to collect your custom photos and links!</p>
      </div>
    `;
  }

  // 5. Personalization Logic
  let customerName = "there";
  let accountBadge = "";

  if (order.user_id) {
    try {
      const { data: authData } = await supabase.auth.admin.getUserById(order.user_id);
      if (authData?.user?.user_metadata?.full_name) {
        customerName = authData.user.user_metadata.full_name.split(' ')[0];
      } else {
        customerName = order.customer_email.split('@')[0];
        customerName = customerName.charAt(0).toUpperCase() + customerName.slice(1);
      }
      
      accountBadge = `
        <div style="background-color: #ecfeff; border: 1px solid #a5f3fc; padding: 10px 14px; border-radius: 12px; margin-bottom: 24px; display: inline-block;">
          <span style="font-size: 10px; color: #0891b2; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">👤 Verified Member Account</span><br>
          <span style="font-size: 13px; color: #164e63; font-weight: bold; margin-top: 4px; display: inline-block;">${order.customer_email}</span>
        </div>
      `;
    } catch (e) {
      console.error("Failed to fetch user metadata:", e);
    }
  } else {
    accountBadge = `
      <div class="card-bg border-color" style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 12px; margin-bottom: 24px; display: inline-block;">
        <span class="text-secondary" style="font-size: 10px; color: #64748b; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">🛒 Guest Checkout</span><br>
        <span class="text-primary" style="font-size: 13px; color: #334155; font-weight: bold; margin-top: 4px; display: inline-block;">${order.customer_email}</span>
      </div>
    `;
  }

  const orderDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  
  // 6. Assemble HTML with Dark Mode Support
  const emailHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <style>
      body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f6f6f4; }
      table { border-collapse: collapse; }
      .wrapper { width: 100%; max-width: 540px; margin: 0 auto; padding: 24px 12px; box-sizing: border-box; }
      .container { background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 8px 16px rgba(0,0,0,0.05); }
      
      @media only screen and (max-width: 600px) {
        .wrapper { padding: 16px 8px !important; }
        .container { border-radius: 20px !important; }
        .mobile-padding { padding: 24px 16px !important; }
        .card-padding { padding: 16px 14px !important; }
      }

      /* Dark Mode Overrides */
      @media (prefers-color-scheme: dark) {
        body, .wrapper { background-color: #020617 !important; }
        .container { background-color: #0f172a !important; border-color: #1e293b !important; }
        .text-primary { color: #f8fafc !important; }
        .text-secondary { color: #94a3b8 !important; }
        .border-color { border-color: #334155 !important; }
        .card-bg { background-color: #1e293b !important; }
      }
    </style>
  </head>
  <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f6f6f4; margin: 0; padding: 0; -webkit-text-size-adjust: 100%;">
    <div class="wrapper">
      <div class="container" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          
          <!-- Header with Actual Logo -->
          <tr>
            <td class="mobile-padding" style="padding: 32px 24px 24px; text-align: center; background-color: #042416;">
              <img src="https://canvas-builds-prototype.vercel.app/icon2.png" alt="Canvas Builds" width="48" height="48" style="display: block; margin: 0 auto 12px; border-radius: 12px;">
              <div style="color: #ffffff; font-weight: 900; font-size: 24px; letter-spacing: -0.5px;">Canvas<span style="color: #10b981;">Builds</span></div>
            </td>
          </tr>
          
          <!-- Body Content -->
          <tr>
            <td class="mobile-padding" style="padding: 32px 24px;">
              ${accountBadge}

              <h1 class="text-primary" style="margin: 0 0 8px; font-size: 22px; color: #042416; font-weight: 800; letter-spacing: -0.5px;">Hi ${customerName}, thanks for your order!</h1>
              <p class="text-secondary" style="margin: 0 0 24px; font-size: 14px; color: #4a5568; line-height: 1.6;">Your payment has been successfully processed. Here is your receipt and access links.</p>

              <!-- Invoice Details Card -->
              <div class="card-bg border-color card-padding" style="background-color: #ffffff; border-radius: 16px; padding: 20px 16px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
                <table width="100%" cellpadding="0" cellspacing="0" style="table-layout: fixed;">
                  <tr>
                    <td class="border-color" style="padding-bottom: 14px; border-bottom: 1px solid #e2e8f0; width: 60%; word-break: break-all; vertical-align: top;">
                      <span class="text-secondary" style="font-size: 9px; color: #a0aec0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold;">Order ID</span><br>
                      <span class="text-primary" style="font-size: 12px; color: #042416; font-weight: bold; margin-top: 2px; display: inline-block;">${order.razorpay_order_id}</span>
                    </td>
                    <td class="border-color" style="padding-bottom: 14px; border-bottom: 1px solid #e2e8f0; text-align: right; width: 40%; vertical-align: top;">
                      <span class="text-secondary" style="font-size: 9px; color: #a0aec0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold;">Date</span><br>
                      <span class="text-primary" style="font-size: 12px; color: #042416; font-weight: bold; margin-top: 2px; display: inline-block;">${orderDate}</span>
                    </td>
                  </tr>
                  
                  <!-- Dynamic Items -->
                  ${invoiceRows}
                  
                  <tr>
                    <td style="padding-top: 14px; font-size: 13px; color: #718096; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Total Paid</td>
                    <td style="padding-top: 14px; text-align: right; font-size: 18px; color: #10b981; font-weight: 900;">₹${order.total_amount}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding-top: 16px; text-align: center;">
                      <a href="https://canvas-builds-prototype.vercel.app/account" style="font-size: 11px; color: #a0aec0; text-decoration: underline;">View Invoice Online</a>
                    </td>
                  </tr>
                </table>
              </div>

              ${downloadSection}
              ${readySection}

            </td>
          </tr>

          <!-- Founder's Note & Social Footer -->
          <tr>
            <td class="mobile-padding" style="background-color: #042416; padding: 32px 24px; text-align: center;">
              
              <!-- Founder's Note -->
              <p style="margin: 0 0 24px; font-size: 13px; color: #94a3b8; line-height: 1.6; font-style: italic; padding: 0 10px;">
                "Thank you for supporting an indie developer. I hope this template makes their day truly special!" <br><br>— Adarsh
              </p>

              <!-- Social Footprint -->
              <div style="margin-bottom: 20px;">
                <a href="https://www.instagram.com/canvas_builds?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" style="display: inline-block; margin: 0 8px; text-decoration: none;">
                  <img src="https://cdn.simpleicons.org/instagram/ffffff" alt="Instagram" width="20" height="20" style="opacity: 0.8;">
                </a>
                <a href="https://wa.me/917906568743" style="display: inline-block; margin: 0 8px; text-decoration: none;">
                  <img src="https://cdn.simpleicons.org/whatsapp/25D366" alt="WhatsApp" width="20" height="20" style="opacity: 0.8;">
                </a>
              </div>

              <!-- Copyright -->
              <p style="margin: 0; font-size: 10px; color: #475569; line-height: 1.5; text-transform: uppercase; letter-spacing: 1px;">
                &copy; ${new Date().getFullYear()} Canvas Builds. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </div>
    </div>
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