import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import mandirImg from "../assets/mandir.jpg";
import axios from "axios";

export default function VolunteerDashboard() {
  const [searchParams] = useSearchParams();
  const [clusterId, setClusterId] = useState("unknown");
  const [reports, setReports] = useState([]);
  const [cleaners, setCleaners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Read clusterId from URL
  useEffect(() => {
    const id = searchParams.get("clusterId");
    if (id) setClusterId(id);
  }, [searchParams]);

  // Fetch reports with tasks
  const fetchReports = useCallback(async () => {
    if (clusterId === "unknown") return;
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:3000/api/feedback/${clusterId}`);
      if (res.data.success) {
        // Filter out reports that are already resolved
        setReports(
          res.data.complaints
            .filter(c => c.status.toLowerCase() !== "resolved") 
            .map(c => ({
              _id: c._id,
              toiletId: c.toiletNo,
              reportType: c.feedback,
              status: c.status.toLowerCase(),
              verified: c.status.toLowerCase() !== "pending",
              assignedCleaner: c.assignedCleaner || "",
              taskStatus: c.taskStatus || null,
            }))
        );
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      showMessage("❌ Failed to fetch reports.");
    } finally {
      setLoading(false);
    }
  }, [clusterId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Fetch cleaners
  useEffect(() => {
    if (clusterId === "unknown") return;
    const fetchCleaners = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/cleaner?clusterId=${clusterId}`);
        if (res.data.success) setCleaners(res.data.cleaners);
      } catch (err) {
        console.error("Error fetching cleaners:", err);
        showMessage("❌ Failed to fetch cleaners.");
      }
    };
    fetchCleaners();
  }, [clusterId]);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const getReportStatus = (report) => report.taskStatus || report.status.toLowerCase();

  const verifyReport = async (id) => {
    try {
      const res = await axios.put(`http://localhost:3000/api/feedback/${id}`, { status: "Verified" });
      if (res.data.success) {
        showMessage(`✅ Report ${id} verified.`);
        fetchReports();
      }
    } catch (err) {
      console.error("Error verifying report:", err);
      showMessage("❌ Failed to verify report.");
    }
  };

  const assignCleaner = async (reportId, cleanerId) => {
    if (!cleanerId) return;
    try {
      const cleaner = cleaners.find((c) => c._id === cleanerId);
      if (!cleaner) return showMessage("⚠️ Selected cleaner not found.");

      const report = reports.find((r) => r._id === reportId);
      if (!report) return showMessage("⚠️ Report not found.");

      const res = await axios.post("http://localhost:3000/api/tasks", {
        complaintId: reportId,
        clusterId,
        workerId: cleanerId,
        description: report.reportType,
      });

      if (res.data.success) {
        showMessage(`🧹 ${cleaner.name} assigned to report ${reportId}.`);
        fetchReports();
      }
    } catch (err) {
      console.error("Error assigning cleaner:", err);
      showMessage("❌ Failed to assign cleaner.");
    }
  };

  const verifyCleanerWork = async (id) => {
    try {
      const res = await axios.put(`http://localhost:3000/api/feedback/${id}`, { status: "resolved" });
      if (res.data.success) {
        showMessage(`✨ Work approved for report ${id}.`);
        fetchReports();
      }
    } catch (err) {
      console.error("Error approving cleaning:", err);
      showMessage("❌ Failed to approve cleaning.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "verified":
      case "assigned": return "bg-blue-100 text-blue-700";
      case "cleaning_done": return "bg-indigo-100 text-indigo-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center relative p-4 sm:p-6 pt-16 font-sans"
      style={{ backgroundImage: `url(${mandirImg})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-black/30"></div>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => showMessage("👋 Logged out successfully!")}
        className="absolute top-4 right-4 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full 
                   bg-gradient-to-r from-red-500 via-pink-500 to-red-600 
                   text-white text-sm sm:text-base font-semibold shadow-md hover:shadow-lg 
                   hover:from-red-600 hover:to-pink-700 transition-all duration-300 z-20"
      >
        🚪 Logout
      </motion.button>

      <div className="relative z-10 w-full max-w-4xl">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-4 drop-shadow-lg tracking-wide">
          Volunteer Dashboard
        </h2>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-5 right-5 bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg z-50"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <p className="text-center text-white">Loading data...</p>
        ) : reports.length === 0 ? (
          <p className="text-center text-white">No reports found for Cluster {clusterId}.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {reports.map((report) => {
              const status = getReportStatus(report);
              return (
                <motion.div
                  key={report._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/90 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition backdrop-blur-sm"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Toilet: {report.toiletId}</h3>
                  <p className="text-sm text-gray-600 mb-1"><b>Issue:</b> {report.reportType}</p>
                  <p className="text-sm text-gray-600 mb-4">
                    <b>Status:</b>{" "}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {status.replace(/_/g, " ")}
                    </span>
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {status === "pending" && !report.verified && (
                      <button
                        onClick={() => verifyReport(report._id)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow transition-all duration-200"
                      >
                        Verify Report
                      </button>
                    )}

                    {status === "verified" && !report.assignedCleaner && (
                      <select
                        onChange={(e) => assignCleaner(report._id, e.target.value)}
                        defaultValue=""
                        className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer transition"
                      >
                        <option value="" disabled>
                          {cleaners.length === 0 ? "No cleaners registered" : "Select Cleaner"}
                        </option>
                        {cleaners.map((c) => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    )}

                    {status === "assigned" && report.assignedCleaner && (
                      <p>🧹 Assigned to: {report.assignedCleaner}</p>
                    )}

                    {status === "cleaning_done" && (
                      <button
                        onClick={() => verifyCleanerWork(report._id)}
                        className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium shadow transition-all duration-200"
                      >
                        Approve Cleaning
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
