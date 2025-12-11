console.log("1. Starting app.ts...");

import dotenv from 'dotenv';
dotenv.config(); 
console.log("2. Env loaded. Port is:", process.env.PORT);

import express from 'express';
console.log("3. Express imported");

import cors from 'cors';
import router from './routes'; // This looks for src/routes/index.ts

console.log("4. Routes imported");

const app = express();
app.use(cors());
app.use(express.json());

console.log("5. Middleware setup complete");

app.use('/api', router);

console.log("6. Routes registered");

const PORT = process.env.PORT || 5000;

try {
    app.listen(PORT, () => {
        console.log(`✅ SUCCESS! Server is running on port ${PORT}`);
    });
} catch (error) {
    console.error("❌ Error starting server:", error);
}

console.log("7. Waiting for server to start...");