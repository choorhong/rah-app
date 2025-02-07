import { serverTimestamp } from 'firebase/firestore';

import { db } from '../../db';
import { MessageRepository } from '../repositories/message.respository';
import { IMessage } from '@/interfaces/message.interface';


export interface IMessageService {
  sendMessage(senderId: string, recipientId: string, text: string): Promise<IMessage>;
  getMessages(userId: string, recipientId: string): Promise<IMessage[]>;
  deleteMessage(messageId: string): Promise<void>;
}

class MessageService implements IMessageService {
  private static instance: MessageService;
  private subscriptions: Map<string, () => void> = new Map();

  private constructor(private messageRepository: MessageRepository) { }

  public static initialize(messageRepository: MessageRepository): void {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService(messageRepository);
    }
  }

  public static getInstance(): MessageService {
    if (!MessageService.instance) {
      throw new Error('MessageService must be initialized');
    }
    return MessageService.instance;
  }

  public subscribeToMessages(
    userId: string,
    recipientId: string,
    callback: (messages: IMessage[]) => void
  ): () => void {
    const subscriptionKey = `${userId}-${recipientId}`;

    // Call the repository's subscribeToMessages method
    const unsubscribe = this.messageRepository.subscribeToMessages(userId, recipientId, callback);

    // Store the unsubscribe function in case it needs to be called later
    this.subscriptions.set(subscriptionKey, unsubscribe);

    return () => {
      unsubscribe();  // This will unsubscribe from the messages stream
      this.subscriptions.delete(subscriptionKey);  // Clean up the subscription map
    };
  }

  public async sendMessage(senderId: string, recipientId: string, text: string): Promise<IMessage> {
    const messageData = {
      senderId,
      recipientId,
      text: text.trim(),
      createdAt: serverTimestamp()
    };

    return this.messageRepository.createMessage(senderId, recipientId, messageData);
  }

  public async getMessages(userId: string, recipientId: string): Promise<IMessage[]> {
    return this.messageRepository.getMessages(userId, recipientId);

  }

  public async deleteMessage(messageId: string): Promise<void> {
    this.messageRepository.deleteMessage(messageId);

  }
}

const msgRepository = new MessageRepository(db);
MessageService.initialize(msgRepository);
export const messageService = MessageService.getInstance();