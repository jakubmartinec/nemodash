"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/ai-chat/types";
import TextMessage from "./messages/TextMessage";
import FileAttachment from "./messages/FileAttachment";
import InvoiceCard from "./messages/InvoiceCard";
import PropertyMatch from "./messages/PropertyMatch";
import TenantSettlement from "./messages/TenantSettlement";
import ActionProposal from "./messages/ActionProposal";
import TypingIndicator from "./messages/TypingIndicator";

interface AIChatMessagesProps {
  messages: ChatMessage[];
  isTyping: boolean;
}

function MessageItem({ message }: { message: ChatMessage }) {
  switch (message.type) {
    case "text":
      return <TextMessage message={message} />;
    case "file_attachment":
      return <FileAttachment message={message} />;
    case "invoice_extraction":
      return <InvoiceCard message={message} />;
    case "property_match":
      return <PropertyMatch message={message} />;
    case "tenant_settlement":
      return <TenantSettlement message={message} />;
    case "action_proposal":
      return <ActionProposal message={message} />;
    default:
      return null;
  }
}

export default function AIChatMessages({ messages, isTyping }: AIChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}
      {isTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
