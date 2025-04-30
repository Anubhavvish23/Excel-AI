// Generate detailed statistics for the entire dataset
export const generateDetailedStatistics = (rows: any[]) => {
  if (rows.length === 0) return "No data available for statistics.";
  
  const summary = [];
  summary.push(`<h3 class="font-medium mt-3 mb-2">Dataset Overview</h3>`);
  summary.push(`<p>Total rows: ${rows.length}</p>`);
  
  // Get columns from the first row
  const columns = Object.keys(rows[0] || {});
  summary.push(`<p>Total columns: ${columns.length}</p>`);
  
  // Identify data types
  const columnTypes: Record<string, string> = {};
  const numericColumns: string[] = [];
  const categoricalColumns: string[] = [];
  const dateColumns: string[] = [];
  
  columns.forEach(col => {
    const values = rows.map(row => row[col]).filter(v => v !== null && v !== undefined && v !== "");
    
    // Check for numbers
    const allNumeric = values.every(v => !isNaN(Number(v)) && typeof v !== 'boolean');
    
    // Check for dates
    const possibleDates = values.map(v => new Date(v));
    const allDates = possibleDates.every(d => !isNaN(d.getTime()));
    
    if (allNumeric) {
      columnTypes[col] = "Numeric";
      numericColumns.push(col);
    } else if (allDates) {
      columnTypes[col] = "Date";
      dateColumns.push(col);
    } else {
      // Check if categorical (few unique values)
      const uniqueValues = new Set(values);
      if (uniqueValues.size <= 20 || uniqueValues.size / rows.length < 0.05) {
        columnTypes[col] = "Categorical";
        categoricalColumns.push(col);
      } else {
        columnTypes[col] = "Text";
      }
    }
  });
  
  // Summary of column types
  summary.push(`<h3 class="font-medium mt-3 mb-2">Column Types</h3>`);
  summary.push(`<p>Numeric columns: ${numericColumns.length}</p>`);
  summary.push(`<p>Categorical columns: ${categoricalColumns.length}</p>`);
  summary.push(`<p>Date columns: ${dateColumns.length}</p>`);
  summary.push(`<p>Other columns: ${columns.length - numericColumns.length - categoricalColumns.length - dateColumns.length}</p>`);
  
  // Detailed statistics for numeric columns
  if (numericColumns.length > 0) {
    summary.push(`<h3 class="font-medium mt-3 mb-2">Numeric Column Statistics</h3>`);
    summary.push(`<div class="overflow-x-auto">`);
    summary.push(`<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">`);
    summary.push(`<thead class="bg-gray-50 dark:bg-gray-800">
      <tr>
        <th class="px-3 py-2 text-left">Column</th>
        <th class="px-3 py-2 text-left">Min</th>
        <th class="px-3 py-2 text-left">Max</th>
        <th class="px-3 py-2 text-left">Mean</th>
        <th class="px-3 py-2 text-left">Median</th>
        <th class="px-3 py-2 text-left">Sum</th>
        <th class="px-3 py-2 text-left">Missing</th>
      </tr>
    </thead>`);
    summary.push(`<tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">`);
    
    numericColumns.forEach(col => {
      const values = rows.map(row => Number(row[col])).filter(v => !isNaN(v));
      const min = Math.min(...values);
      const max = Math.max(...values);
      const sum = values.reduce((a, b) => a + b, 0);
      const mean = sum / values.length;
      
      // Calculate median
      const sortedValues = [...values].sort((a, b) => a - b);
      const mid = Math.floor(sortedValues.length / 2);
      const median = sortedValues.length % 2 === 0
        ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
        : sortedValues[mid];
      
      const missing = rows.length - values.length;
      
      summary.push(`<tr>
        <td class="px-3 py-2 font-medium">${col}</td>
        <td class="px-3 py-2">${min.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
        <td class="px-3 py-2">${max.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
        <td class="px-3 py-2">${mean.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
        <td class="px-3 py-2">${median.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
        <td class="px-3 py-2">${sum.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
        <td class="px-3 py-2">${missing} (${((missing / rows.length) * 100).toFixed(1)}%)</td>
      </tr>`);
    });
    
    summary.push(`</tbody></table></div>`);
  }
  
  // Distribution for categorical columns
  if (categoricalColumns.length > 0) {
    summary.push(`<h3 class="font-medium mt-3 mb-2">Categorical Column Distributions</h3>`);
    
    categoricalColumns.forEach(col => {
      summary.push(`<h4 class="text-sm font-medium mt-2">${col}</h4>`);
      
      const valueCounts: Record<string, number> = {};
      rows.forEach(row => {
        const val = String(row[col] !== undefined ? row[col] : "");
        valueCounts[val] = (valueCounts[val] || 0) + 1;
      });
      
      const sortedCounts = Object.entries(valueCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      
      summary.push(`<div class="overflow-x-auto">`);
      summary.push(`<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">`);
      summary.push(`<thead class="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th class="px-3 py-2 text-left">Value</th>
          <th class="px-3 py-2 text-left">Count</th>
          <th class="px-3 py-2 text-left">Percentage</th>
        </tr>
      </thead>`);
      summary.push(`<tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">`);
      
      sortedCounts.forEach(([value, count]) => {
        const percentage = (count / rows.length) * 100;
        summary.push(`<tr>
          <td class="px-3 py-2">${value || "(empty)"}</td>
          <td class="px-3 py-2">${count}</td>
          <td class="px-3 py-2">${percentage.toFixed(1)}%</td>
        </tr>`);
      });
      
      summary.push(`</tbody></table></div>`);
    });
  }
  
  return summary.join("");
};

// Generate basic summary statistics for the data
export const generateSummary = (rows: any[], forceSummarize: boolean = false) => {
  if (rows.length === 0) return "No data available for summary.";
  
  // If there are too many rows or summarize is explicitly requested, create a summary
  if (forceSummarize || rows.length > 10) {
    const summary = [];
    summary.push(`Total rows: ${rows.length}`);
    
    // Identify numeric columns for statistics
    const firstRow = rows[0];
    const columns = Object.keys(firstRow);
    
    // Count occurrences of each value for categorical columns
    const categoricalStats: {[key: string]: {[key: string]: number}} = {};
    
    // Calculate min, max, avg for numeric columns
    const numericStats: {[key: string]: {min: number, max: number, sum: number, avg: number}} = {};
    
    columns.forEach(col => {
      // Check if column has numeric values
      const hasNumeric = rows.some(row => !isNaN(Number(row[col])));
      
      if (hasNumeric) {
        const values = rows.map(row => Number(row[col])).filter(val => !isNaN(val));
        if (values.length > 0) {
          const min = Math.min(...values);
          const max = Math.max(...values);
          const sum = values.reduce((a, b) => a + b, 0);
          const avg = sum / values.length;
          
          numericStats[col] = { min, max, sum, avg };
        }
      } 
      
      // Also collect categorical stats for columns with few unique values
      const uniqueValues = new Set(rows.map(row => String(row[col])));
      if (uniqueValues.size <= 10) {
        categoricalStats[col] = {};
        rows.forEach(row => {
          const val = String(row[col]);
          categoricalStats[col][val] = (categoricalStats[col][val] || 0) + 1;
        });
      }
    });
    
    // Add numeric statistics to summary
    for (const [col, stats] of Object.entries(numericStats)) {
      summary.push(`${col}: Min=${stats.min.toFixed(2)}, Max=${stats.max.toFixed(2)}, Avg=${stats.avg.toFixed(2)}`);
    }
    
    // Add top categorical distributions
    for (const [col, counts] of Object.entries(categoricalStats)) {
      const topEntries = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      
      if (topEntries.length > 0) {
        const distributionText = topEntries
          .map(([val, count]) => `${val}: ${count} (${((count / rows.length) * 100).toFixed(1)}%)`)
          .join(", ");
        
        summary.push(`${col} distribution: ${distributionText}`);
      }
    }
    
    return summary.join("<br>");
  }
  
  return ""; // Empty summary if not needed
};

// Generate data quality report
export const generateDataQualityReport = (data: any[]): any => {
  if (!data || data.length === 0) {
    return null;
  }

  const columns = Object.keys(data[0] || {});
  const rowCount = data.length;
  const columnCount = columns.length;
  
  // Array to store column quality metrics
  const columnQualityMetrics: any[] = [];
  
  // Overall suggestions for improvement
  const suggestions: string[] = [];
  
  // Analyze each column
  columns.forEach(columnName => {
    // Extract values for this column
    const values = data.map(row => row[columnName]);
    
    // Count null/empty values
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== "");
    const nullCount = values.length - nonNullValues.length;
    
    // Calculate completeness (percentage of non-null values)
    const completeness = (nonNullValues.length / values.length) * 100;
    
    // Count unique values
    const uniqueValues = new Set(values);
    const uniqueCount = uniqueValues.size;
    
    // Calculate uniqueness (percentage of unique values)
    const uniqueness = (uniqueCount / values.length) * 100;
    
    // Determine data type
    let dataType = "unknown";
    
    // Check if numeric
    const numericValues = nonNullValues.filter(v => !isNaN(Number(v)));
    const isNumeric = numericValues.length === nonNullValues.length && nonNullValues.length > 0;
    
    // Check if date
    const dateValues = nonNullValues.map(v => new Date(v));
    const isDate = dateValues.every(d => !isNaN(d.getTime())) && nonNullValues.length > 0;
    
    // Check if boolean
    const isBool = nonNullValues.every(v => v === true || v === false || v === "true" || v === "false");
    
    if (isNumeric) dataType = "numeric";
    else if (isDate) dataType = "date";
    else if (isBool) dataType = "boolean";
    else if (uniqueCount <= Math.min(10, values.length * 0.1)) dataType = "categorical";
    else dataType = "text";
    
    // Identify issues
    const issues: string[] = [];
    
    // Check for completeness issues
    if (completeness < 90) {
      issues.push(`Missing ${nullCount} values (${(100 - completeness).toFixed(1)}% of data)`);
      
      if (completeness < 70) {
        suggestions.push(`Consider filling missing values in column "${columnName}" or removing it if not critical`);
      }
    }
    
    // Check for uniqueness issues (for ID-like columns)
    if (columnName.toLowerCase().includes("id") && uniqueness < 100) {
      issues.push(`Duplicate IDs detected (${(100 - uniqueness).toFixed(1)}% duplicates)`);
      suggestions.push(`Check for duplicate IDs in column "${columnName}"`);
    }
    
    // Additional type-specific checks
    if (dataType === "numeric") {
      const numbers = nonNullValues.map(v => Number(v));
      
      // Calculate statistics
      const min = Math.min(...numbers);
      const max = Math.max(...numbers);
      const sum = numbers.reduce((a, b) => a + b, 0);
      const avg = sum / numbers.length;
      
      // Check for outliers using IQR method
      const sorted = [...numbers].sort((a, b) => a - b);
      const q1Index = Math.floor(sorted.length * 0.25);
      const q3Index = Math.floor(sorted.length * 0.75);
      const q1 = sorted[q1Index];
      const q3 = sorted[q3Index];
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      
      const outliers = numbers.filter(n => n < lowerBound || n > upperBound);
      
      if (outliers.length > 0) {
        const outlierPercentage = (outliers.length / numbers.length) * 100;
        if (outlierPercentage > 5) {
          issues.push(`Contains ${outliers.length} outliers (${outlierPercentage.toFixed(1)}% of data)`);
          suggestions.push(`Investigate outliers in numeric column "${columnName}"`);
        }
      }
      
      columnQualityMetrics.push({
        name: columnName,
        dataType,
        completeness,
        uniqueness,
        nullCount,
        duplicateCount: values.length - uniqueCount,
        minValue: min,
        maxValue: max,
        avgValue: avg,
        outliers: outliers.length > 0 ? outliers.slice(0, 5) : undefined,
        issues
      });
      
    } else if (dataType === "date") {
      // Check for date range issues
      const dates = dateValues.filter(d => !isNaN(d.getTime()));
      
      if (dates.length > 0) {
        const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
        
        // Check for future dates if suspicious
        const now = new Date();
        const futureDates = dates.filter(d => d > now);
        
        if (futureDates.length > 0) {
          const futurePercentage = (futureDates.length / dates.length) * 100;
          issues.push(`Contains ${futureDates.length} future dates (${futurePercentage.toFixed(1)}% of data)`);
          
          if (futurePercentage > 10) {
            suggestions.push(`Check future dates in column "${columnName}"`);
          }
        }
        
        columnQualityMetrics.push({
          name: columnName,
          dataType,
          completeness,
          uniqueness,
          nullCount,
          duplicateCount: values.length - uniqueCount,
          minValue: minDate.toISOString().split('T')[0],
          maxValue: maxDate.toISOString().split('T')[0],
          issues
        });
      }
      
    } else {
      // For text and categorical
      columnQualityMetrics.push({
        name: columnName,
        dataType,
        completeness,
        uniqueness,
        nullCount,
        duplicateCount: values.length - uniqueCount,
        issues
      });
      
      // For highly unique text fields that might be identifiers
      if (dataType === "text" && uniqueness > 90 && uniqueness < 100) {
        issues.push(`Near-unique column (${uniqueness.toFixed(1)}% unique values)`);
        suggestions.push(`Check for possible duplicates in near-unique column "${columnName}"`);
      }
    }
  });
  
  // Calculate overall data quality score
  // Based on completeness, uniqueness and number of issues
  const columnScores = columnQualityMetrics.map(col => {
    // Base score from completeness
    let score = col.completeness;
    
    // Reduce score based on issues
    score -= col.issues.length * 5;
    
    // For potential ID columns, uniqueness is important
    if (col.name.toLowerCase().includes('id')) {
      score = (score + col.uniqueness) / 2;
    }
    
    return Math.max(0, Math.min(100, score));
  });
  
  const overallScore = columnScores.reduce((sum, score) => sum + score, 0) / columnScores.length;
  
  // Add general suggestions based on overall analysis
  if (nullCount(columnQualityMetrics) > rowCount * columnCount * 0.2) {
    suggestions.push("Your dataset has a significant amount of missing data. Consider data imputation techniques.");
  }
  
  if (hasTimeSeries(columnQualityMetrics)) {
    suggestions.push("Your data appears to contain time series. Consider time-based visualizations and analyses.");
  }
  
  return {
    overallScore,
    rowCount,
    columnCount,
    timestamp: new Date(),
    columns: columnQualityMetrics,
    suggestions: Array.from(new Set(suggestions)) // Remove duplicate suggestions
  };
};

// Helper functions for data quality report
function nullCount(columns: any[]): number {
  return columns.reduce((sum, col) => sum + col.nullCount, 0);
}

function hasTimeSeries(columns: any[]): boolean {
  return columns.some(col => col.dataType === "date");
}
