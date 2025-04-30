
// Excel data types
export interface ExcelData {
  sheets: string[];
  data: any[];
  fileName: string;
}

// Query result types
export interface QueryResult {
  rows: any[];
  summary: string;
  isVisualization?: boolean;
  isDashboard?: boolean;
  isStatistics?: boolean;
  isAdvancedFiltering?: boolean;
  isKeyboardShortcuts?: boolean;
}

// Data Quality Types
export interface ColumnQuality {
  name: string;
  dataType: string;
  completeness: number;
  uniqueness: number;
  minValue?: number | string;
  maxValue?: number | string;
  avgValue?: number;
  nullCount: number;
  duplicateCount: number;
  outliers?: number[];
  patterns?: string[];
  issues?: string[];
}

export interface DataQualityReport {
  overallScore: number;
  rowCount: number;
  columnCount: number;
  timestamp: Date;
  columns: ColumnQuality[];
  suggestions: string[];
}

// Theme Types
export interface ThemeOption {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  isDark: boolean;
}
