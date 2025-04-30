
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { 
  BarChart2, 
  LineChart as LineIcon, 
  PieChart as PieIcon,
  Activity,
  Circle,
  Compass,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ColumnQuality, DataQualityReport } from "@/types";
import { ChartType, VisualizationOptions } from "@/hooks/useVisualizationData";

const COLOR_SCHEMES = {
  default: ["#3B82F6", "#10B981", "#F97316", "#8B5CF6", "#EC4899", "#EF4444"],
  pastel: ["#AADAFF", "#A2EFD0", "#FFD0A3", "#D8C4FF", "#FFCAEC", "#FFCACA"],
  vibrant: ["#0066FF", "#00CC88", "#FF6600", "#6633CC", "#FF0099", "#FF0000"],
  monochrome: ["#1a237e", "#283593", "#303f9f", "#3949ab", "#3f51b5", "#5c6bc0"],
  contrast: ["#2563EB", "#16A34A", "#EA580C", "#7C3AED", "#DB2777", "#DC2626"]
};

interface DataVisualizerProps {
  data: any[];
  title?: string;
  options?: VisualizationOptions;
  onOptionsChange?: (options: VisualizationOptions) => void;
  qualityReport?: DataQualityReport | null;
}

const DataVisualizer: React.FC<DataVisualizerProps> = ({ 
  data, 
  title, 
  options = { chartType: "bar", colorScheme: "default" },
  onOptionsChange,
  qualityReport
}) => {
  const [activeTab, setActiveTab] = useState<string>("chart");
  const [chartType, setChartType] = useState<ChartType>(options.chartType || "bar");
  const [xAxis, setXAxis] = useState<string>(options.xAxis || "");
  const [yAxis, setYAxis] = useState<string>(options.yAxis || "");
  const [colorScheme, setColorScheme] = useState<string>(options.colorScheme || "default");

  // Get colors based on selected scheme
  const getColors = () => COLOR_SCHEMES[colorScheme as keyof typeof COLOR_SCHEMES] || COLOR_SCHEMES.default;

  useEffect(() => {
    // Update parent component when options change
    if (onOptionsChange) {
      onOptionsChange({
        chartType,
        xAxis,
        yAxis,
        colorScheme,
        title: options.title || title
      });
    }
  }, [chartType, xAxis, yAxis, colorScheme]);

  if (!data || data.length === 0) {
    return (
      <div className="text-center p-6 text-gray-500 dark:text-gray-400">
        No data available to visualize
      </div>
    );
  }

  const columns = Object.keys(data[0]);
  const numericColumns = columns.filter((column) => 
    !isNaN(Number(data[0][column]))
  );

  // Auto-select axes if not chosen yet
  React.useEffect(() => {
    if (columns.length > 0 && !xAxis) {
      // Prefer non-numeric columns for x-axis
      const nonNumericColumns = columns.filter(col => !numericColumns.includes(col));
      setXAxis(nonNumericColumns.length > 0 ? nonNumericColumns[0] : columns[0]);
    }
    
    if (numericColumns.length > 0 && !yAxis) {
      setYAxis(numericColumns[0]);
    }
  }, [data, columns.length, numericColumns.length]);

  const prepareChartData = () => {
    // For pie charts, we need to aggregate data
    if (chartType === "pie" && xAxis && yAxis) {
      const aggregatedData: { [key: string]: number } = {};
      
      data.forEach(item => {
        const key = String(item[xAxis]);
        const value = Number(item[yAxis]) || 0;
        
        if (aggregatedData[key]) {
          aggregatedData[key] += value;
        } else {
          aggregatedData[key] = value;
        }
      });
      
      return Object.entries(aggregatedData).map(([name, value]) => ({
        name,
        value
      }));
    }
    
    // For scatter plots, ensure we have numeric data for both axes
    if (chartType === "scatter") {
      return data.map(item => ({
        x: Number(item[xAxis]) || 0,
        y: Number(item[yAxis]) || 0,
        name: String(item[xAxis]),
      }));
    }
    
    // For radar charts, transform data to radar format
    if (chartType === "radar" && xAxis) {
      const categories = [...new Set(data.map(item => item[xAxis]))];
      const results: any[] = [];
      
      numericColumns.forEach(column => {
        if (column !== xAxis) {
          const entry: any = { subject: column };
          
          categories.forEach(category => {
            const matchingItems = data.filter(item => item[xAxis] === category);
            const average = matchingItems.reduce((sum, item) => sum + (Number(item[column]) || 0), 0) / matchingItems.length;
            entry[String(category)] = average;
          });
          
          results.push(entry);
        }
      });
      
      return results.length > 0 ? results : data;
    }
    
    // For mixed charts, use the original data
    if (chartType === "mixed") {
      return data.map(item => ({
        name: String(item[xAxis]),
        value: Number(item[yAxis]) || 0,
        average: calculateAverage(yAxis)
      }));
    }
    
    // For bar, line, and area charts, use data directly
    return data;
  };

  const calculateAverage = (column: string) => {
    const values = data.map(item => Number(item[column])).filter(v => !isNaN(v));
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  };

  const chartData = prepareChartData();
  const colors = getColors();

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={350} className="chart-appear">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={xAxis} 
                angle={-45} 
                textAnchor="end" 
                height={70} 
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "rgba(255, 255, 255, 0.9)", 
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  border: "none" 
                }}
                formatter={(value) => [value, yAxis]}
              />
              <Legend />
              <Bar 
                dataKey={yAxis} 
                fill={colors[0]} 
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case "line":
        return (
          <ResponsiveContainer width="100%" height={350} className="chart-appear">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={xAxis} 
                angle={-45} 
                textAnchor="end" 
                height={70} 
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "rgba(255, 255, 255, 0.9)", 
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  border: "none" 
                }}
                formatter={(value) => [value, yAxis]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={yAxis} 
                stroke={colors[0]} 
                strokeWidth={2}
                dot={{ fill: colors[0], strokeWidth: 2 }}
                activeDot={{ r: 8 }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case "area":
        return (
          <ResponsiveContainer width="100%" height={350} className="chart-appear">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={xAxis} 
                angle={-45} 
                textAnchor="end" 
                height={70} 
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "rgba(255, 255, 255, 0.9)", 
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  border: "none" 
                }}
                formatter={(value) => [value, yAxis]}
              />
              <Legend />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors[0]} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey={yAxis} 
                stroke={colors[0]} 
                fill="url(#colorGradient)" 
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={350} className="chart-appear">
            <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={130}
                innerRadius={50}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                animationDuration={1000}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}`, yAxis]}
                contentStyle={{ 
                  backgroundColor: "rgba(255, 255, 255, 0.9)", 
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  border: "none" 
                }}
              />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
          </ResponsiveContainer>
        );
      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={350} className="chart-appear">
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                type="number"
                dataKey="x"
                name={xAxis}
                angle={-45} 
                textAnchor="end" 
                height={70} 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                type="number"
                dataKey="y"
                name={yAxis}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value, name) => [value, name === "x" ? xAxis : yAxis]}
                contentStyle={{ 
                  backgroundColor: "rgba(255, 255, 255, 0.9)", 
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  border: "none" 
                }}
              />
              <Legend />
              <Scatter 
                name={`${xAxis} vs ${yAxis}`} 
                data={chartData} 
                fill={colors[0]}
                animationDuration={1000}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );
      case "radar":
        return (
          <ResponsiveContainer width="100%" height={350} className="chart-appear">
            <RadarChart cx="50%" cy="50%" outerRadius={130} data={chartData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
              {Object.keys(chartData[0] || {}).filter(key => key !== 'subject').map((key, index) => (
                <Radar
                  key={key}
                  name={key}
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.5}
                  animationDuration={1000}
                />
              ))}
              <Legend />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "rgba(255, 255, 255, 0.9)", 
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  border: "none" 
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        );
      case "mixed":
        return (
          <ResponsiveContainer width="100%" height={350} className="chart-appear">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={70} 
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "rgba(255, 255, 255, 0.9)", 
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  border: "none" 
                }}
              />
              <Legend />
              <Bar dataKey="value" barSize={20} fill={colors[0]} />
              <Line type="monotone" dataKey="average" stroke={colors[1]} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  // Render data quality tab content
  const renderQualityReport = () => {
    if (!qualityReport) {
      return (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          No data quality report available
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="text-sm text-gray-500 dark:text-gray-400">Overall Quality Score</div>
            <div className="text-2xl font-semibold mt-1">{qualityReport.overallScore.toFixed(1)}%</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Columns</div>
            <div className="text-2xl font-semibold mt-1">{qualityReport.columnCount}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Rows</div>
            <div className="text-2xl font-semibold mt-1">{qualityReport.rowCount}</div>
          </div>
        </div>

        {qualityReport.suggestions.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <h4 className="font-medium text-sm text-amber-800 dark:text-amber-300 mb-2">Suggestions for Improvement</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-amber-700 dark:text-amber-400">
              {qualityReport.suggestions.map((suggestion, i) => (
                <li key={i}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-3 py-3.5 text-left font-medium text-gray-500 dark:text-gray-400">Column</th>
                <th className="px-3 py-3.5 text-left font-medium text-gray-500 dark:text-gray-400">Type</th>
                <th className="px-3 py-3.5 text-left font-medium text-gray-500 dark:text-gray-400">Completeness</th>
                <th className="px-3 py-3.5 text-left font-medium text-gray-500 dark:text-gray-400">Uniqueness</th>
                <th className="px-3 py-3.5 text-left font-medium text-gray-500 dark:text-gray-400">Issues</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {qualityReport.columns.map((column, i) => (
                <tr key={i} className={column.completeness < 70 ? "bg-red-50 dark:bg-red-900/20" : ""}>
                  <td className="px-3 py-2 font-medium">{column.name}</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-0.5 rounded">
                      {column.dataType}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          column.completeness > 90 ? "bg-green-500" : 
                          column.completeness > 70 ? "bg-yellow-500" : "bg-red-500"
                        }`} 
                        style={{ width: `${column.completeness}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {column.completeness.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {column.uniqueness.toFixed(1)}%
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {column.issues?.map((issue, j) => (
                      <div key={j} className="text-red-600 dark:text-red-400">{issue}</div>
                    ))}
                    {!column.issues?.length && (
                      <span className="text-green-600 dark:text-green-400">No issues</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {title || "Data Visualization"}
        </h3>
        <div className="flex space-x-1">
          <button
            onClick={() => setChartType("bar")}
            className={`p-1.5 rounded-md ${
              chartType === "bar"
                ? "bg-primary/10 text-primary"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            aria-label="Bar Chart"
            title="Bar Chart"
          >
            <BarChart2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setChartType("line")}
            className={`p-1.5 rounded-md ${
              chartType === "line"
                ? "bg-primary/10 text-primary"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            aria-label="Line Chart"
            title="Line Chart"
          >
            <LineIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setChartType("pie")}
            className={`p-1.5 rounded-md ${
              chartType === "pie"
                ? "bg-primary/10 text-primary"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            aria-label="Pie Chart"
            title="Pie Chart"
          >
            <PieIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setChartType("area")}
            className={`p-1.5 rounded-md ${
              chartType === "area"
                ? "bg-primary/10 text-primary"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            aria-label="Area Chart"
            title="Area Chart"
          >
            <Activity className="w-5 h-5" />
          </button>
          <button
            onClick={() => setChartType("scatter")}
            className={`p-1.5 rounded-md ${
              chartType === "scatter"
                ? "bg-primary/10 text-primary"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            aria-label="Scatter Plot"
            title="Scatter Plot"
          >
            <Circle className="w-5 h-5" />
          </button>
          <button
            onClick={() => setChartType("radar")}
            className={`p-1.5 rounded-md ${
              chartType === "radar"
                ? "bg-primary/10 text-primary"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            aria-label="Radar Chart"
            title="Radar Chart"
          >
            <Compass className="w-5 h-5" />
          </button>
          <button
            onClick={() => setChartType("mixed")}
            className={`p-1.5 rounded-md ${
              chartType === "mixed"
                ? "bg-primary/10 text-primary"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            aria-label="Mixed Chart"
            title="Mixed Chart"
          >
            <Layers className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="p-5">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="quality" disabled={!qualityReport}>Data Quality</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart" className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  X-Axis
                </label>
                <select
                  value={xAxis}
                  onChange={(e) => setXAxis(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                >
                  <option value="">Select X-Axis</option>
                  {columns.map((column) => (
                    <option key={column} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Y-Axis (Value)
                </label>
                <select
                  value={yAxis}
                  onChange={(e) => setYAxis(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                >
                  <option value="">Select Y-Axis</option>
                  {numericColumns.map((column) => (
                    <option key={column} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {xAxis && yAxis ? (
              renderChart()
            ) : (
              <div className="h-[350px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                Please select both X and Y axes to visualize data
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="quality">
            {renderQualityReport()}
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Chart Title
              </label>
              <input
                type="text"
                value={options.title || title || ""}
                onChange={(e) => onOptionsChange?.({ ...options, title: e.target.value })}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                placeholder="Enter chart title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color Scheme
              </label>
              <div className="grid grid-cols-5 gap-2">
                {Object.keys(COLOR_SCHEMES).map((scheme) => (
                  <button
                    key={scheme}
                    onClick={() => setColorScheme(scheme)}
                    className={`p-1 rounded-md border ${
                      colorScheme === scheme
                        ? "ring-2 ring-primary ring-offset-2"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    title={scheme}
                  >
                    <div className="flex space-x-1">
                      {COLOR_SCHEMES[scheme as keyof typeof COLOR_SCHEMES].slice(0, 5).map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-12 rounded-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="text-xs mt-1 text-center capitalize">{scheme}</div>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DataVisualizer;
