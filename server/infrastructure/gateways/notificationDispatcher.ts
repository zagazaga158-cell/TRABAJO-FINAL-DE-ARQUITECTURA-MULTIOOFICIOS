import nodemailer from 'nodemailer';
import { normalizePhone, type ChannelDispatchStatus } from '../../domain/entities';
import type { NotificationDispatcher } from '../../domain/ports';

/**
 * Despachador Multicanal de Notificaciones (Patrones Adapter + Chain of Responsibility)
 * Cadena de degradación resiliente:
 *   Email: SMTP (Nodemailer) -> Webhook -> Cola segura del servidor
 *   WhatsApp: Meta Cloud API v20 -> Webhook -> Cola segura + Chat In-App
 */
export class MultiChannelNotificationDispatcher implements NotificationDispatcher {
  async sendEmail(params: {
    ordenId: string;
    emails: string[];
    subject?: string;
    body?: string;
  }): Promise<ChannelDispatchStatus> {
    const status: ChannelDispatchStatus = {
      sent: false,
      queued: true,
      to: params.emails,
      detail:
        'En cola automática del servidor (configura SMTP_USER/SMTP_PASS o EMAIL_WEBHOOK_URL para envío externo directo).'
    };

    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPass = process.env.SMTP_PASS?.trim();
    const emailWebhookUrl = process.env.EMAIL_WEBHOOK_URL?.trim();

    if (params.emails.length > 0 && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: Number(process.env.SMTP_PORT || 587),
          secure: Number(process.env.SMTP_PORT || 587) === 465,
          auth: { user: smtpUser, pass: smtpPass }
        });
        await transporter.sendMail({
          from: process.env.SMTP_FROM || smtpUser,
          to: params.emails.join(', '),
          subject: String(params.subject || `Nueva solicitud ${params.ordenId}`),
          text: String(params.body || '')
        });
        return {
          sent: true,
          queued: false,
          to: params.emails,
          detail: `Correo enviado automáticamente vía SMTP a ${params.emails.join(', ')}.`
        };
      } catch (err: any) {
        return {
          sent: false,
          queued: true,
          to: params.emails,
          detail: `Error SMTP: ${err?.message || 'No se pudo conectar al servidor de correo.'}`
        };
      }
    }

    if (params.emails.length > 0 && emailWebhookUrl) {
      try {
        const hookRes = await fetch(emailWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: params.emails,
            subject: params.subject,
            text: params.body,
            ordenId: params.ordenId
          })
        });
        if (hookRes.ok) {
          return {
            sent: true,
            queued: false,
            to: params.emails,
            detail: `Correo enviado automáticamente vía webhook a ${params.emails.join(', ')}.`
          };
        }
        status.detail = `Webhook de correo devolvió estado ${hookRes.status}.`;
      } catch (err: any) {
        status.detail = `Error en webhook de correo: ${err?.message || 'fallo de red'}`;
      }
    }

    return status;
  }

  async sendWhatsApp(params: {
    ordenId: string;
    phones: string[];
    message?: string;
  }): Promise<ChannelDispatchStatus> {
    const status: ChannelDispatchStatus = {
      sent: false,
      queued: true,
      to: params.phones,
      detail:
        'En cola automática del servidor + entregado en Chat de la App (configura WHATSAPP_PHONE_NUMBER_ID y WHATSAPP_ACCESS_TOKEN para envío API externo).'
    };

    const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
    const waToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
    const waWebhookUrl = process.env.WHATSAPP_WEBHOOK_URL?.trim();

    if (params.phones.length > 0 && waPhoneId && waToken) {
      try {
        const results = await Promise.all(
          params.phones.map(async tel => {
            const digits = normalizePhone(tel);
            const fullNumber = digits.startsWith('51') ? digits : `51${digits}`;
            const resp = await fetch(`https://graph.facebook.com/v20.0/${waPhoneId}/messages`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${waToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: fullNumber,
                type: 'text',
                text: { body: String(params.message || '') }
              })
            });
            return resp.ok;
          })
        );
        if (results.every(Boolean)) {
          return {
            sent: true,
            queued: false,
            to: params.phones,
            detail: `WhatsApp enviado automáticamente vía Cloud API a +51 ${params.phones.join(', +51 ')}.`
          };
        }
        status.detail =
          'WhatsApp Cloud API rechazó uno o más destinatarios; el mensaje quedó entregado en el Chat de la App.';
      } catch (err: any) {
        status.detail = `Error WhatsApp API: ${err?.message || 'fallo de red'}`;
      }
      return status;
    }

    if (params.phones.length > 0 && waWebhookUrl) {
      try {
        const hookRes = await fetch(waWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phones: params.phones,
            message: params.message,
            ordenId: params.ordenId
          })
        });
        if (hookRes.ok) {
          return {
            sent: true,
            queued: false,
            to: params.phones,
            detail: `WhatsApp enviado automáticamente vía webhook a +51 ${params.phones.join(', +51 ')}.`
          };
        }
        status.detail = `Webhook WhatsApp devolvió estado ${hookRes.status}.`;
      } catch (err: any) {
        status.detail = `Error webhook WhatsApp: ${err?.message || 'fallo de red'}`;
      }
    }

    return status;
  }
}
