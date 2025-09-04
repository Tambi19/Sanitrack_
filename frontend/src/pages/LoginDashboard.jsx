import { useState } from "react";
import { useNavigate } from "react-router-dom";
import mandirImg from "../assets/mandir.jpg";
import api from "../api"; // ✅ use your axios instance

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      if (res.data.success) {
        const user = res.data.user;
        console.log("Login success:", user);
        localStorage.setItem("user", JSON.stringify(user));

        // Navigate to dashboard based on role
        if (user.role === "volunteer") {
          navigate(`/volunteer?clusterId=${user.clusterId}`);
        } else if (user.role === "cleaner") {
          navigate(`/cleaner?clusterId=${user.clusterId}&userId=${user._id}`);
        }
      }
    } catch (err) {
      console.error("Login failed:", err.response?.data || err);
      alert("Login failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative"
      style={{
        backgroundImage: `url(${mandirImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-white/60"></div>
      <div className="relative z-10 bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
