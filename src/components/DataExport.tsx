
import React from "react";
import { 
  Download, 
  FileJson, 
  FileText, 
  Table2, 
  FileSpreadsheet 
} from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { exportToExcel } from "../services/excelService";

interface DataExportProps {
  data: any[];
  fileName: string;
  onUpdateData?: (updatedData: any[]) => void;
}

const DataExport: React.FC<DataExportProps> = ({ data, fileName, onUpdateData }) => {
  if (!data || data.length === 0) return null;

  const exportBaseFileName = fileName.replace(/\.[^/.]+$/, "") || "export";
  // Additional sanitization for file names
  const sanitizeFileName = (name: string) => name.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
  const safeFileName = sanitizeFileName(exportBaseFileName);

  const handleExportToExcel = () => {
    exportToExcel(data, safeFileName);
  };

  const exportToCSV = () => {
    try {
      if (!data || !Array.isArray(data) || data.length === 0) {
        toast.error("No data to export");
        return;
      }
      
      const ws = XLSX.utils.json_to_sheet(data);
      const csv = XLSX.utils.sheet_to_csv(ws);
      
      // Create a safe download with proper content-type
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${safeFileName}.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast.success("Data exported to CSV successfully");
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      toast.error("Failed to export data to CSV");
    }
  };

  const exportToJSON = () => {
    try {
      if (!data || !Array.isArray(data) || data.length === 0) {
        toast.error("No data to export");
        return;
      }
      
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${safeFileName}.json`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast.success("Data exported to JSON successfully");
    } catch (error) {
      console.error("Error exporting to JSON:", error);
      toast.error("Failed to export data to JSON");
    }
  };

  const exportToHTML = () => {
    try {
      if (!data || !Array.isArray(data) || data.length === 0) {
        toast.error("No data to export");
        return;
      }
      
      // Create a basic HTML table
      const columns = Object.keys(data[0] || {});
      let html = '<html><head><title>Exported Data</title>';
      html += '<style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px}th{background-color:#f2f2f2}</style>';
      html += '</head><body>';
      html += '<table><thead><tr>';
      
      // Add headers
      columns.forEach(col => {
        // Sanitize column names for HTML
        const safeCol = col.replace(/[<>&"']/g, c => {
          switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '"': return '&quot;';
            case "'": return '&#039;';
            default: return c;
          }
        });
        html += `<th>${safeCol}</th>`;
      });
      html += '</tr></thead><tbody>';
      
      // Add rows with sanitization
      data.forEach(row => {
        html += '<tr>';
        columns.forEach(col => {
          const cellValue = row[col] !== undefined && row[col] !== null ? String(row[col]) : '';
          // Sanitize cell content for HTML
          const safeValue = cellValue.replace(/[<>&"']/g, c => {
            switch (c) {
              case '<': return '&lt;';
              case '>': return '&gt;';
              case '&': return '&amp;';
              case '"': return '&quot;';
              case "'": return '&#039;';
              default: return c;
            }
          });
          html += `<td>${safeValue}</td>`;
        });
        html += '</tr>';
      });
      html += '</tbody></table></body></html>';
      
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${safeFileName}.html`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast.success("Data exported to HTML successfully");
    } catch (error) {
      console.error("Error exporting to HTML:", error);
      toast.error("Failed to export data to HTML");
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Export Data
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleExportToExcel}
          className="flex items-center justify-center p-2 text-sm rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors"
          aria-label="Export to Excel"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Excel
        </button>
        <button
          onClick={exportToCSV}
          className="flex items-center justify-center p-2 text-sm rounded-md bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50 transition-colors"
          aria-label="Export to CSV"
        >
          <FileText className="w-4 h-4 mr-2" />
          CSV
        </button>
        <button
          onClick={exportToJSON}
          className="flex items-center justify-center p-2 text-sm rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50 transition-colors"
          aria-label="Export to JSON"
        >
          <FileJson className="w-4 h-4 mr-2" />
          JSON
        </button>
        <button
          onClick={exportToHTML}
          className="flex items-center justify-center p-2 text-sm rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 transition-colors"
          aria-label="Export to HTML"
        >
          <Table2 className="w-4 h-4 mr-2" />
          HTML
        </button>
      </div>
    </div>
  );
};

export default DataExport;
