const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ✅ Enable CORS (allow frontend on 5173)
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// ✅ Body parsers
app.use(express.json({ limit: "10mb" }));  // adjust as needed
app.use(express.urlencoded({ limit: "10mb", extended: true }));


// ✅ DB Connection
main().then(() => {
  console.log("connected to mongodb");
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/simhastha');
}

// ✅ Import routes
const feedbackRoutes = require("./routes/feedbackRoute");
const volunteerRoutes = require("./routes/volunteer");
const cleanerRoutes = require("./routes/worker");
const taskRoutes = require("./routes/taskroute");
const authRoutes = require("./routes/auth");
const ledRoutes = require("./routes/led");

// ✅ Use routes
          // Registration & Login

app.use("/api/feedback", feedbackRoutes);     // Pilgrim submits complaint
app.use("/api/volunteer", volunteerRoutes);   // Volunteer actions
app.use("/api/cleaner", cleanerRoutes);  
app.use("/api/tasks", taskRoutes);
app.use("/api/auth", authRoutes); 
app.use("/api/led", ledRoutes);               // LED display updates

// ✅ Health check
app.get("/", (req, res) => {
  res.send("🚀 Sanitrack Backend Running");
});

// ✅ Start server
app.listen(3000, () => {
  console.log("app is listening");
});
