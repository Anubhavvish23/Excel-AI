
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp, BarChart2, FileText } from "lucide-react";

interface DataPreviewProps {
  data: any[];
  fileName?: string;
  sheetName?: string;
}

const DataPreview: React.FC<DataPreviewProps> = ({ data, fileName, sheetName }) => {
  const [showSummary, setShowSummary] = useState(false);
  
  if (!data || data.length === 0) {
    return (
      <div className="text-center p-6 text-gray-500 dark:text-gray-400">
        {fileName ? (
          <>
            No data available in {sheetName ? `sheet "${sheetName}"` : "this sheet"} 
            {fileName ? ` of file "${fileName}"` : ""}
          </>
        ) : (
          "No data available to preview"
        )}
      </div>
    );
  }

  const columns = Object.keys(data[0] || {});
  
  // Generate data summary statistics
  const generateSummary = () => {
    const summary = {
      rowCount: data.length,
      columnCount: columns.length,
      columns: {} as Record<string, {
        dataType: string,
        nullCount: number,
        uniqueValues: number,
        min?: number | string,
        max?: number | string,
        avg?: number,
        sum?: number,
        common?: {value: any, count: number}[]
      }>
    };
    
    // Analyze each column
    columns.forEach(col => {
      const values = data.map(row => row[col]);
      const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== "");
      const uniqueValues = new Set(values);
      
      // Determine column data type
      const hasNumbers = nonNullValues.some(v => !isNaN(Number(v)) && typeof v !== 'boolean');
      const hasStrings = nonNullValues.some(v => isNaN(Number(v)) || typeof v === 'string');
      const hasDates = nonNullValues.some(v => !isNaN(Date.parse(String(v))));
      
      let dataType = "mixed";
      if (hasNumbers && !hasStrings) dataType = "numeric";
      else if (hasStrings) dataType = "text";
      if (hasDates && nonNullValues.every(v => !isNaN(Date.parse(String(v))))) dataType = "date";
      
      // Initialize column summary
      summary.columns[col] = {
        dataType,
        nullCount: values.length - nonNullValues.length,
        uniqueValues: uniqueValues.size,
      };
      
      // Add numeric statistics for numeric columns
      if (dataType === "numeric") {
        const numericValues = nonNullValues.map(v => Number(v));
        summary.columns[col].min = Math.min(...numericValues);
        summary.columns[col].max = Math.max(...numericValues);
        summary.columns[col].avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
        summary.columns[col].sum = numericValues.reduce((a, b) => a + b, 0);
      }
      
      // Add most common values (for categorical data)
      if (uniqueValues.size < 20) {
        const valueCounts: Record<string, number> = {};
        values.forEach(v => {
          const key = String(v);
          valueCounts[key] = (valueCounts[key] || 0) + 1;
        });
        
        const common = Object.entries(valueCounts)
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        summary.columns[col].common = common;
      }
    });
    
    return summary;
  };
  
  const dataSummary = generateSummary();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {(fileName || sheetName) && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {fileName && <span>File: <strong>{fileName}</strong></span>}
            {fileName && sheetName && <span> • </span>}
            {sheetName && <span>Sheet: <strong>{sheetName}</strong></span>}
          </div>
        )}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSummary(!showSummary)}
            className="flex items-center gap-1"
          >
            {showSummary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <FileText className="w-4 h-4 mr-1" />
            {showSummary ? "Hide Summary" : "Show Summary"}
          </Button>
        </div>
      </div>

      {/* Data Summary Panel */}
      {showSummary && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 animate-in fade-in-50 slide-in-from-top-5 duration-300">
          <h3 className="text-sm font-medium mb-2">Data Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Rows</div>
              <div className="text-2xl font-semibold mt-1">{dataSummary.rowCount}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Columns</div>
              <div className="text-2xl font-semibold mt-1">{dataSummary.columnCount}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="text-xs text-gray-500 dark:text-gray-400">Data Quality</div>
              <div className="text-2xl font-semibold mt-1">
                {Object.values(dataSummary.columns).reduce((acc, col) => acc + col.nullCount, 0) === 0 
                  ? "100%" 
                  : Math.round((1 - Object.values(dataSummary.columns).reduce((acc, col) => acc + col.nullCount, 0) / 
                    (dataSummary.rowCount * dataSummary.columnCount)) * 100) + "%"
                }
              </div>
            </div>
          </div>

          <h3 className="text-sm font-medium mb-2">Column Analysis</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Column</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Unique Values</TableHead>
                  <TableHead>Missing</TableHead>
                  <TableHead>Statistics</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {columns.map((column) => (
                  <TableRow key={column}>
                    <TableCell className="font-medium">{column}</TableCell>
                    <TableCell>
                      <div className="inline-flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-0.5 rounded">
                        {dataSummary.columns[column].dataType}
                      </div>
                    </TableCell>
                    <TableCell>
                      {dataSummary.columns[column].uniqueValues} 
                      <span className="text-xs text-gray-500 ml-1">
                        ({Math.round((dataSummary.columns[column].uniqueValues / dataSummary.rowCount) * 100)}%)
                      </span>
                    </TableCell>
                    <TableCell>
                      {dataSummary.columns[column].nullCount}
                      <span className="text-xs text-gray-500 ml-1">
                        ({Math.round((dataSummary.columns[column].nullCount / dataSummary.rowCount) * 100)}%)
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate">
                      {dataSummary.columns[column].dataType === "numeric" && (
                        <span className="text-xs">
                          min: {dataSummary.columns[column].min?.toLocaleString()}, 
                          max: {dataSummary.columns[column].max?.toLocaleString()}, 
                          avg: {(dataSummary.columns[column].avg || 0).toLocaleString(undefined, {maximumFractionDigits: 2})}
                        </span>
                      )}
                      {dataSummary.columns[column].common && (
                        <div className="text-xs mt-1 text-gray-500">
                          Top: {dataSummary.columns[column].common?.slice(0, 2).map(v => 
                            `${v.value} (${Math.round((v.count / dataSummary.rowCount) * 100)}%)`
                          ).join(", ")}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Data Preview Table */}
      <div className="overflow-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {data.slice(0, 5).map((row, rowIndex) => (
                  <tr 
                    key={rowIndex}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={`${rowIndex}-${colIndex}`}
                        className="px-4 py-3 text-sm text-gray-900 dark:text-gray-200 max-w-[12rem] truncate"
                      >
                        {String(row[column] !== undefined ? row[column] : "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 5 && (
              <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                Showing 5 of {data.length} rows
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPreview;
