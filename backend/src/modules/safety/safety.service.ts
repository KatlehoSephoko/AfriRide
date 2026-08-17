import { prisma } from '../../config/database.config';
import { io } from '../../websocket/socket';
import { emergencyProvider } from '../../providers/safety/EmergencyProvider';
import { notificationProvider } from '../../providers/notifications/MockNotificationProvider';

export class SafetyService {
  
  static async triggerPanic(userId: string, data: any) {
    // 1. Create Panic Alert Log
    const alert = await prisma.panicAlert.create({
      data: {
        userId,
        rideId: data.rideId,
        latitude: data.latitude,
        longitude: data.longitude,
        trigger: data.trigger,
      }
    });

    // 2. Log Safety Event (Audit)
    await prisma.safetyEvent.create({
      data: {
        userId,
        rideId: data.rideId,
        type: 'PANIC_TRIGGERED',
        latitude: data.latitude,
        longitude: data.longitude,
        metadata: { trigger: data.trigger }
      }
    });

    // 3. Emit real-time Socket.io alert to operations/admin room
    io.to('role_ADMIN').to('role_SUPPORT').emit('panic.triggered', {
      alertId: alert.id,
      userId,
      rideId: data.rideId,
      location: { lat: data.latitude, lng: data.longitude }
    });

    // 4. Notify Trusted Contacts
    const contacts = await prisma.trustedContact.findMany({ 
      where: { userId, notifyOnSOS: true } 
    });

    for (const contact of contacts) {
      await notificationProvider.send({
        userId: 'SYSTEM',
        title: 'EMERGENCY: AfriRide SOS',
        body: `An SOS was triggered for an AfriRide user you are a trusted contact for. Location: ${data.latitude}, ${data.longitude}`,
        channels: ['SMS'],
        data: { phone: contact.phone } // Routes through mock SMS gateway
      });
    }

    // 5. Dispatch actual emergency services (Implementation specific)
    await emergencyProvider.dispatchSOS({
      userId,
      location: { lat: data.latitude, lng: data.longitude },
      context: { rideId: data.rideId }
    });

    return alert;
  }

  static async addTrustedContact(userId: string, data: any) {
    return await prisma.trustedContact.create({
      data: {
        userId,
        ...data
      }
    });
  }
}
