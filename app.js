const express = require("express");
const app = express();
const mongoose = require("mongoose")



main().then(()=>{
    console.log("connected to mongodb")
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

// Import routes
const feedbackRoutes = require("./routes/feedbackRoute");
const volunteerRoutes = require("./routes/volunteer");
const workerRoutes = require("./routes/worker");



app.use(express.json()); // built-in JSON parser
app.use(express.urlencoded({ extended: true })); // for form-data


app.use("/api/feedback", feedbackRoutes);     // Pilgrim submits complaint
app.use("/api/volunteer", volunteerRoutes);   // Volunteer actions
app.use("/api/worker", workerRoutes);         // Worker actions


// Health check route
app.get("/", (req, res) => {
  res.send("🚀 Sanitrack Backend Running");
});





app.listen(3000,()=>{
    console.log("app is listening");
})