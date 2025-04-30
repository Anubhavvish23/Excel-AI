
import { generateDetailedStatistics, generateSummary } from "./dataAnalysisService";

export interface QueryResult {
  rows: any[];
  summary: string;
  isVisualization?: boolean;
  isDashboard?: boolean;
  isStatistics?: boolean;
  isAdvancedFiltering?: boolean;
  isKeyboardShortcuts?: boolean;
}

// Process Excel queries with advanced capabilities
export const processExcelQuery = (query: string, excelData: any): QueryResult => {
  if (!excelData || !query) return { rows: [], summary: "No data available" };

  // Check if user wants to see advanced filtering
  if (query.toLowerCase().includes("advanced filter") || 
      query.toLowerCase().includes("advanced filtering") ||
      query.toLowerCase().includes("custom filters")) {
    return { 
      rows: excelData.data, 
      summary: "Advanced filtering mode activated. Use the controls to filter your data.",
      isAdvancedFiltering: true
    };
  }

  // Check for data profile or comprehensive statistics
  if (query.toLowerCase().includes("data profile") || 
      query.toLowerCase().includes("comprehensive") || 
      query.toLowerCase().includes("detailed statistics")) {
    return { 
      rows: excelData.data, 
      summary: generateDetailedStatistics(excelData.data),
      isStatistics: true 
    };
  }

  // Check for keyboard shortcuts request
  if (query.toLowerCase().includes("keyboard") || 
      query.toLowerCase().includes("shortcuts") || 
      query.toLowerCase().includes("hotkeys")) {
    return { 
      rows: [], 
      summary: "Keyboard shortcuts displayed. Press Esc to close.",
      isKeyboardShortcuts: true 
    };
  }

  // Check for visualization keywords
  const isVisualizationQuery = 
    query.toLowerCase().includes("chart") || 
    query.toLowerCase().includes("graph") || 
    query.toLowerCase().includes("plot") || 
    query.toLowerCase().includes("visualize") ||
    query.toLowerCase().includes("dashboard");

  // Check for dashboard keywords
  const isDashboardQuery =
    query.toLowerCase().includes("dashboard") ||
    query.toLowerCase().includes("overview") ||
    query.toLowerCase().includes("summary view");
    
  // Check for summary or statistics keywords
  const isStatisticsQuery =
    query.toLowerCase().includes("summarize") ||
    query.toLowerCase().includes("summary") ||
    query.toLowerCase().includes("statistics") ||
    query.toLowerCase().includes("analyze") ||
    query.toLowerCase().includes("profile") ||
    query.toLowerCase().includes("describe");

  // Convert query to lowercase for case-insensitive search
  const queryLower = query.toLowerCase();

  // Check for filter keywords
  const isFilterQuery = 
    queryLower.includes("filter") || 
    queryLower.includes("show") || 
    queryLower.includes("only") || 
    queryLower.includes("which") ||
    queryLower.includes("where");

  // Check for sort keywords
  const isSortQuery = 
    queryLower.includes("sort") || 
    queryLower.includes("order by") || 
    queryLower.includes("arrange");

  // Check for summarize keywords
  const isSummarizeQuery = 
    queryLower.includes("summarize") || 
    queryLower.includes("summary") || 
    queryLower.includes("stats") || 
    queryLower.includes("statistics") ||
    queryLower.includes("count");

  // Initial data
  let matchingRows = [...excelData.data];
  
  // Generate full statistics if it's a statistics query
  if (isStatisticsQuery) {
    return { 
      rows: matchingRows, 
      summary: generateDetailedStatistics(matchingRows),
      isStatistics: true 
    };
  }

  // Default search matches any value containing the search term
  if (!isFilterQuery && !isSortQuery && !isSummarizeQuery && !isVisualizationQuery) {
    matchingRows = excelData.data.filter((row) => {
      return Object.values(row).some((value) =>
        String(value).toLowerCase().includes(queryLower)
      );
    });
  }

  // Handle specific filter queries
  if (isFilterQuery) {
    // Extract potential column names from the data
    const columns = excelData.data.length > 0 ? Object.keys(excelData.data[0]) : [];
    
    // Find value criteria like "ok", "not ok", etc.
    const commonValues = ["ok", "not ok", "yes", "no", "true", "false", "pass", "fail"];
    const valueMatches = commonValues.filter(val => queryLower.includes(val));
    
    // Try to identify which column and value to filter by
    let targetColumn = "";
    let targetValue = "";

    // Look for column names in the query
    for (const col of columns) {
      if (queryLower.includes(col.toLowerCase())) {
        targetColumn = col;
        break;
      }
    }

    // If we found a value to filter by
    if (valueMatches.length > 0) {
      targetValue = valueMatches[0];
      
      // If no specific column was mentioned, search all columns
      if (!targetColumn) {
        matchingRows = excelData.data.filter(row => {
          return Object.entries(row).some(([col, val]) => 
            String(val).toLowerCase() === targetValue
          );
        });
      } else {
        // Filter by the specific column and value
        matchingRows = excelData.data.filter(row => {
          return String(row[targetColumn]).toLowerCase() === targetValue;
        });
      }
    }
    // If no common value was found but a column was mentioned, return all entries with non-empty values for that column
    else if (targetColumn) {
      matchingRows = excelData.data.filter(row => {
        return row[targetColumn] !== undefined && row[targetColumn] !== null && row[targetColumn] !== "";
      });
    }
  }

  // Handle sorting
  if (isSortQuery) {
    const columns = excelData.data.length > 0 ? Object.keys(excelData.data[0]) : [];
    let sortColumn = "";
    
    // Check which column to sort by
    for (const col of columns) {
      if (queryLower.includes(col.toLowerCase())) {
        sortColumn = col;
        break;
      }
    }

    // If a column was found, sort by it
    if (sortColumn) {
      const isDescending = 
        queryLower.includes("descending") || 
        queryLower.includes("desc") || 
        queryLower.includes("high to low") ||
        queryLower.includes("largest") ||
        queryLower.includes("highest");

      matchingRows = [...matchingRows].sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];
        
        // Handle numeric sorting
        if (!isNaN(Number(valA)) && !isNaN(Number(valB))) {
          return isDescending 
            ? Number(valB) - Number(valA) 
            : Number(valA) - Number(valB);
        }
        
        // Handle string sorting
        return isDescending 
          ? String(valB).localeCompare(String(valA)) 
          : String(valA).localeCompare(String(valB));
      });
    }
  }

  // Generate summary statistics
  let summary = generateSummary(matchingRows, isSummarizeQuery);

  return { 
    rows: matchingRows, 
    summary, 
    isVisualization: isVisualizationQuery,
    isDashboard: isDashboardQuery
  };
};

// Format response for the chat interface
export const formatResponse = (result: QueryResult) => {
  const { rows, summary, isVisualization, isDashboard, isStatistics, isAdvancedFiltering, isKeyboardShortcuts } = result;
  
  if (isKeyboardShortcuts) {
    return `
      <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/30 dark:border-blue-800">
        <h3 class="font-medium mb-2 text-blue-700 dark:text-blue-300">Keyboard Shortcuts</h3>
        <div class="text-sm text-blue-600 dark:text-blue-300">
          <p>I've displayed the keyboard shortcuts overlay. Here's a summary:</p>
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <li><kbd class="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+D</kbd> Toggle dark mode</li>
            <li><kbd class="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+E</kbd> Access export options</li>
            <li><kbd class="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+K</kbd> Show this shortcuts help</li>
            <li><kbd class="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">Esc</kbd> Close dialogs/overlays</li>
          </ul>
        </div>
      </div>
    `;
  }
  
  if (isAdvancedFiltering) {
    return `
      <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/30 dark:border-blue-800">
        <h3 class="font-medium mb-2 text-blue-700 dark:text-blue-300">Advanced Filtering Mode</h3>
        <div class="text-sm text-blue-600 dark:text-blue-300">
          <p>I've activated the advanced filtering tools. You can now:</p>
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <li>Add multiple filter conditions</li>
            <li>Combine different operators (contains, equals, etc.)</li>
            <li>See results update in real-time</li>
            <li>The filter panel is displayed below the data preview</li>
          </ul>
          <p class="mt-2">Use the controls to refine your data and find exactly what you need.</p>
        </div>
      </div>
    `;
  }
  
  if (rows.length === 0) {
    // Enhanced response when no data is found
    const noDataResponses = {
      "summarize": `
        <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/30 dark:border-blue-800">
          <h3 class="font-medium mb-2 text-blue-700 dark:text-blue-300">Data Summary Guidance</h3>
          <div class="text-sm text-blue-600 dark:text-blue-300">
            <p>I don't see any data to summarize. Here's what you can do:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li>Upload an Excel file using the upload button on the left panel</li>
              <li>Make sure your Excel file contains data in the selected sheet</li>
              <li>Try selecting a different sheet if your file has multiple sheets</li>
              <li>For a meaningful summary, your data should have headers and organized in columns</li>
            </ul>
            <p class="mt-2">Once your data is loaded, I can provide statistical insights, identify trends, and highlight key metrics for you.</p>
          </div>
        </div>
      `,
      "highest": `
        <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/30 dark:border-blue-800">
          <h3 class="font-medium mb-2 text-blue-700 dark:text-blue-300">Finding Maximum Values</h3>
          <div class="text-sm text-blue-600 dark:text-blue-300">
            <p>I don't see any data to analyze for maximum values. Here's what you can do:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li>Upload an Excel file with numerical data</li>
              <li>Ensure your Excel file contains columns with numerical values</li>
              <li>Try selecting a different sheet if your file has multiple sheets</li>
            </ul>
            <p class="mt-2">When your data is loaded, I can identify maximum values across columns, highlight top performers, and provide comparative analysis.</p>
          </div>
        </div>
      `,
      "default": `
        <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/30 dark:border-blue-800">
          <h3 class="font-medium mb-2 text-blue-700 dark:text-blue-300">No Data Available</h3>
          <div class="text-sm text-blue-600 dark:text-blue-300">
            <p>I don't see any data to analyze for your query. Here's what you can do:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li>Upload an Excel file using the upload button on the left panel</li>
              <li>Make sure your Excel file contains relevant data</li>
              <li>Try selecting a different sheet if your file has multiple sheets</li>
              <li>Check that your query matches the content in your Excel file</li>
            </ul>
            <p class="mt-2">Once your data is loaded, I can help analyze, visualize, and extract insights from your Excel data.</p>
          </div>
        </div>
      `
    };

    // Determine which response to use based on the query
    const queryLower = result.summary.toLowerCase();
    let responseType = "default";

    if (queryLower.includes("summarize") || queryLower.includes("summary")) {
      responseType = "summarize";
    } else if (queryLower.includes("highest") || queryLower.includes("maximum") || queryLower.includes("max") || queryLower.includes("top")) {
      responseType = "highest";
    }

    return noDataResponses[responseType as keyof typeof noDataResponses];
  }

  let response = "";
  
  // Add full statistics if it's a statistics query
  if (isStatistics) {
    response += `<div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/30 dark:border-blue-800">
      <h3 class="font-medium mb-2 text-blue-700 dark:text-blue-300">Data Statistics</h3>
      <div class="text-sm text-blue-600 dark:text-blue-300">${summary}</div>
    </div>`;
    return response;
  }
  
  // Add summary if available
  if (summary) {
    response += `<div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/30 dark:border-blue-800">
      <h3 class="font-medium mb-2 text-blue-700 dark:text-blue-300">Summary</h3>
      <div class="text-sm text-blue-600 dark:text-blue-300">${summary}</div>
    </div>`;
  }
  
  // Add visualization message if it's a visualization query
  if (isVisualization) {
    response += `<div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/30 dark:border-blue-800">
      <h3 class="font-medium mb-2 text-blue-700 dark:text-blue-300">Visualization</h3>
      <div class="text-sm text-blue-600 dark:text-blue-300">
        I've prepared a visualization based on ${rows.length} rows of data. You can interact with it below.
      </div>
    </div>`;
  }
  
  // Add dashboard message if it's a dashboard query
  if (isDashboard) {
    response += `<div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/30 dark:border-blue-800">
      <h3 class="font-medium mb-2 text-blue-700 dark:text-blue-300">Dashboard</h3>
      <div class="text-sm text-blue-600 dark:text-blue-300">
        I've prepared an interactive dashboard for your data. You can explore different views and metrics below.
      </div>
    </div>`;
    
    // Skip showing the table for dashboard queries
    return response;
  }

  // Create a table with the matching rows if not too many
  if (rows.length <= 100 && !isVisualization) {
    const columns = Object.keys(rows[0] || {});
    const tableHeaders = columns.map((col) => 
      `<th class="px-4 py-2 bg-gray-100 dark:bg-gray-700 sticky top-0 whitespace-nowrap text-left">${col}</th>`
    ).join('');
    
    const tableRows = rows.map((row) => {
      const cells = columns.map((col) => 
        `<td class="px-4 py-2 border-t border-gray-200 dark:border-gray-700 whitespace-nowrap">${row[col] !== undefined ? row[col] : ""}</td>`
      ).join('');
      return `<tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50">${cells}</tr>`;
    }).join('');

    response += `
      <p class="mb-2">Found ${rows.length} matching row(s):</p>
      <div class="overflow-x-auto max-h-72 border border-gray-200 dark:border-gray-700 rounded-lg">
        <table class="min-w-full bg-white dark:bg-gray-800 text-sm">
          <thead>
            <tr>${tableHeaders}</tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    `;
  } else if (!isVisualization) {
    // Just show a summary for large result sets
    response += `<p>Found ${rows.length} matching rows. The result set is too large to display in full.</p>`;
  }

  return response;
};
