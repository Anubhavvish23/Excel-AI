
import React from "react";

interface SheetSelectorProps {
  sheets: string[];
  selectedSheet: string;
  onChange: (sheetName: string) => void;
}

const SheetSelector: React.FC<SheetSelectorProps> = ({
  sheets,
  selectedSheet,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <label
        htmlFor="sheet-selector"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Sheet
      </label>
      <select
        id="sheet-selector"
        value={selectedSheet}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
      >
        {sheets.map((sheet) => (
          <option key={sheet} value={sheet}>
            {sheet}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SheetSelector;
