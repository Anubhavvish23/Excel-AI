
import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, X, Edit2, FilePlus } from "lucide-react";
import { toast } from "sonner";
import DataExport from "./DataExport";

interface EditableDataTableProps {
  data: any[];
  fileName: string;
  onDataChange?: (updatedData: any[]) => void;
}

const EditableDataTable: React.FC<EditableDataTableProps> = ({ 
  data, 
  fileName,
  onDataChange 
}) => {
  const [editableData, setEditableData] = useState<any[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editingCell, setEditingCell] = useState<{row: number, col: string} | null>(null);

  useEffect(() => {
    // Deep clone the data to avoid mutating props
    setEditableData(JSON.parse(JSON.stringify(data)));
  }, [data]);

  if (!editableData || editableData.length === 0) {
    return (
      <div className="text-center p-6 text-gray-500 dark:text-gray-400">
        No data available to edit
      </div>
    );
  }

  const columns = Object.keys(editableData[0] || {});

  const handleCellChange = (rowIndex: number, column: string, value: string) => {
    const newData = [...editableData];
    newData[rowIndex][column] = value;
    setEditableData(newData);
  };

  const handleCellClick = (rowIndex: number, column: string) => {
    if (editMode) {
      setEditingCell({ row: rowIndex, col: column });
    }
  };

  const handleSaveChanges = () => {
    setEditMode(false);
    setEditingCell(null);
    if (onDataChange) {
      onDataChange(editableData);
    }
    toast.success("Changes saved successfully");
  };

  const handleCancelChanges = () => {
    setEditMode(false);
    setEditingCell(null);
    // Reset to original data
    setEditableData(JSON.parse(JSON.stringify(data)));
    toast.info("Changes cancelled");
  };

  const handleAddRow = () => {
    // Create a new empty row with all columns
    const newRow = {} as any;
    columns.forEach(col => {
      newRow[col] = "";
    });
    
    setEditableData([...editableData, newRow]);
    toast.success("New row added");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {editMode ? "Edit Data" : "Data Preview"}
        </h3>
        <div className="flex gap-2">
          {!editMode ? (
            <Button 
              onClick={() => setEditMode(true)}
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit Data
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleAddRow}
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
              >
                <FilePlus className="w-4 h-4 mr-1" />
                Add Row
              </Button>
              <Button 
                onClick={handleSaveChanges}
                size="sm"
                variant="default"
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button 
                onClick={handleCancelChanges}
                size="sm"
                variant="outline"
                className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/30 dark:hover:bg-red-900/20"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="overflow-auto rounded-md border border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800">
              {columns.map((column) => (
                <TableHead 
                  key={column}
                  className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3"
                >
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {editableData.map((row, rowIndex) => (
              <TableRow 
                key={rowIndex}
                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                {columns.map((column) => (
                  <TableCell 
                    key={`${rowIndex}-${column}`}
                    className={`py-2 px-4 text-sm ${editMode ? 'cursor-pointer' : ''}`}
                    onClick={() => handleCellClick(rowIndex, column)}
                  >
                    {editingCell && editingCell.row === rowIndex && editingCell.col === column ? (
                      <Input
                        value={row[column] !== undefined ? row[column] : ""}
                        onChange={(e) => handleCellChange(rowIndex, column, e.target.value)}
                        autoFocus
                        onBlur={() => setEditingCell(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setEditingCell(null);
                        }}
                        className="w-full p-1 text-sm"
                      />
                    ) : (
                      <div className={`${editMode ? 'px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700' : ''}`}>
                        {row[column] !== undefined ? row[column] : ""}
                      </div>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {!editMode && (
        <div className="mt-4">
          <DataExport data={editableData} fileName={fileName} />
        </div>
      )}
    </div>
  );
};

export default EditableDataTable;
