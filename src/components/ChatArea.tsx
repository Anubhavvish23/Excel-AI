
import React from "react";
import { FileSpreadsheet } from "lucide-react";
import ChatMessage, { ChatMessageProps } from "./ChatMessage";
import ChatInput from "./ChatInput";

interface ChatAreaProps {
  chatContainerRef: React.RefObject<HTMLDivElement>;
  chatHistory: ChatMessageProps[];
  loading: boolean;
  onSendMessage: (message: string) => void;
  hasExcelData: boolean;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  chatContainerRef,
  chatHistory,
  loading,
  onSendMessage,
  hasExcelData
}) => {
  return (
    <>
      {/* Chat history */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6"
      >
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <FileSpreadsheet className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Excel AI Assistant
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
              {hasExcelData ? (
                "Ask questions about your data or try the suggested queries on the left."
              ) : (
                "Upload an Excel file to start analyzing your data with AI-powered insights."
              )}
            </p>
          </div>
        )}
        
        {chatHistory.map((chat, index) => (
          <ChatMessage
            key={index}
            query={chat.query}
            response={chat.response}
            timestamp={chat.timestamp}
            isNew={chat.isNew}
          />
        ))}
      </div>

      {/* Chat input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 md:px-6 md:py-4 bg-white dark:bg-gray-800">
        <ChatInput 
          onSendMessage={onSendMessage} 
          loading={loading}
          placeholder={
            hasExcelData
              ? "Ask a question about your Excel data (e.g., 'Show detailed statistics', 'Apply advanced filters', 'Export data')"
              : "Upload an Excel file to start chatting..."
          }
        />
      </div>
    </>
  );
};

export default ChatArea;
