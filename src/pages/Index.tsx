
import React, { useState } from "react";
import AppHeader from "@/components/AppHeader";
import FileSidebar from "@/components/FileSidebar";
import DataArea from "@/components/DataArea";
import ChatArea from "@/components/ChatArea";
import KeyboardShortcutsOverlay from "@/components/KeyboardShortcutsOverlay";
import CustomAIPrompts from "@/components/CustomAIPrompts";
import ScheduledReports from "@/components/ScheduledReports";
import DataForecasting from "@/components/DataForecasting";
import useExcelData from "@/hooks/useExcelData";
import useExcelChat from "@/hooks/useExcelChat";
import useAppSettings, { Theme } from "@/hooks/useAppSettings";
import useVisualizationData from "@/hooks/useVisualizationData";

const Index = () => {
  // App settings (theme, keyboard shortcuts, etc.)
  const {
    isDarkMode,
    isFileDrawerOpen,
    showKeyboardShortcuts,
    setIsFileDrawerOpen,
    setShowKeyboardShortcuts,
    toggleDarkMode,
    theme,
    setTheme
  } = useAppSettings();

  // Excel data handling
  const {
    excelFiles,
    selectedFile,
    excelData,
    selectedSheet,
    filteredData,
    handleFileUpload,
    handleSheetChange,
    handleFileSelect,
    handleFileRemove,
    handleFilteredData
  } = useExcelData();

  // Visualization data handling
  const {
    visualizerData,
    showDashboard,
    visualizationOptions,
    dataQualityReport,
    setVisualizerData,
    setShowDashboard,
    setVisualizationOptions,
    setDataQualityReport
  } = useVisualizationData();

  // Chat functionality
  const {
    chatHistory,
    loading,
    chatContainerRef,
    handleChatWithExcel,
    exportChatHistory,
    clearChatHistory
  } = useExcelChat({
    excelData,
    filteredData,
    setVisualizerData,
    setShowDashboard,
    setShowKeyboardShortcuts
  });

  // For features: Active feature state
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  // Handle theme change - ensures correct typing for Theme union type
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col`}>
      {/* Header */}
      <AppHeader 
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        toggleFileDrawer={() => setIsFileDrawerOpen(prev => !prev)}
        exportChatHistory={exportChatHistory}
        clearChatHistory={clearChatHistory}
        hasChatHistory={chatHistory.length > 0}
        theme={theme}
        setTheme={handleThemeChange}
      />

      {/* Mobile drawer for file selection */}
      <FileSidebar
        excelFiles={excelFiles}
        selectedFile={selectedFile}
        excelData={excelData}
        selectedSheet={selectedSheet}
        onFileUpload={handleFileUpload}
        onFileRemove={handleFileRemove}
        onFileSelect={handleFileSelect}
        onSheetChange={handleSheetChange}
        onQuerySelect={(query) => {
          handleChatWithExcel(query);
          setIsFileDrawerOpen(false);
        }}
        filteredData={filteredData}
        isOpen={isFileDrawerOpen}
        onClose={() => setIsFileDrawerOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left sidebar - File selection (hidden on mobile) */}
        <div className="hidden md:flex md:flex-col md:w-72 lg:w-80 border-r border-gray-200 dark:border-gray-700 overflow-hidden">
          <FileSidebar
            excelFiles={excelFiles}
            selectedFile={selectedFile}
            excelData={excelData}
            selectedSheet={selectedSheet}
            onFileUpload={handleFileUpload}
            onFileRemove={handleFileRemove}
            onFileSelect={handleFileSelect}
            onSheetChange={handleSheetChange}
            onQuerySelect={handleChatWithExcel}
            filteredData={filteredData}
          />
          
          {/* New feature: Custom AI Prompts */}
          <div className="mt-4 px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4 overflow-y-auto">
            <CustomAIPrompts 
              onSelect={(prompt) => handleChatWithExcel(prompt)} 
            />
          </div>
          
          {/* New feature: Scheduled Reports */}
          <div className="mt-4 px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4 overflow-y-auto">
            <ScheduledReports 
              excelFileName={selectedFile} 
            />
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Data Preview/Visualizer/Dashboard */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {activeFeature === 'forecasting' ? (
              <DataForecasting
                data={filteredData || excelData?.data || null}
                excelData={excelData}
              />
            ) : (
              <DataArea 
                excelData={excelData}
                filteredData={filteredData}
                visualizerData={visualizerData}
                showDashboard={showDashboard}
                onFilter={handleFilteredData}
                setVisualizerData={setVisualizerData}
                setShowDashboard={setShowDashboard}
                visualizationOptions={visualizationOptions}
                setVisualizationOptions={setVisualizationOptions}
                onFeatureSelect={setActiveFeature}
                activeFeature={activeFeature}
              />
            )}
          </div>

          {/* Chat Area */}
          <ChatArea 
            chatContainerRef={chatContainerRef}
            chatHistory={chatHistory}
            loading={loading}
            onSendMessage={handleChatWithExcel}
            hasExcelData={!!excelData}
          />
        </div>
      </div>
      
      {/* Keyboard shortcuts overlay */}
      <KeyboardShortcutsOverlay 
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />
    </div>
  );
};

export default Index;
