const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const connectDB = require("./db");
const LoanRecord = require("./models/LoanRecord");
const User = require("./models/User");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "https://incomparable-salmiakki-c6a260.netlify.app/"], // update Netlify URL after deployment
  methods: ["GET", "POST"],
  credentials: true,
}));
app.use(bodyParser.json());

// 🧍 User Signup
app.post("/signup", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email)
      return res.status(400).json({ error: "All fields are required" });

    let user = await User.findOne({ email });
    if (user) return res.json({ message: "User already exists", user });

    user = new User({ name, email });
    await user.save();

    res.json({ message: "Signup successful", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// 🔐 User Login
app.post("/login", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ error: "User not found. Please signup." });

    res.json({ message: "Login successful", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// 🧮 Calculate & Save Loan Record
app.post("/calculate", async (req, res) => {
  try {
    const { amount, rate, years, userId } = req.body;

    if (!amount || !rate || !years || !userId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // EMI formula
    let monthlyRate = rate / 12 / 100;
    let months = years * 12;

    let emi =
      (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    let totalPayment = emi * months;
    let totalInterest = totalPayment - amount;

    const record = new LoanRecord({
      userId,
      amount,
      rate,
      years,
      emi,
      totalInterest,
      totalPayment,
    });

    await record.save();

    res.json({ emi, totalInterest, totalPayment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// 📜 Fetch Records for Specific User
app.get("/history/:userId", async (req, res) => {
  try {
    const records = await LoanRecord.find({ userId: req.params.userId }).sort({
      date: -1,
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user records" });
  }
});

// ✅ For Vercel deployment, handle root route
app.get("/", (req, res) => {
  res.send("✅ EMI Loan Calculator Backend is Live!");
});

// ✅ Export app for Vercel
module.exports = app;

// 🧩 Local development mode
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}
