import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ledBackground from "../assets/ledblack.png"; // ✅ Add your LED background image here

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
        const res = await fetch(`http://localhost:3000/api/led/${clusterId}`);
        const data = await res.json();

        if (data.success && data.cluster) {
          setStatus(data.cluster.status);
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
    return "green"; 
  };

  const getStatusStyle = () => {
    switch (status) {
      case "clean":
        return "text-green-400 drop-shadow-[0_0_10px_#22c55e]";
      case "dirty":
        return "text-red-400 drop-shadow-[0_0_10px_#ef4444]";
      case "in_progress":
        return "text-yellow-400 drop-shadow-[0_0_10px_#eab308]";
      default:
        return "text-green-400 drop-shadow-[0_0_10px_#22c55e]";
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${ledBackground})` }}
    >
      <div
        className="w-40 h-40 rounded-full flex items-center justify-center 
                   text-2xl font-bold text-black shadow-[0_0_20px_rgba(0,0,0,0.8)]"
        style={{ backgroundColor: getColor() }}
      >
        {loading ? "..." : clusterId}
      </div>

      <p className={`mt-6 text-2xl font-bold transition-all ${getStatusStyle()}`}>
        {loading ? "Loading..." : status?.toUpperCase()}
      </p>
    </div>
  );
}
