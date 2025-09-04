import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import mandirImg from "../assets/mandir.jpg";
import axios from "axios";
import api from "../api"; // ✅ centralized axios instance

export default function VolunteerDashboard() {
  const [searchParams] = useSearchParams();
  const [clusterId, setClusterId] = useState("unknown");
  const [reports, setReports] = useState([]);
  const [cleaners, setCleaners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Read clusterId
  useEffect(() => {
    const id = searchParams.get("clusterId");
    if (id) setClusterId(id);
  }, [searchParams]);

  // Fetch reports with taskId
  const fetchReports = useCallback(async () => {
    if (clusterId === "unknown") return;
    try {
      setLoading(true);
const res = await api.get(`/feedback/${clusterId}`);
      if (res.data.success) {
        setReports(
          res.data.complaints
            .filter(c => c.status.toLowerCase() !== "resolved")
            .map(c => ({
              _id: c._id,               // complaintId
              taskId: c.taskId || null, // 👈 make sure backend sends taskId
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

  useEffect(() => { fetchReports(); }, [fetchReports]);

  // Fetch cleaners
  useEffect(() => {
    if (clusterId === "unknown") return;
    const fetchCleaners = async () => {
      try {
const res = await api.get(`/cleaner?clusterId=${clusterId}`);
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

  const assignCleaner = async (reportId, cleanerId) => {
    if (!cleanerId) return;
    try {
      const cleaner = cleaners.find((c) => c._id === cleanerId);
      if (!cleaner) return showMessage("⚠️ Cleaner not found.");

      const report = reports.find((r) => r._id === reportId);
      if (!report) return showMessage("⚠️ Report not found.");

      const res = await api.post("/tasks", { complaintId: reportId, clusterId, workerId: cleanerId, description: report.reportType });


      if (res.data.success) {
        showMessage(`🧹 ${cleaner.name} assigned to report ${reportId}.`);
        fetchReports();
      }
    } catch (err) {
      console.error("Error assigning cleaner:", err);
      showMessage("❌ Failed to assign cleaner.");
    }
  };

  // ✅ Volunteer approves cleaner’s work
const verifyCleanerWork = async (reportId, taskId) => {
  try {
    const taskRes = await api.post(`/tasks/complete/${taskId}`);
    if (taskRes.data.success) {
      await api.put(`/feedback/${reportId}`, { status: "resolved" });
      showMessage(`✨ Work approved for report ${reportId}. LED turned green ✅`);
      fetchReports();
    }
  } catch (err) {
    console.error("Error approving cleaning:", err);
    showMessage("❌ Failed to approve cleaning.");
  }
};

const verifyReport = async (reportId) => {
  try {
    await api.put(`/feedback/${reportId}`, { status: "verified" });
    showMessage(`📌 Report ${reportId} verified successfully.`);
    fetchReports();
  } catch (err) {
    console.error("Error verifying report:", err);
    showMessage("❌ Failed to verify report.");
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
    <div className="min-h-screen w-full flex flex-col items-center relative p-4 sm:p-6 pt-16 font-sans"
      style={{ backgroundImage: `url(${mandirImg})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="relative z-10 w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-white text-center mb-4">Volunteer Dashboard</h2>

        <AnimatePresence>
          {message && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="fixed top-5 right-5 bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg z-50">
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <p className="text-center text-white">Loading data...</p>
        ) : reports.length === 0 ? (
          <p className="text-center text-white">No reports for Cluster {clusterId}.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {reports.map((report) => {
              const status = getReportStatus(report);
              return (
                <motion.div key={report._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white/90 rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold">Toilet: {report.toiletId}</h3>
                  <p className="text-sm text-gray-600"><b>Issue:</b> {report.reportType}</p>
                  <p className="text-sm text-gray-600 mb-4">
                    <b>Status:</b>{" "}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {status.replace(/_/g, " ")}
                    </span>
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {status === "pending" && !report.verified && (
                      <button onClick={() => verifyReport(report._id)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">
                        Verify Report
                      </button>
                    )}

                    {status === "verified" && !report.assignedCleaner && (
                      <select onChange={(e) => assignCleaner(report._id, e.target.value)}
                        defaultValue="" className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm">
                        <option value="" disabled>Select Cleaner</option>
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
                        onClick={() => verifyCleanerWork(report._id, report.taskId)}
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
