import nodemailer from 'nodemailer';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export interface AlertData {
  userEmail: string;
  productName: string;
  productUrl: string;
  competitorName: string;
}

export interface PriceChangeData extends AlertData {
  oldPrice: string;
  newPrice: string;
  percentChange: number;
  direction: 'up' | 'down';
}

export interface BrokenLinkData extends AlertData {
  statusCode?: number;
  error?: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '2525'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendEmailAlert(to: string, alertType: 'price_change' | 'broken_link', data: PriceChangeData | BrokenLinkData): Promise<void> {
  const subject = alertType === 'price_change' 
    ? `Price Change Alert: ${data.productName}` 
    : `Broken Link Alert: ${data.productName}`;
    
  const html = alertType === 'price_change' 
    ? formatPriceChangeEmail(data as PriceChangeData) 
    : formatBrokenLinkEmail(data as BrokenLinkData);

  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html
  });
}

export async function sendTelegramAlert(chatId: string, alertType: 'price_change' | 'broken_link', data: PriceChangeData | BrokenLinkData): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return;

  const text = alertType === 'price_change' 
    ? `🔔 Price Change: ${data.productName}\nOld: ${(data as PriceChangeData).oldPrice}\nNew: ${(data as PriceChangeData).newPrice}`
    : `⚠️ Broken Link: ${data.productName}\nURL: ${data.productUrl}`;

  await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
    chat_id: chatId,
    text
  });
}

export function formatPriceChangeEmail(data: PriceChangeData): string {
  return `
    <h2>Price ${data.direction === 'up' ? 'Increased' : 'Decreased'}!</h2>
    <p>Product: <a href="${data.productUrl}">${data.productName}</a></p>
    <p>Competitor: ${data.competitorName}</p>
    <p>Old Price: ${data.oldPrice}</p>
    <p>New Price: ${data.newPrice}</p>
    <p>Change: ${data.percentChange}%</p>
  `;
}

export function formatBrokenLinkEmail(data: BrokenLinkData): string {
  return `
    <h2>Tracking Issue</h2>
    <p>We could not reach the product page for <a href="${data.productUrl}">${data.productName}</a>.</p>
    <p>Error: ${data.error} (Status: ${data.statusCode})</p>
  `;
}

export interface DigestData {
  userEmail: string;
  alerts: Array<{
    productName: string;
    productUrl: string;
    competitorName: string;
    alertType: string;
    oldValue: string | null;
    newValue: string | null;
    sentAt: Date;
  }>;
  periodLabel: string;
}

export async function sendDigestEmail(to: string, data: DigestData): Promise<void> {
  const subject = `Your Daily Competitor Tracker Digest`;
  const html = formatDigestEmail(data);

  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html
  });
}

export function formatDigestEmail(data: DigestData): string {
  const priceChanges = data.alerts.filter(a => a.alertType === 'price_change').length;
  const brokenLinks = data.alerts.filter(a => a.alertType === 'broken_link').length;
  const dashboardUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  let rows = '';
  for (const alert of data.alerts) {
    rows += `
      <tr>
        <td><a href="${alert.productUrl}">${alert.productName}</a></td>
        <td>${alert.competitorName}</td>
        <td>${alert.alertType}</td>
        <td>${alert.oldValue || '-'}</td>
        <td>${alert.newValue || '-'}</td>
        <td>${new Date(alert.sentAt).toLocaleString()}</td>
      </tr>
    `;
  }

  return `
    <h2>Your Daily Competitor Tracker Digest</h2>
    <p>${priceChanges} price changes and ${brokenLinks} broken links detected in ${data.periodLabel}</p>
    <table border="1" cellpadding="5" style="border-collapse: collapse; text-align: left;">
      <thead>
        <tr>
          <th>Product</th>
          <th>Competitor</th>
          <th>Type</th>
          <th>Old Value</th>
          <th>New Value</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    <br/>
    <a href="${dashboardUrl}" style="padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">View Dashboard</a>
  `;
}
