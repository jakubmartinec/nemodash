import { FileText } from "lucide-react";
import type { ChatMessage } from "@/lib/ai-chat/types";

interface FileAttachmentProps {
  message: ChatMessage;
}

export default function FileAttachment({ message }: FileAttachmentProps) {
  const file = message.file;
  if (!file) return null;

  return (
    <div className="flex justify-end">
      <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-card/20 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-on-band/70">{file.size}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
