
import React from "react";
import { MessageCircle, Bot } from "lucide-react";

export interface ChatMessageProps {
  query: string;
  response: string;
  timestamp: Date;
  isNew?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  query,
  response,
  timestamp,
  isNew = false,
}) => {
  return (
    <div className={`space-y-3 ${isNew ? "animate-fade-in" : ""}`}>
      {/* User query */}
      <div className="flex justify-end">
        <div className="flex max-w-[85%] md:max-w-[75%]">
          <div className="flex-none pt-1 pr-2">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex-grow space-y-1">
            <div className="bg-primary text-primary-foreground p-3 rounded-l-lg rounded-tr-lg shadow-sm">
              <p className="text-sm whitespace-pre-wrap break-words">{query}</p>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
              {timestamp.toLocaleTimeString()} • You
            </div>
          </div>
        </div>
      </div>

      {/* Assistant response */}
      <div className="flex justify-start">
        <div className="flex max-w-[85%] md:max-w-[75%]">
          <div className="flex-none pt-1 pr-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="flex-grow space-y-1">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-r-lg rounded-tl-lg shadow-sm">
              <div
                className="text-sm text-gray-800 dark:text-gray-200 chat-response"
                dangerouslySetInnerHTML={{ __html: response }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
              {timestamp.toLocaleTimeString()} • Assistant
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
