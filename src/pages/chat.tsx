import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";

import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import { messageService } from "@/server/api/message";


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

    const unsubscribe = messageService.subscribeToMessages(
      user.uid,
      recipientId,
      (newMessages) => {
        setMessages(newMessages);
        requestAnimationFrame(scrollToBottom);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, recipientId]);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = inputRef.current?.value || "";
    if (!input.trim() || !user?.uid || !recipientId) return;

    try {
      await messageService.sendMessage(user.uid, recipientId, input.trim());
      inputRef.current!.value = "";
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
