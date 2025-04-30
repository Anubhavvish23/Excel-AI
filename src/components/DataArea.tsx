
import React from "react";
import DataPreview from "./DataPreview";
import DataVisualizer from "./DataVisualizer";
import Dashboard from "./Dashboard";
import { ExcelData } from "@/types";
import DataForecasting from "./DataForecasting";
import { TrendingUp, BarChart2, Grid3X3, Layers } from "lucide-react";

interface DataAreaProps {
  excelData: ExcelData | null;
  filteredData: any[] | null;
  visualizerData: any[] | null;
  showDashboard: boolean;
  onFilter: (filteredData: any[]) => void;
  setVisualizerData: (data: any[] | null) => void;
  setShowDashboard: (show: boolean) => void;
  visualizationOptions: any;
  setVisualizationOptions: (options: any) => void;
  onFeatureSelect?: (feature: string | null) => void;
  activeFeature?: string | null;
}

const DataArea: React.FC<DataAreaProps> = ({
  excelData,
  filteredData,
  visualizerData,
  showDashboard,
  onFilter,
  setVisualizerData,
  setShowDashboard,
  visualizationOptions,
  setVisualizationOptions,
  onFeatureSelect,
  activeFeature
}) => {
  // No data uploaded yet
  if (!excelData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="text-center p-6">
          <p className="text-gray-500 dark:text-gray-400">
            Upload an Excel file to see data preview
          </p>
        </div>
      </div>
    );
  }

  // Feature selector tabs
  const FeatureTabs = () => (
    <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4">
      <button
        onClick={() => onFeatureSelect && onFeatureSelect(null)}
        className={`px-3 py-2 text-sm font-medium border-b-2 ${
          !activeFeature 
            ? "border-primary text-primary" 
            : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
        } transition-colors`}
      >
        <div className="flex items-center space-x-1">
          <Grid3X3 className="w-4 h-4" />
          <span>Data</span>
        </div>
      </button>
      
      <button
        onClick={() => onFeatureSelect && onFeatureSelect('forecasting')}
        className={`px-3 py-2 text-sm font-medium border-b-2 ${
          activeFeature === 'forecasting' 
            ? "border-primary text-primary" 
            : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
        } transition-colors`}
      >
        <div className="flex items-center space-x-1">
          <TrendingUp className="w-4 h-4" />
          <span>Forecasting</span>
        </div>
      </button>
      
      <button
        onClick={() => {
          setShowDashboard(true);
          onFeatureSelect && onFeatureSelect(null);
        }}
        className={`px-3 py-2 text-sm font-medium border-b-2 ${
          showDashboard && !activeFeature
            ? "border-primary text-primary" 
            : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
        } transition-colors`}
      >
        <div className="flex items-center space-x-1">
          <BarChart2 className="w-4 h-4" />
          <span>Dashboard</span>
        </div>
      </button>
    </div>
  );

  // Feature content
  if (activeFeature === 'forecasting') {
    return (
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-hidden">
        <FeatureTabs />
        <div className="flex-1 overflow-auto">
          <DataForecasting
            data={filteredData || excelData.data}
            excelData={excelData}
          />
        </div>
      </div>
    );
  }

  // Show dashboard if enabled
  if (showDashboard) {
    return (
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-hidden">
        <FeatureTabs />
        <div className="flex-1 overflow-auto">
          <Dashboard
            data={filteredData || excelData.data}
            // Remove the onClose prop since it doesn't exist in DashboardProps
          />
        </div>
      </div>
    );
  }

  // Show visualizer if we have visualizer data
  if (visualizerData) {
    return (
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-hidden">
        <FeatureTabs />
        <div className="flex-1 overflow-auto">
          <DataVisualizer
            data={visualizerData}
            options={visualizationOptions}
            onOptionsChange={setVisualizationOptions}
            // Remove the onClose prop since it doesn't exist in DataVisualizerProps
            // Change setOptions to onOptionsChange to match the interface
          />
        </div>
      </div>
    );
  }

  // Default: show data preview
  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-hidden">
      <FeatureTabs />
      <div className="flex-1 overflow-auto">
        <DataPreview
          data={excelData.data}
          fileName={excelData.fileName}
          sheetName={excelData.sheets[0]}
          // Remove filteredData and onFilter props since they don't exist in DataPreviewProps
        />
      </div>
    </div>
  );
};

export default DataArea;
