import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../api"; // ✅ import your axios instance

export default function LedDashboard() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const clusterId = queryParams.get("clusterId");

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clusterId) return;

    const fetchStatus = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/led/${clusterId}`);
        if (res.data.success && res.data.cluster) {
          setStatus(res.data.cluster.status);
        }
      } catch (err) {
        console.error("Error fetching LED status:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();

    // Auto-refresh every 5s
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [clusterId]);

  const getColor = () => {
    if (status === "clean") return "green";
    if (status === "dirty") return "red";
    if (status === "in_progress") return "yellow";
    return "gray";
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div
        className="w-40 h-40 rounded-full flex items-center justify-center text-2xl font-bold text-black shadow-lg"
        style={{ backgroundColor: getColor() }}
      >
        {loading ? "..." : clusterId}
      </div>
      <p className="mt-4 text-lg font-semibold">
        Status: {loading ? "Loading..." : status}
      </p>
    </div>
  );
}
