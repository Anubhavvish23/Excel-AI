
import React, { useState, useRef, FormEvent, useEffect } from "react";
import { Send, Loader2, Zap } from "lucide-react";

interface ChatInputProps {
  onSendMessage?: (message: string) => void;
  onSubmit?: (message: string) => void;
  loading: boolean;
  placeholder?: string;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onSubmit,
  loading,
  placeholder = "Ask a question about your data...",
  disabled = false,
}) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !loading && !disabled) {
      if (onSubmit) {
        onSubmit(message);
      } else if (onSendMessage) {
        onSendMessage(message);
      }
      setMessage("");
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-end bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary dark:focus-within:border-primary"
    >
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        className="flex-1 px-4 py-3 pr-16 text-base bg-transparent border-0 resize-none focus:ring-0 focus:outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
        disabled={loading || disabled}
      />
      <div className="absolute right-2 bottom-2 flex space-x-1">
        <button
          type="button"
          className="p-1.5 rounded-md text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Generate smart response"
          title="Generate smart response"
          disabled={disabled}
        >
          <Zap className="w-5 h-5" />
        </button>
        <button
          type="submit"
          disabled={!message.trim() || loading || disabled}
          className={`p-1.5 rounded-md ${
            message.trim() && !loading && !disabled
              ? "text-primary bg-primary/10 hover:bg-primary/20"
              : "text-gray-400 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
          }`}
          aria-label="Send message"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
