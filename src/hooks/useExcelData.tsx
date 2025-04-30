
import { useState } from "react";
import { toast } from "sonner";
import { ExcelData, readExcelFile, loadSheetData } from "../services/excelService";

export const useExcelData = () => {
  const [excelFiles, setExcelFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [filteredData, setFilteredData] = useState<any[] | null>(null);

  // File upload handler
  const handleFileUpload = (files: File[]) => {
    setExcelFiles((prev) => [...prev, ...files]);
    if (files.length > 0) {
      setSelectedFile(files[0].name);
      handleFileProcessing(files[0]);
    }
  };

  // Read and process Excel file
  const handleFileProcessing = async (file: File) => {
    try {
      const data = await readExcelFile(file);
      setExcelData(data);
      setSelectedSheet(data.sheets[0]);
    } catch (error) {
      console.error("Error processing Excel file:", error);
      toast.error("Error reading Excel file. Please try again with a valid file.");
    }
  };

  // Sheet change handler
  const handleSheetChange = async (sheetName: string) => {
    setSelectedSheet(sheetName);

    const file = excelFiles.find((f) => f.name === selectedFile);
    if (file) {
      try {
        const sheetData = await loadSheetData(file, sheetName);
        setExcelData((prev) => ({
          ...prev!,
          data: sheetData,
        }));
        setFilteredData(null);
      } catch (error) {
        console.error("Error loading sheet data:", error);
        toast.error("Error loading sheet data. Please try again.");
      }
    }
  };

  // File selection handler
  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName);
    const file = excelFiles.find((f) => f.name === fileName);
    if (file) {
      handleFileProcessing(file);
    }
  };

  // Remove file handler
  const handleFileRemove = (fileName: string) => {
    setExcelFiles((prev) => prev.filter((file) => file.name !== fileName));
    if (selectedFile === fileName) {
      const remainingFiles = excelFiles.filter((file) => file.name !== fileName);
      if (remainingFiles.length > 0) {
        setSelectedFile(remainingFiles[0].name);
        handleFileProcessing(remainingFiles[0]);
      } else {
        setSelectedFile("");
        setExcelData(null);
        setFilteredData(null);
      }
    }
    toast.success(`File "${fileName}" removed`);
  };

  // Handle filtering from advanced filter
  const handleFilteredData = (data: any[]) => {
    setFilteredData(data);
  };

  return {
    excelFiles,
    selectedFile,
    excelData,
    selectedSheet,
    filteredData,
    handleFileUpload,
    handleSheetChange,
    handleFileSelect,
    handleFileRemove,
    handleFilteredData,
  };
};

export default useExcelData;
