
import * as XLSX from "xlsx";
import { toast } from "sonner";

export interface ExcelData {
  sheets: string[];
  data: any[];
  fileName: string;
}

// Read Excel file from File object with improved security
export const readExcelFile = (file: File): Promise<ExcelData> => {
  return new Promise((resolve, reject) => {
    // Validate file extension for basic security
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !['xlsx', 'xls', 'csv'].includes(fileExtension)) {
      toast.error("Invalid file format. Please upload .xlsx, .xls, or .csv files only.");
      reject(new Error("Invalid file format"));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error("Failed to read file data");
        }
        
        // Use type guard for additional security
        const workbook = XLSX.read(data, { type: "binary", cellDates: true });
        const sheets = workbook.SheetNames;

        if (sheets.length > 0) {
          const firstSheet = sheets[0];
          const worksheet = workbook.Sheets[firstSheet];
          
          // Add security check for worksheet
          if (!worksheet) {
            throw new Error(`Sheet "${firstSheet}" not found in workbook`);
          }
          
          // Use more secure options when converting to JSON
          const sheetData = XLSX.utils.sheet_to_json(worksheet, {
            defval: null, // Use null for empty cells
            raw: false    // Convert values appropriately 
          });

          if (sheetData.length === 0) {
            toast.warning(`The sheet "${firstSheet}" in file "${file.name}" appears to be empty.`);
          }

          resolve({
            sheets,
            data: sheetData,
            fileName: file.name,
          });
          
          toast.success(`File "${file.name}" loaded successfully`);
        } else {
          reject(new Error("No sheets found in the Excel file"));
        }
      } catch (error) {
        console.error("Error reading Excel file:", error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read the file"));
    };
    
    reader.readAsBinaryString(file);
  });
};

// Load data from specific sheet with improved security
export const loadSheetData = (file: File, sheetName: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    // Validate file extension for basic security
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !['xlsx', 'xls', 'csv'].includes(fileExtension)) {
      toast.error("Invalid file format. Please upload .xlsx, .xls, or .csv files only.");
      reject(new Error("Invalid file format"));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error("Failed to read file data");
        }
        
        // Use type guard for additional security
        const workbook = XLSX.read(data, { type: "binary", cellDates: true });
        
        // Validate sheet existence
        if (!workbook.SheetNames.includes(sheetName)) {
          throw new Error(`Sheet "${sheetName}" not found in workbook`);
        }
        
        const worksheet = workbook.Sheets[sheetName];
        
        // Add security check for worksheet
        if (!worksheet) {
          throw new Error(`Sheet "${sheetName}" not found in workbook`);
        }
        
        // Use more secure options when converting to JSON
        const sheetData = XLSX.utils.sheet_to_json(worksheet, {
          defval: null, // Use null for empty cells
          raw: false    // Convert values appropriately
        });

        if (sheetData.length === 0) {
          toast.warning(`The sheet "${sheetName}" appears to be empty.`);
        }

        resolve(sheetData);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsBinaryString(file);
  });
};

// Safe export to Excel function
export const exportToExcel = (data: any[], fileName: string): void => {
  try {
    if (!data || !Array.isArray(data) || data.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    
    // Sanitize filename
    const safeFileName = fileName.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
    XLSX.writeFile(wb, `${safeFileName}.xlsx`);
    
    toast.success("Data exported to Excel successfully");
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    toast.error("Failed to export data to Excel");
  }
};
