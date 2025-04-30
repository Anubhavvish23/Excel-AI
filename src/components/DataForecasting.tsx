
import React, { useState, useEffect } from "react";
import { BarChart, TrendingUp, Info, Loader2, ArrowRight } from "lucide-react";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface DataForecastingProps {
  data: any[] | null;
  excelData: any | null;
}

// Simple linear regression function
const linearRegression = (data: {x: number, y: number}[]) => {
  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += data[i].x;
    sumY += data[i].y;
    sumXY += data[i].x * data[i].y;
    sumXX += data[i].x * data[i].x;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
};

const DataForecasting: React.FC<DataForecastingProps> = ({ data, excelData }) => {
  const [forecastConfig, setForecastConfig] = useState({
    xAxis: "",
    yAxis: "",
    periods: 3,
  });
  
  const [availableColumns, setAvailableColumns] = useState<{numeric: string[], date: string[]}>({
    numeric: [],
    date: []
  });
  
  const [forecastData, setForecastData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Detect available columns for forecasting
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    const numericColumns: string[] = [];
    const dateColumns: string[] = [];
    
    // Check the first item to determine column types
    const firstRow = data[0];
    Object.entries(firstRow).forEach(([key, value]) => {
      if (typeof value === "number") {
        numericColumns.push(key);
      } else if (
        // Simple date detection logic
        typeof value === "string" && 
        (value.includes("-") || value.includes("/")) &&
        !isNaN(Date.parse(value))
      ) {
        dateColumns.push(key);
      }
    });
    
    setAvailableColumns({
      numeric: numericColumns,
      date: dateColumns
    });
    
    // Auto-select first columns if available
    if (dateColumns.length > 0 && numericColumns.length > 0) {
      setForecastConfig({
        ...forecastConfig,
        xAxis: dateColumns[0],
        yAxis: numericColumns[0]
      });
    }
  }, [data]);
  
  const generateForecast = () => {
    if (!data || data.length === 0 || !forecastConfig.xAxis || !forecastConfig.yAxis) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Prepare data for forecasting
      const forecastingData = data.map((item, index) => {
        let xValue = item[forecastConfig.xAxis];
        
        // Convert date string to timestamp
        if (typeof xValue === "string" && (xValue.includes("-") || xValue.includes("/"))) {
          xValue = new Date(xValue).getTime();
        } 
        // If not a date, use the index for x value
        else if (typeof xValue !== "number") {
          xValue = index;
        }
        
        return {
          x: xValue,
          y: Number(item[forecastConfig.yAxis]) || 0,
          [forecastConfig.xAxis]: item[forecastConfig.xAxis],
          [forecastConfig.yAxis]: Number(item[forecastConfig.yAxis]) || 0
        };
      }).sort((a, b) => a.x - b.x); // Sort by x value to ensure proper sequence
      
      // Apply linear regression to generate forecast
      const { slope, intercept } = linearRegression(forecastingData);
      
      // Generate forecast for future periods
      const lastPoint = forecastingData[forecastingData.length - 1];
      const lastDate = new Date(lastPoint[forecastConfig.xAxis]);
      const isDateBased = availableColumns.date.includes(forecastConfig.xAxis);
      
      const forecast = [...forecastingData];
      
      for (let i = 1; i <= forecastConfig.periods; i++) {
        // Fix the arithmetic operation error by ensuring we're using numbers
        const secondLastPoint = forecastingData[forecastingData.length - 2];
        const step = (lastPoint.x - secondLastPoint.x);
        const newX = lastPoint.x + (i * step);
        const newY = slope * newX + intercept;
        
        let newDate;
        if (isDateBased) {
          newDate = new Date(lastDate);
          // If month-based data, add months
          if (
            forecastingData.length > 1 &&
            (new Date(forecastingData[1].x).getTime() - new Date(forecastingData[0].x).getTime()) > 25 * 24 * 60 * 60 * 1000
          ) {
            newDate.setMonth(newDate.getMonth() + i);
          } else {
            // Otherwise assume daily data
            newDate.setDate(newDate.getDate() + i);
          }
        }
        
        forecast.push({
          x: newX,
          y: newY,
          [forecastConfig.xAxis]: isDateBased ? newDate.toISOString().split("T")[0] : newX,
          [forecastConfig.yAxis]: parseFloat(newY.toFixed(2)),
          forecast: true
        });
      }
      
      setForecastData(forecast);
    } catch (error) {
      console.error("Forecasting error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const NoDataMessage = () => (
    <div className="flex flex-col items-center justify-center h-64 text-center p-6 space-y-3">
      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
        <TrendingUp className="w-6 h-6 text-blue-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        AI Data Forecasting
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
        Upload an Excel file with numerical data to use the AI forecasting feature.
      </p>
    </div>
  );
  
  if (!data || data.length === 0) {
    return <NoDataMessage />;
  }
  
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            AI Data Forecasting
          </h2>
        </div>
        
        <div className="flex items-center text-sm">
          <Info className="w-4 h-4 text-blue-500 mr-1" />
          <span className="text-gray-500 dark:text-gray-400">Using time series prediction</span>
        </div>
      </div>
      
      {availableColumns.numeric.length === 0 ? (
        <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md border border-amber-200 dark:border-amber-800">
          No numeric columns found in your data. Forecasting requires numerical data.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time/Sequence Column
              </label>
              <select
                value={forecastConfig.xAxis}
                onChange={(e) => setForecastConfig({...forecastConfig, xAxis: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select a column</option>
                {availableColumns.date.map(column => (
                  <option key={column} value={column}>{column} (Date)</option>
                ))}
                {availableColumns.numeric.map(column => (
                  <option key={column} value={column}>{column} (Number)</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Value to Forecast
              </label>
              <select
                value={forecastConfig.yAxis}
                onChange={(e) => setForecastConfig({...forecastConfig, yAxis: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select a column</option>
                {availableColumns.numeric.map(column => (
                  <option key={column} value={column}>{column}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Forecast Periods
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={forecastConfig.periods}
                onChange={(e) => setForecastConfig({...forecastConfig, periods: parseInt(e.target.value) || 3})}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={generateForecast}
              disabled={!forecastConfig.xAxis || !forecastConfig.yAxis || isLoading}
              className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  <span>Generate Forecast</span>
                </>
              )}
            </button>
          </div>
          
          {forecastData && (
            <div className="mt-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/30 dark:border-blue-800 mb-3">
                <h3 className="font-medium mb-1 text-blue-700 dark:text-blue-300">Forecast Results</h3>
                <div className="text-sm text-blue-600 dark:text-blue-300">
                  <p>Showing forecast for <strong>{forecastConfig.yAxis}</strong> based on <strong>{forecastConfig.xAxis}</strong> for <strong>{forecastConfig.periods}</strong> periods ahead.</p>
                </div>
              </div>
              
              <div className="h-80 bg-white dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={forecastData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey={forecastConfig.xAxis}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        if (typeof value === 'string' && (value.includes('-') || value.includes('/'))) {
                          // Format dates to more compact form
                          const date = new Date(value);
                          return `${date.getMonth()+1}/${date.getDate()}`;
                        }
                        return value;
                      }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value, name) => [value, name === forecastConfig.yAxis ? forecastConfig.yAxis : "Forecast"]}
                      labelFormatter={(label) => {
                        if (typeof label === 'string' && (label.includes('-') || label.includes('/'))) {
                          return new Date(label).toLocaleDateString();
                        }
                        return label;
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey={forecastConfig.yAxis} 
                      stroke="#4f46e5" 
                      activeDot={{ r: 8 }} 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey={(data) => data.forecast ? data[forecastConfig.yAxis] : null} 
                      stroke="#ef4444" 
                      strokeDasharray="5 5"
                      name="Forecast"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {forecastData
                  .filter(item => item.forecast)
                  .map((item, index) => (
                    <div key={index} className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-center">
                      <div className="text-sm font-medium">
                        {item[forecastConfig.xAxis]}
                      </div>
                      <div className="text-lg font-semibold text-primary">
                        {item[forecastConfig.yAxis]}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Predicted
                      </div>
                    </div>
                  ))
                }
              </div>
              
              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                <p>Note: This forecast uses basic linear regression. For more accurate forecasts with seasonal adjustments, please use dedicated statistical software.</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DataForecasting;
