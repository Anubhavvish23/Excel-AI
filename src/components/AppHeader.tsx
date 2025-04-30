
import React from "react";
import { FileSpreadsheet, Download, Trash2, Sun, Moon, Database } from "lucide-react";
import { Theme } from "@/hooks/useAppSettings";

interface AppHeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  toggleFileDrawer: () => void;
  exportChatHistory: () => void;
  clearChatHistory: () => void;
  hasChatHistory: boolean;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  isDarkMode,
  toggleDarkMode,
  toggleFileDrawer,
  exportChatHistory,
  clearChatHistory,
  hasChatHistory,
  theme,
  setTheme
}) => {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm py-4 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <FileSpreadsheet className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Excel AI Assistant
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={toggleFileDrawer}
            className="md:hidden p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle file drawer"
            title="Toggle file drawer"
          >
            <Database className="w-5 h-5" />
          </button>
          <button
            onClick={exportChatHistory}
            disabled={!hasChatHistory}
            className="p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Export chat history"
            title="Export chat history"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={clearChatHistory}
            disabled={!hasChatHistory}
            className="p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Clear chat history"
            title="Clear chat history"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
