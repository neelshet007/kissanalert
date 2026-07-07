import axios from 'axios';

export async function triggerN8NWebhook(workflowName: string, payload: any) {
  const url = process.env.N8N_WEBHOOK_URL;
  if (!url) {
    console.log(`[Mock n8n Webhook] Triggered workflow "${workflowName}" with payload:`, JSON.stringify(payload, null, 2));
    return { success: true, message: 'Mock n8n workflow triggered successfully' };
  }

  try {
    const response = await axios.post(url, {
      workflow: workflowName,
      timestamp: new Date().toISOString(),
      ...payload
    });
    console.log(`[n8n Webhook] Success for "${workflowName}":`, response.status);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.warn(`[n8n Webhook] Connection to ${url} failed, fallback to local log. Error:`, error.message);
    return { success: false, error: error.message };
  }
}
