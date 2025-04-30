
import React, { useState, useEffect } from "react";
import { Calendar, Clock, Bell, Trash, CalendarClock, Send } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ScheduledReport {
  id: string;
  name: string;
  frequency: "daily" | "weekly" | "monthly";
  query: string;
  nextRun: Date;
  email?: string;
  enabled: boolean;
  lastSent?: Date;
}

interface ScheduledReportsProps {
  excelFileName?: string;
}

const ScheduledReports: React.FC<ScheduledReportsProps> = ({ excelFileName }) => {
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newReport, setNewReport] = useState<Partial<ScheduledReport>>({
    name: "",
    frequency: "weekly",
    query: "",
    email: "",
    enabled: true
  });

  // Load saved reports from localStorage on component mount
  useEffect(() => {
    const savedReports = localStorage.getItem("excelAssistantScheduledReports");
    if (savedReports) {
      try {
        const parsedData = JSON.parse(savedReports);
        // Convert string dates back to Date objects
        const reportsData = parsedData.map((report: any) => ({
          ...report,
          nextRun: new Date(report.nextRun),
          lastSent: report.lastSent ? new Date(report.lastSent) : undefined
        }));
        setReports(reportsData);
      } catch (error) {
        console.error("Error parsing saved reports:", error);
      }
    }
  }, []);

  // Save reports to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("excelAssistantScheduledReports", JSON.stringify(reports));
  }, [reports]);

  const calculateNextRunDate = (frequency: "daily" | "weekly" | "monthly"): Date => {
    const nextRun = new Date();
    
    if (frequency === "daily") {
      // Set to next day, same time
      nextRun.setDate(nextRun.getDate() + 1);
    } else if (frequency === "weekly") {
      // Set to next week, same day and time
      nextRun.setDate(nextRun.getDate() + 7);
    } else if (frequency === "monthly") {
      // Set to next month, same day and time
      nextRun.setMonth(nextRun.getMonth() + 1);
    }
    
    return nextRun;
  };

  // Function to send report via mailto link
  const sendReportNow = (report: ScheduledReport) => {
    if (!report.email) {
      toast.error("No email address provided for this report");
      return;
    }

    // Prepare email content
    const subject = `Excel AI Report: ${report.name}`;
    const body = `
Report Name: ${report.name}
Generated on: ${new Date().toLocaleString()}
Query: ${report.query}

This is an automated report from Excel AI Assistant.
`;
    
    try {
      // Create a mailto link
      const mailtoLink = `mailto:${encodeURIComponent(report.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Open the mailto link
      window.location.href = mailtoLink;
      
      // Update the report with the last sent date
      setReports(reports.map(r => 
        r.id === report.id 
          ? { ...r, lastSent: new Date() } 
          : r
      ));
      
      toast.success(`Email client opened to send report to ${report.email}`);
    } catch (error) {
      toast.error("Failed to open email client: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  // Simulate checking if any reports are due
  useEffect(() => {
    const checkReportsDue = () => {
      const now = new Date();
      const updatedReports = reports.map(report => {
        if (report.enabled && new Date(report.nextRun) <= now) {
          // For reports that are due, we'll show a notification
          // instead of automatically sending since we're using mailto
          toast.info(`Report "${report.name}" is due. Click "Send now" to send it.`);
          
          // Calculate next run date based on frequency
          let nextRun = new Date();
          if (report.frequency === "daily") {
            nextRun.setDate(nextRun.getDate() + 1);
          } else if (report.frequency === "weekly") {
            nextRun.setDate(nextRun.getDate() + 7);
          } else if (report.frequency === "monthly") {
            nextRun.setMonth(nextRun.getMonth() + 1);
          }
          
          return { ...report, nextRun };
        }
        return report;
      });
      
      setReports(updatedReports);
    };
    
    // Check for due reports every minute
    const interval = setInterval(checkReportsDue, 60000);
    return () => clearInterval(interval);
  }, [reports]);

  const handleCreateReport = () => {
    if (!newReport.name || !newReport.query) {
      toast.error("Please provide both a name and query for your report");
      return;
    }

    const frequency = newReport.frequency || "weekly";
    const report: ScheduledReport = {
      id: Date.now().toString(),
      name: newReport.name,
      frequency: frequency,
      query: newReport.query,
      nextRun: calculateNextRunDate(frequency),
      email: newReport.email,
      enabled: true
    };

    setReports([...reports, report]);
    setNewReport({
      name: "",
      frequency: "weekly",
      query: "",
      email: "",
      enabled: true
    });
    setIsCreating(false);
    
    toast.success("Scheduled report created");
  };

  const toggleReportStatus = (id: string) => {
    setReports(reports.map(report => 
      report.id === id ? { ...report, enabled: !report.enabled } : report
    ));
  };

  const deleteReport = (id: string) => {
    setReports(reports.filter(report => report.id !== id));
    toast.success("Report deleted");
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "daily": return "Daily";
      case "weekly": return "Weekly";
      case "monthly": return "Monthly";
      default: return frequency;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Scheduled Reports
          </h3>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="text-xs flex items-center gap-1 text-primary hover:underline"
          disabled={!excelFileName}
        >
          {isCreating ? "Cancel" : "Schedule a New Report"}
        </button>
      </div>

      {!excelFileName && (
        <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md border border-amber-200 dark:border-amber-800">
          Upload an Excel file to create scheduled reports
        </div>
      )}

      {isCreating && excelFileName && (
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md space-y-3 bg-gray-50 dark:bg-gray-800/50">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Report Name
            </label>
            <input
              type="text"
              value={newReport.name || ""}
              onChange={(e) => setNewReport({...newReport, name: e.target.value})}
              placeholder="Monthly Sales Summary"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Frequency
            </label>
            <select
              value={newReport.frequency || "weekly"}
              onChange={(e) => setNewReport({...newReport, frequency: e.target.value as "daily" | "weekly" | "monthly"})}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Query/Analysis
            </label>
            <textarea
              value={newReport.query || ""}
              onChange={(e) => setNewReport({...newReport, query: e.target.value})}
              placeholder="Enter the query or analysis to run (e.g., 'Summarize sales data by region')"
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email (Required)
            </label>
            <input
              type="email"
              value={newReport.email || ""}
              onChange={(e) => setNewReport({...newReport, email: e.target.value})}
              placeholder="email@example.com"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          
          <button
            onClick={handleCreateReport}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm rounded-md transition-colors"
          >
            Schedule Report
          </button>
        </div>
      )}

      {reports.length === 0 && !isCreating ? (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
          <p>No scheduled reports</p>
          <p className="mt-1">Set up automated reports to run on a schedule</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {reports.map((report) => (
            <div
              key={report.id}
              className={`p-3 border rounded-md transition-colors ${
                report.enabled 
                  ? "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50" 
                  : "border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className={`font-medium text-sm ${report.enabled ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}`}>
                  {report.name}
                </h4>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleReportStatus(report.id)}
                    className={`p-1 ${report.enabled ? "text-green-500" : "text-gray-400 hover:text-green-500"}`}
                    title={report.enabled ? "Disable report" : "Enable report"}
                  >
                    <Bell className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteReport(report.id)}
                    className="p-1 text-gray-500 hover:text-red-500"
                    title="Delete report"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{getFrequencyLabel(report.frequency)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Next: {report.nextRun.toLocaleDateString()}</span>
                </div>
              </div>
              
              <p className="text-sm line-clamp-2">
                {report.query}
              </p>
              
              {report.email && (
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Sends to: {report.email}
                  </p>
                  <button
                    onClick={() => sendReportNow(report)}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                    title="Send report now"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send now</span>
                  </button>
                </div>
              )}
              
              {report.lastSent && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Last sent: {report.lastSent.toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 mt-4">
        <AlertTitle className="text-sm font-medium">About Email Reports</AlertTitle>
        <AlertDescription className="text-xs mt-1">
          Reports are sent using your default email client. When you click "Send now", your email client will open with the report details pre-filled. You'll need to manually send the email.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ScheduledReports;
