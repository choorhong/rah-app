import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";

import { collection, serverTimestamp, query, onSnapshot, orderBy, writeBatch, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';


interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  createdAt: any;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const { id: recipientId } = useParams();
  const { user } = useAuth();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!user?.uid || !recipientId) return;

    const chatPath = `messages/${user.uid}/chats/${recipientId}/messages`;
    const messagesRef = collection(db, chatPath);
    const q = query(
      messagesRef,
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];

      setMessages(newMessages);
      requestAnimationFrame(scrollToBottom);
    });

    return () => unsubscribe();
  }, [user?.uid, recipientId]);

  const sendMessage = async (text: string) => {

    const batch = writeBatch(db);

    const messageData = {
      senderId: user!.uid,
      recipientId,
      text: text.trim(),
      createdAt: serverTimestamp(),
    };

    try {
      // Add to sender's messages
      const senderPath = `messages/${user!.uid}/chats/${recipientId}/messages`;
      const senderRef = doc(collection(db, senderPath));
      batch.set(senderRef, messageData);

      // Add to recipient's messages
      const recipientPath = `messages/${recipientId}/chats/${user!.uid}/messages`;
      const recipientRef = doc(collection(db, recipientPath));
      batch.set(recipientRef, messageData);

      // Commit both operations atomically
      await batch.commit();
      return { id: senderRef.id, ...messageData };
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  };


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = inputRef.current?.value || "";
    if (!input.trim() || !user?.uid || !recipientId) return;

    try {
      await sendMessage(input.trim());
      inputRef.current!.value = "";

      // console.log('result', result);

      // setMessages((prevMsg) => {
      //   const newMessage: Message = {
      //     ...result,
      //     recipientId: recipientId as string
      //   };
      //   const newMessages = [
      //     ...prevMsg,
      //     newMessage,
      //   ];

      //   // Scroll after state update is complete
      //   requestAnimationFrame(scrollToBottom);

      //   return newMessages;
      // });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="overflow-y-auto flex flex-col space-y-2 p-4 max-h-[90vh] scrollbar-none" >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-xs px-4 py-2 rounded-lg break-words ${msg.senderId === user?.uid ? "bg-blue-500 text-white self-end" : "bg-gray-200 text-black self-start"
              }`}
            style={{
              width: "-webkit-fill-available"
            }}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="absolute bottom-0 left-0 w-full bg-blue-50">
        <form className="max-w-[1280px] flex gap-2 p-4 mx-auto" onSubmit={handleSubmit}>
          <Input
            type="text"
            ref={inputRef}
            placeholder="Type a message..."
          />
          <Button type="submit" className="rounded-r-lg">
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}

export default ChatPage;
