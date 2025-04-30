
import React from 'react';
import { Lightbulb } from 'lucide-react';

interface QuerySuggestionsProps {
  onSelect: (query: string) => void;
}

const QuerySuggestions: React.FC<QuerySuggestionsProps> = ({ onSelect }) => {
  const suggestions = [
    "Summarize the data",
    "Find the top 5 values",
    "Calculate the average",
    "Show data distribution",
    "Identify outliers",
    "Compare columns",
    "Visualize as bar chart"
  ];

  return (
    <div className="mt-2">
      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
        <Lightbulb className="h-3 w-3" />
        <span>Try asking</span>
      </div>
      <div className="grid grid-cols-1 gap-1">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="text-xs text-left px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
            onClick={() => onSelect(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuerySuggestions;
