const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();

// 1. THE GATEKEEPER (CORS)
// This tells Render to allow requests from your Vercel showroom
app.use(cors({
    origin: '*', // Allows all origins for now to ensure it works
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. FILE STORAGE (For Reference Images)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// 3. DATABASE CONNECTION
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to Kodjo Database'))
    .catch(err => console.error('Database Connection Error:', err));

// 4. QUOTE SCHEMA
const quoteSchema = new mongoose.Schema({
    fullName: String,
    phone: String,
    email: String,
    location: String,
    category: String,
    description: String,
    imagePath: String,
    date: { type: Date, default: Date.now }
});
const Quote = mongoose.model('Quote', quoteSchema);

// 5. THE ORDER DESK (The API Route)
app.post('/api/quote', upload.single('referenceImage'), async (req, res) => {
    try {
        const newQuote = new Quote({
            ...req.body,
            imagePath: req.file ? req.file.path : null
        });
        await newQuote.save();
        
        console.log('New Commission Received from:', req.body.fullName);
        
        res.status(200).json({ 
            success: true, 
            message: 'Quote stored in the vault successfully.' 
        });
    } catch (error) {
        console.error('Factory Error:', error);
        res.status(500).json({ success: false, message: 'Internal Factory Error' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Factory running on port ${PORT}`));
