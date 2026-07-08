export interface NotificationPayload {
  userId: string;
  type: 'WEATHER_ALERT' | 'EXPERT_ESCALATION';
  title: string;
  message: string;
  channels?: ('sms' | 'whatsapp' | 'email' | 'push')[];
}

/**
 * Modular Notification Service
 * Dispatches alerts, emails, push alerts, or webhooks.
 * Designed to be easily expanded for WhatsApp/SMS later.
 */
export async function sendNotification(payload: NotificationPayload) {
  console.log(`[Notification Service] Modular Dispatch:`, {
    userId: payload.userId,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    activeChannels: payload.channels || ['push']
  });

  // Future integrations (SMS, WhatsApp, Email) can be hooked up here without changing routing code
  return { success: true };
}
