import React, { useState, useEffect } from "react";
import { logger } from "../utils/logger";

interface LogEntry {
  level: "info" | "warn" | "error" | "debug";
  message: string;
  timestamp: string;
  data?: any;
}

export const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "info" | "warn" | "error" | "debug"
  >("all");

  useEffect(() => {
    // Attach console interceptors so console.* messages go to the logger
    logger.attachConsoleInterceptors?.();

    // Subscribe for real-time updates
    const unsubscribe = logger.subscribe((latest) => {
      setLogs(latest);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const filteredLogs = logs.filter((log) =>
    filter === "all" ? true : log.level === filter
  );

  const formatData = (data: any) => {
    if (!data) return "";
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <div
      className={`hidden fixed top-4 right-4 bg-white rounded-lg shadow-lg transition-all duration-300 z-[2000] ${
        isExpanded ? "w-96 h-96" : "w-40 h-10"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between p-2 border-b ${
          isExpanded ? "bg-blue-500" : "bg-blue-600"
        } rounded-t-lg`}
      >
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-white mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path
              fillRule="evenodd"
              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
              clipRule="evenodd"
            />
          </svg>
          <h3 className="font-semibold text-white">Activity Log</h3>
        </div>
        <div className="flex items-center space-x-2">
          {isExpanded && (
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border border-blue-300 rounded px-2 py-1 bg-white text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Logs</option>
              <option value="info">Info Only</option>
              <option value="warn">Warnings</option>
              <option value="error">Errors</option>
              <option value="debug">Debug</option>
            </select>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white"
          >
            {isExpanded ? "−" : "+"}
          </button>
        </div>
      </div>

      {/* Log List */}
      {isExpanded && (
        <div className="overflow-auto h-[calc(100%-2.5rem)] p-2">
          <div className="space-y-2">
            {filteredLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No logs to display
              </p>
            ) : (
              filteredLogs
                .map((log, index) => (
                  <div
                    key={index}
                    className="text-sm border rounded p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`font-medium px-2 py-0.5 rounded-full text-xs ${
                          log.level === "info"
                            ? "bg-blue-100 text-blue-800"
                            : log.level === "warn"
                            ? "bg-yellow-100 text-yellow-800"
                            : log.level === "error"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-gray-500 text-xs font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-700 font-medium">{log.message}</p>
                    {log.data && (
                      <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto border border-gray-200 font-mono">
                        {formatData(log.data)}
                      </pre>
                    )}
                  </div>
                ))
                .reverse()
            )}
          </div>
        </div>
      )}
    </div>
  );
};
