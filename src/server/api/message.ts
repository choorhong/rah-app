import { collection, serverTimestamp, query, orderBy, onSnapshot, writeBatch, doc, Firestore, deleteDoc, getDocs } from 'firebase/firestore';

import { db } from '../db';

export interface IMessage {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  createdAt: any;
}

export interface IMessageService {
  sendMessage(senderId: string, recipientId: string, text: string): Promise<IMessage>;
  getMessages(userId: string, recipientId: string): Promise<IMessage[]>;
  deleteMessage(messageId: string): Promise<void>;
}

class MessageService implements IMessageService {
  private static instance: MessageService;
  private subscriptions: Map<string, () => void> = new Map();

  private constructor(private database: Firestore) { }

  public static initialize(database: Firestore): void {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService(database);
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
    const chatPath = `messages/${userId}/chats/${recipientId}/messages`;
    const messagesRef = collection(this.database, chatPath);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as IMessage[];

      callback(messages);
    });

    const subscriptionKey = `${userId}-${recipientId}`;
    this.subscriptions.set(subscriptionKey, unsubscribe);

    return () => {
      unsubscribe();
      this.subscriptions.delete(subscriptionKey);
    };
  }

  public async sendMessage(senderId: string, recipientId: string, text: string): Promise<IMessage> {
    const messageData = {
      senderId,
      recipientId,
      text: text.trim(),
      createdAt: serverTimestamp()
    };

    const batch = writeBatch(this.database);

    // Add to sender's messages
    const senderPath = `messages/${senderId}/chats/${recipientId}/messages`;
    const senderRef = doc(collection(this.database, senderPath));
    batch.set(senderRef, messageData);

    // Add to recipient's messages
    const recipientPath = `messages/${recipientId}/chats/${senderId}/messages`;
    const recipientRef = doc(collection(this.database, recipientPath));
    batch.set(recipientRef, messageData);

    // Commit both operations atomically
    await batch.commit();
    return { id: senderRef.id, ...messageData };
  }

  public async getMessages(userId: string, recipientId: string): Promise<IMessage[]> {
    const chatPath = `messages/${userId}/chats/${recipientId}/messages`;
    const messagesRef = collection(this.database, chatPath);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as IMessage[];

  }

  public async deleteMessage(messageId: string): Promise<void> {
    return await deleteDoc(doc(this.database, 'messages', messageId));

  }
}

MessageService.initialize(db);
export const messageService = MessageService.getInstance();