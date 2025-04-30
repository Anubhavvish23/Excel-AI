import React from "react";
import FileUploader from "./FileUploader";
import SheetSelector from "./SheetSelector";
import DataExport from "./DataExport";
import QuerySuggestions from "./QuerySuggestions";

interface FileSidebarProps {
  excelFiles: File[];
  selectedFile: string;
  excelData: any;
  selectedSheet: string;
  onFileUpload: (files: File[]) => void;
  onFileRemove: (fileName: string) => void;
  onFileSelect: (fileName: string) => void;
  onSheetChange: (sheet: string) => void;
  onQuerySelect: (query: string) => void;
  filteredData: any[] | null;
  isOpen?: boolean;
  onClose?: () => void;
}

const FileSidebar: React.FC<FileSidebarProps> = ({
  excelFiles,
  selectedFile,
  excelData,
  selectedSheet,
  onFileUpload,
  onFileRemove,
  onFileSelect,
  onSheetChange,
  onQuerySelect,
  filteredData,
  isOpen,
  onClose
}) => {
  const sidebarContent = (
    <div className="space-y-6">
      <FileUploader
        onFileUpload={onFileUpload}
        onFileRemove={onFileRemove}
        excelFiles={excelFiles}
        selectedFile={selectedFile}
        onFileSelect={onFileSelect}
      />
      
      {excelData && (
        <SheetSelector
          sheets={excelData.sheets}
          selectedSheet={selectedSheet}
          onChange={onSheetChange}
        />
      )}
      
      {excelData && (
        <DataExport 
          data={filteredData || excelData.data}
          fileName={excelData.fileName}
        />
      )}
      
      {excelData && (
        <QuerySuggestions 
          onSelect={onQuerySelect}
        />
      )}
    </div>
  );

  // Mobile drawer
  if (isOpen !== undefined) {
    return isOpen ? (
      <div className="md:hidden fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex animate-fade-in" onClick={onClose}>
        <div 
          className="bg-white dark:bg-gray-800 w-4/5 max-w-sm h-full p-5 overflow-y-auto animate-slide-in-right"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">File Selection</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            >
              ✕
            </button>
          </div>
          
          {sidebarContent}
        </div>
      </div>
    ) : null;
  }

  // Desktop sidebar
  return (
    <div className="hidden md:block md:w-80 bg-white dark:bg-gray-800 shadow-sm p-5 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
      {sidebarContent}
    </div>
  );
};

export default FileSidebar;
