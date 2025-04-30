
import React, { useState, useEffect } from "react";
import { Search, X, Filter, SlidersHorizontal } from "lucide-react";

interface AdvancedFilterProps {
  data: any[];
  onFilter: (filteredData: any[]) => void;
}

const AdvancedFilter: React.FC<AdvancedFilterProps> = ({ data, onFilter }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<{ column: string; operator: string; value: string }[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);

  useEffect(() => {
    if (data && data.length > 0) {
      setAvailableColumns(Object.keys(data[0]));
    }
  }, [data]);

  useEffect(() => {
    applyFilters();
  }, [filters]);

  const addFilter = () => {
    if (availableColumns.length === 0) return;
    setFilters([...filters, { column: availableColumns[0], operator: "contains", value: "" }]);
  };

  const removeFilter = (index: number) => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    setFilters(newFilters);
  };

  const updateFilter = (index: number, field: "column" | "operator" | "value", newValue: string) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [field]: newValue };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    if (!data || data.length === 0 || filters.length === 0) {
      onFilter(data);
      return;
    }

    const filteredData = data.filter(row => {
      return filters.every(filter => {
        const { column, operator, value } = filter;
        if (!value) return true; // Skip empty filters
        
        const cellValue = String(row[column] || "").toLowerCase();
        const filterValue = value.toLowerCase();
        
        switch (operator) {
          case "contains":
            return cellValue.includes(filterValue);
          case "equals":
            return cellValue === filterValue;
          case "starts":
            return cellValue.startsWith(filterValue);
          case "ends":
            return cellValue.endsWith(filterValue);
          case "greater":
            return !isNaN(Number(cellValue)) && !isNaN(Number(filterValue)) && 
              Number(cellValue) > Number(filterValue);
          case "less":
            return !isNaN(Number(cellValue)) && !isNaN(Number(filterValue)) && 
              Number(cellValue) < Number(filterValue);
          default:
            return true;
        }
      });
    });

    onFilter(filteredData);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-3 flex items-center justify-between cursor-pointer border-b border-gray-200 dark:border-gray-700"
        onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center">
          <SlidersHorizontal className="w-4 h-4 mr-2 text-primary" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Advanced Filters
          </h3>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {filters.length > 0 ? `${filters.length} active` : "None"}
        </span>
      </div>
      
      {isExpanded && (
        <div className="p-3 space-y-3">
          {filters.length === 0 ? (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-3">
              No filters applied. Add a filter to refine your data.
            </div>
          ) : (
            <div className="space-y-3">
              {filters.map((filter, index) => (
                <div key={index} className="flex flex-wrap gap-2 items-center pb-3 border-b border-gray-100 dark:border-gray-700">
                  <select
                    value={filter.column}
                    onChange={(e) => updateFilter(index, "column", e.target.value)}
                    className="text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-2 py-1 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {availableColumns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={filter.operator}
                    onChange={(e) => updateFilter(index, "operator", e.target.value)}
                    className="text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-2 py-1 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="contains">contains</option>
                    <option value="equals">equals</option>
                    <option value="starts">starts with</option>
                    <option value="ends">ends with</option>
                    <option value="greater">greater than</option>
                    <option value="less">less than</option>
                  </select>
                  
                  <div className="flex-1 relative min-w-[120px]">
                    <input
                      type="text"
                      value={filter.value}
                      onChange={(e) => updateFilter(index, "value", e.target.value)}
                      placeholder="Value"
                      className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-2 py-1 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <Search className="absolute right-2 top-1 w-3 h-3 text-gray-400" />
                  </div>
                  
                  <button
                    onClick={() => removeFilter(index)}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={addFilter}
              className="text-xs flex items-center text-primary hover:text-primary/80"
            >
              <Filter className="w-3 h-3 mr-1" />
              Add Filter
            </button>
            
            {filters.length > 0 && (
              <button
                onClick={() => setFilters([])}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilter;
