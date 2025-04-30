import React, { ChangeEvent, useState } from "react";
import { Upload, FileSpreadsheet, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface FileUploaderProps {
  onFileUpload: (files: File[]) => void;
  onFileRemove: (fileName: string) => void;
  excelFiles: File[];
  selectedFile: string;
  onFileSelect: (fileName: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUpload,
  onFileRemove,
  excelFiles,
  selectedFile,
  onFileSelect,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files).filter(
        (file) => file.name.endsWith(".xlsx") || file.name.endsWith(".xls")
      );
      
      if (files.length === 0) {
        toast.error("Please upload Excel files only (.xlsx, .xls)");
        return;
      }
      
      onFileUpload(files);
      toast.success(`${files.length} file(s) uploaded successfully`);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onFileUpload(files);
      toast.success(`${files.length} file(s) uploaded successfully`);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-gray-300 dark:border-gray-600"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-3 text-center">
          <FileSpreadsheet className="w-10 h-10 text-primary/70" />
          <div className="text-sm">
            <p className="font-medium text-gray-700 dark:text-gray-300">
              Drag and drop Excel files here
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
              or click to browse
            </p>
          </div>
          <label className="relative">
            <input
              type="file"
              className="sr-only"
              accept=".xlsx,.xls"
              multiple
              onChange={handleFileChange}
              id="file-upload"
            />
            <span className="neo-button inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90">
              <Upload className="w-4 h-4 mr-2" />
              Browse Files
            </span>
          </label>
        </div>
      </div>

      {excelFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Uploaded Files
          </h3>
          <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
            {excelFiles.map((file, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-md transition-all ${
                  selectedFile === file.name
                    ? "bg-primary/10 border border-primary/30"
                    : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent"
                }`}
              >
                <div
                  className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
                  onClick={() => onFileSelect(file.name)}
                >
                  <FileSpreadsheet
                    className={`w-5 h-5 ${
                      selectedFile === file.name
                        ? "text-primary"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  />
                  <span
                    className={`truncate text-sm ${
                      selectedFile === file.name
                        ? "font-medium text-primary dark:text-primary"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {file.name}
                  </span>
                </div>
                <button
                  onClick={() => onFileRemove(file.name)}
                  className="p-1.5 rounded-md text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  aria-label={`Remove ${file.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
