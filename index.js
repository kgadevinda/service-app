import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { db } from './firebase.js';
import userRoutes from './routes/userRoutes.js';
import workerRoutes from './routes/workerRoutes.js';
import workRequestRoutes from './routes/workRequestRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js'; // Import review routes
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();

// Define CORS options
const corsOptions = {
  origin: 'http://localhost:3000',  // Your frontend's URL, e.g., React or Angular running on port 3000
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Specify allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'],  // Specify allowed headers
};

// Apply CORS middleware with options
app.use(cors(corsOptions)); 
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Middleware for JWT Authentication
const authenticateUser = (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    jwt.verify(token, "Secret_Key-7973", (error, decoded) => {
        if (error) {
            return res.status(403).json({ error: "Forbidden: Invalid token" });
        }

        req.user = decoded; // Attach user info to request
        next(); // Proceed to the next middleware or route
    });
};

// Routes
app.use('/api/users', userRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/requests', authenticateUser, workRequestRoutes); // Protect work requests
app.use('/api/chats', authenticateUser, chatRoutes); // Protect chats
app.use('/api/reviews', authenticateUser, reviewRoutes); // Add review routes

// Test Firebase connection
app.get('/test', async (req, res) => {
    try {
        await db.collection('test').add({ message: 'Firebase connected!' });
        res.send('🔥 Firestore is working!');
    } catch (error) {
        res.status(500).send('Firebase error: ' + error.message);
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

export { authenticateUser }; // ✅ Export middleware for use in controllers
