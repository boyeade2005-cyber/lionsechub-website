import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const MONGO_URI = "mongodb+srv://lionsechub_db_user:adeboye25@lionsechub.isxb8xo.mongodb.net/lionsechub?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student','admin','instructor'], default: 'student' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const registrationSchema = new mongoose.Schema({
  fullname: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  location: { type: String, trim: true },
  course: { type: String, required: true },
  paymentPlan: { type: String, required: true, enum: ['full', 'installment'] },
  notes: { type: String, trim: true },
  status: { type: String, enum: ['pending', 'contacted', 'enrolled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Registration = mongoose.model('Registration', registrationSchema);

app.post("/api/register-user", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields are required" });
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    return res.status(201).json({ message: "User registration successful" });
  } catch (err) {
    console.error("User Register Error:", err);
    return res.status(500).json({ error: "Server error, try again later" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "All fields are required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(401).json({ error: "Invalid password" });
    const token = jwt.sign({ id: user._id }, "lionsechub_secret", { expiresIn: "1d" });
    return res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ error: "Server error, try again later" });
  }
});

app.post("/api/register", async (req, res) => {
  try {
    const { fullname, email, phone, location, course, paymentPlan, notes } = req.body;
    if (!fullname || !email || !phone || !course || !paymentPlan) {
      return res.status(400).json({ message: "Required fields: fullname, email, phone, course, paymentPlan." });
    }
    console.log("✅ New Registration:", { fullname, email, course });
    const newReg = new Registration({ fullname, email, phone, location, course, paymentPlan, notes });
    await newReg.save();
    return res.json({ message: "Registration received! We will contact you within 48 hours." });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    return res.status(500).json({ message: "Server error. Try again later." });
  }
});

app.get("/", (req, res) => {
  res.send("🦁 LionSec Hub Backend is Running! 🚀");
});

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    mongodb: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔥 Server running on http://localhost:${PORT}`));