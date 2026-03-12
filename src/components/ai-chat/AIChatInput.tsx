"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Paperclip, Send } from "lucide-react";
import { useAIChatContext } from "./AIChatProvider";

export default function AIChatInput() {
  const t = useTranslations("aiChat");
  const { triggerDemo, matchConfirmed } = useAIChatContext();
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSend() {
    if (!text.trim()) return;
    triggerDemo();
    setText("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleFileClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeKB = Math.round(file.size / 1024);
    const sizeStr = sizeKB >= 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
    triggerDemo({ name: file.name, size: sizeStr, type: file.type });
    // Reset input tak, aby šlo vybrat znovu
    e.target.value = "";
  }

  return (
    <div className="border-t border-gray-200 px-3 py-3">
      {!matchConfirmed && (
        <p className="text-xs text-gray-400 mb-2 text-center">{t("demoHint")}</p>
      )}
      <div className="flex items-end gap-2">
        {/* Skrytý file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={handleFileChange}
        />
        {/* Tlačítko pro přílohu */}
        <button
          onClick={handleFileClick}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0"
          aria-label="Nahrát dokument"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("placeholder")}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-gray-400 max-h-28 overflow-y-auto"
        />
        {/* Odeslat */}
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          aria-label="Odeslat"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
