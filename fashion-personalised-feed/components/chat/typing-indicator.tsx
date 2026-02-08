export function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1 py-1"
      aria-label="FriendOS is typing"
    >
      <div
        className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce"
        style={{ animationDelay: "0ms", animationDuration: "600ms" }}
      />
      <div
        className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce"
        style={{ animationDelay: "150ms", animationDuration: "600ms" }}
      />
      <div
        className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce"
        style={{ animationDelay: "300ms", animationDuration: "600ms" }}
      />
    </div>
  )
}
