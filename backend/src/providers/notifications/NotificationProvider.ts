export interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  data?: any;
  channels: ('PUSH' | 'SMS' | 'WHATSAPP' | 'EMAIL')[];
}

export interface NotificationProvider {
  send(payload: NotificationPayload): Promise<void>;
}
