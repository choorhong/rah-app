import { IMessage } from "@/interfaces/message.interface";
import { FirebaseRepository } from "./firebase.repository";
import { collection, query, orderBy, onSnapshot, writeBatch, doc, Firestore, deleteDoc, getDocs } from 'firebase/firestore';

export class MessageRepository extends FirebaseRepository {
  constructor(db: Firestore) {
    super(db, 'messages');
  }

  async getMessages(userId: string, recipientId: string): Promise<IMessage[]> {
    const chatPath = `messages/${userId}/chats/${recipientId}/messages`;
    const messagesRef = collection(this.db, chatPath);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as IMessage[];
  }

  async createMessage(senderId: string, recipientId: string, messageData: any): Promise<IMessage> {
    const batch = writeBatch(this.db);

    // Add to sender's messages
    const senderPath = `messages/${senderId}/chats/${recipientId}/messages`;
    const senderRef = doc(collection(this.db, senderPath));
    batch.set(senderRef, messageData);

    // Add to recipient's messages
    const recipientPath = `messages/${recipientId}/chats/${senderId}/messages`;
    const recipientRef = doc(collection(this.db, recipientPath));
    batch.set(recipientRef, messageData);

    // Commit both operations atomically
    await batch.commit();
    return { id: senderRef.id, ...messageData };
  }

  async deleteMessage(messageId: string): Promise<void> {
    return deleteDoc(doc(this.db, this.collectionName, messageId));
  }

  subscribeToMessages(userId: string, recipientId: string, callback: (messages: IMessage[]) => void): () => void {
    const chatPath = `messages/${userId}/chats/${recipientId}/messages`;
    const messagesRef = collection(this.db, chatPath);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as IMessage[];

      callback(messages);
    });

    return unsubscribe;
  }

}