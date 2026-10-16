// Tři pulsující tečky — AI "píše"
export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-2">
      {/* AI avatar */}
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
        <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
        </svg>
      </div>
      <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
      </div>
    </div>
  );
}
