
import React, { useState } from "react";
import { LayoutGrid, Gauge, ArrowRight, BarChart2, Table } from "lucide-react";
import DataVisualizer from "./DataVisualizer";

interface DashboardProps {
  data: any[];
  title?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ data, title }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "charts" | "tables">("overview");

  if (!data || data.length === 0) {
    return (
      <div className="text-center p-6 text-gray-500 dark:text-gray-400">
        No data available for dashboard
      </div>
    );
  }

  // Calculate metrics for the dashboard
  const calculateMetrics = () => {
    const numericColumns = Object.keys(data[0]).filter(key => 
      !isNaN(Number(data[0][key]))
    );
    
    const metrics = numericColumns.slice(0, 4).map(column => {
      const values = data.map(row => Number(row[column])).filter(val => !isNaN(val));
      
      if (values.length === 0) return null;
      
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);
      
      return {
        name: column,
        sum,
        avg,
        max,
        min,
        count: values.length
      };
    }).filter(Boolean);
    
    return metrics;
  };

  const metrics = calculateMetrics();

  // Group data for overview
  const getDataDistribution = () => {
    // Find a categorical column for grouping
    const columns = Object.keys(data[0]);
    const categoricalColumn = columns.find(col => {
      const uniqueValues = new Set(data.map(row => String(row[col])));
      return uniqueValues.size > 1 && uniqueValues.size <= 10;
    });
    
    if (!categoricalColumn) return null;
    
    const distribution: Record<string, number> = {};
    
    data.forEach(row => {
      const value = String(row[categoricalColumn]);
      distribution[value] = (distribution[value] || 0) + 1;
    });
    
    return {
      column: categoricalColumn,
      data: Object.entries(distribution).map(([name, value]) => ({ name, value }))
    };
  };

  const distribution = getDataDistribution();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {title || "Interactive Dashboard"}
        </h3>
        
        <div className="mt-3 flex space-x-1 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-sm font-medium -mb-px ${
              activeTab === "overview"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <span className="flex items-center">
              <LayoutGrid className="w-4 h-4 mr-1.5" />
              Overview
            </span>
          </button>
          <button
            onClick={() => setActiveTab("charts")}
            className={`px-4 py-2 text-sm font-medium -mb-px ${
              activeTab === "charts"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <span className="flex items-center">
              <BarChart2 className="w-4 h-4 mr-1.5" />
              Charts
            </span>
          </button>
          <button
            onClick={() => setActiveTab("tables")}
            className={`px-4 py-2 text-sm font-medium -mb-px ${
              activeTab === "tables"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <span className="flex items-center">
              <Table className="w-4 h-4 mr-1.5" />
              Tables
            </span>
          </button>
        </div>
      </div>
      
      <div className="p-5">
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-in">
            {/* Key metrics */}
            {metrics.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  Key Metrics
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {metrics.map((metric, index) => (
                    <div 
                      key={index}
                      className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {metric.name}
                          </p>
                          <p className="text-2xl font-semibold mt-1 text-gray-900 dark:text-gray-100">
                            {metric.sum.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-2 rounded-full bg-primary/10">
                          <Gauge className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Avg</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {metric.avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Max</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {metric.max.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Distribution chart */}
            {distribution && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Distribution by {distribution.column}
                  </h4>
                  <button
                    onClick={() => setActiveTab("charts")}
                    className="text-xs flex items-center text-primary hover:text-primary/80"
                  >
                    More charts <ArrowRight className="w-3 h-3 ml-1" />
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <DataVisualizer 
                    data={distribution.data} 
                    title={`${distribution.column} Distribution`} 
                  />
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === "charts" && (
          <div className="animate-fade-in">
            <DataVisualizer data={data} title="Interactive Chart" />
          </div>
        )}
        
        {activeTab === "tables" && (
          <div className="overflow-auto animate-fade-in">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {Object.keys(data[0] || {}).map((column) => (
                        <th
                          key={column}
                          scope="col"
                          className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {data.map((row, rowIndex) => (
                      <tr 
                        key={rowIndex}
                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        {Object.keys(data[0] || {}).map((column, colIndex) => (
                          <td
                            key={`${rowIndex}-${colIndex}`}
                            className="px-4 py-3 text-sm text-gray-900 dark:text-gray-200 max-w-[12rem] truncate"
                          >
                            {String(row[column] !== undefined ? row[column] : "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
