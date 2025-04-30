
import { useState, useRef, useEffect, RefObject } from "react";
import { toast } from "sonner";
import { processExcelQuery, formatResponse } from "../services/queryProcessorService";
import { ChatMessageProps } from "@/components/ChatMessage";
import { ExcelData } from "../services/excelService";

export interface UseExcelChatProps {
  excelData: ExcelData | null;
  filteredData: any[] | null;
  setVisualizerData: (data: any[] | null) => void;
  setShowDashboard: (show: boolean) => void;
  setShowKeyboardShortcuts: (show: boolean) => void;
}

export const useExcelChat = ({
  excelData,
  filteredData,
  setVisualizerData,
  setShowDashboard,
  setShowKeyboardShortcuts
}: UseExcelChatProps) => {
  const [chatHistory, setChatHistory] = useState<ChatMessageProps[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when chat history changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Handle chat with Excel
  const handleChatWithExcel = async (message: string) => {
    if (!excelData) {
      // Enhanced response for when no file is uploaded
      setChatHistory((prev) => [
        ...prev,
        {
          query: message,
          response: `
            <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/30 dark:border-blue-800">
              <h3 class="font-medium mb-2 text-blue-700 dark:text-blue-300">No Excel File Detected</h3>
              <div class="text-sm text-blue-600 dark:text-blue-300">
                <p>I need an Excel file to answer your query about "${message}". Here's how to get started:</p>
                <ol class="list-decimal pl-5 mt-2 space-y-1">
                  <li>Click the "Upload Files" button on the left panel</li>
                  <li>Select an Excel file (.xlsx or .xls) from your computer</li>
                  <li>Wait for the file to load and display in the data preview</li>
                  <li>Then ask me questions about your data</li>
                </ol>
                <p class="mt-2">Once your data is loaded, I can help analyze it, create visualizations, and extract valuable insights for you.</p>
              </div>
            </div>
          `,
          timestamp: new Date(),
          isNew: true,
        },
      ]);
      return;
    }

    setLoading(true);
    
    try {
      // Create a data object with filtered data if available
      const dataToProcess = {
        ...excelData,
        data: filteredData || excelData.data
      };
      
      // Process the query with advanced filtering and sorting
      const result = processExcelQuery(message, dataToProcess);

      // Handle visualization and dashboard views
      if (result.isVisualization) {
        setVisualizerData(result.rows.length > 0 ? result.rows : dataToProcess.data);
      } else if (result.isDashboard) {
        setShowDashboard(true);
        setVisualizerData(null);
      } else {
        // Only hide visualizer if not a visualization query
        setVisualizerData(null);
        setShowDashboard(false);
      }
      
      // Handle keyboard shortcuts
      if (result.isKeyboardShortcuts) {
        setShowKeyboardShortcuts(true);
      }
      
      // Format the response as a table with summary
      const formattedResponse = formatResponse(result);

      setChatHistory((prev) => [
        ...prev,
        {
          query: message,
          response: formattedResponse,
          timestamp: new Date(),
          isNew: true,
        },
      ]);
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        {
          query: message,
          response: `Error processing your request: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
          timestamp: new Date(),
          isNew: true,
        },
      ]);
      console.error('Error:', error);
      toast.error("Error processing your request");
    } finally {
      setLoading(false);
    }
  };

  // Export chat history
  const exportChatHistory = () => {
    const exportData = chatHistory.map((chat) => ({
      query: chat.query,
      response: chat.response.replace(/<[^>]*>/g, ''), // Strip HTML tags
      timestamp: chat.timestamp.toISOString(),
    }));

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'excel-chat-history.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Chat history exported successfully");
  };

  // Clear chat history
  const clearChatHistory = () => {
    setChatHistory([]);
    setVisualizerData(null);
    setShowDashboard(false);
    toast.success("Chat history cleared");
  };

  return {
    chatHistory,
    loading,
    chatContainerRef,
    handleChatWithExcel,
    exportChatHistory,
    clearChatHistory
  };
};

export default useExcelChat;
