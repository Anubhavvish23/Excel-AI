
import { useState } from "react";

export type ChartType = "bar" | "line" | "pie" | "area" | "scatter" | "radar" | "mixed";

export interface VisualizationOptions {
  chartType: ChartType;
  title?: string;
  xAxis?: string;
  yAxis?: string;
  colorScheme?: string;
}

export const useVisualizationData = () => {
  const [visualizerData, setVisualizerData] = useState<any[] | null>(null);
  const [showDashboard, setShowDashboard] = useState<boolean>(false);
  const [visualizationOptions, setVisualizationOptions] = useState<VisualizationOptions>({
    chartType: "bar",
    colorScheme: "default"
  });
  const [dataQualityReport, setDataQualityReport] = useState<any | null>(null);

  // Reset visualization when loading new data
  const resetVisualization = () => {
    setVisualizerData(null);
    setShowDashboard(false);
    setDataQualityReport(null);
  };

  return {
    visualizerData,
    showDashboard,
    visualizationOptions,
    dataQualityReport,
    setVisualizerData,
    setShowDashboard,
    setVisualizationOptions,
    setDataQualityReport,
    resetVisualization
  };
};

export default useVisualizationData;
