import { prisma } from '../../config/database.config';
import { io } from '../../websocket/socket';
import { aiProvider } from '../../providers/ai/MockAIProvider';
import { TTSProvider } from '../../providers/voice/TTSProvider';
import { AppError } from '../../common/errors/AppError';

export class CommunicationService {
  
  // --- Standard Chat ---
  static async sendChatMessage(senderId: string, rideId: string, receiverId: string, content: string) {
    // 1. Verify Ride validity
    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw new AppError('Ride not found', 404);

    // Enforce text-only preference logic here if required by receiver profile
    // (e.g., check receiver's PassengerProfile.prefersTextOnly to dynamically adjust delivery)

    const message = await prisma.message.create({
      data: { rideId, senderId, receiverId, content }
    });

    // 2. Emit real-time event via Socket.io
    io.to(`ride_${rideId}`).emit('chat.message', {
      id: message.id,
      rideId,
      senderId,
      content,
      createdAt: message.createdAt
    });

    return message;
  }

  static async getRideMessages(userId: string, rideId: string) {
    return await prisma.message.findMany({
      where: { rideId, OR: [{ senderId: userId }, { receiverId: userId }] },
      orderBy: { createdAt: 'asc' }
    });
  }

  // --- AI Engine ---
  static async processAIRequest(userId: string, data: any) {
    // 1. Fetch user accessibility profile to pass as context
    const profile = await prisma.passengerProfile.findUnique({ where: { userId } });
    
    // 2. Query AI Provider
    const aiResponse = await aiProvider.understand({
      text: data.text,
      audioTranscription: data.audioTranscription,
      context: {
        userId,
        rideId: data.context.rideId,
        currentScreen: data.context.currentScreen,
        accessibilityProfile: profile
      }
    });

    // 3. Log conversation for history and POPIA audit
    const conversation = await prisma.aiConversation.findFirst({ where: { userId } }) 
      || await prisma.aiConversation.create({ data: { userId } });

    await prisma.aimessage.createMany({
      data: [
        { conversationId: conversation.id, role: 'USER', content: data.text },
        { conversationId: conversation.id, role: 'AI', content: aiResponse.replyText, intent: JSON.stringify(aiResponse) }
      ]
    });

    // 4. Voice Abstraction (Empathy/Accessibility feature)
    // If user prefers voice or requires a screen reader, trigger TTS on device
    if (profile?.prefersVoice || profile?.requiresScreenReader) {
      TTSProvider.announce(userId, aiResponse.replyText, aiResponse.language);
    }

    // Note: The AI returns the INTENT. The frontend or controller evaluates it.
    // E.g., if intent === 'CANCEL_RIDE', the client receives this and invokes the secure DELETE /rides/:id endpoint.
    // The backend AI controller DOES NOT blindly execute state changes.

    return aiResponse;
  }
}
