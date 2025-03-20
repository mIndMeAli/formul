import express from "express";
import fetch from "node-fetch"; // Untuk versi Node.js lama

const app = express();
app.use(express.json());

const url = "https://script.google.com/macros/s/AKfycbwIgVqvqWj4rB8SW6OjS_LDv6SwS6mzHFg6Ts1T7f0GHo4kDyoq8CHVCkT_n2RCt7vf/exec";

// Handle POST request
app.post("/api/proxy", async (req, res) => {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("POST Proxy Error:", error);
        res.status(500).json({ status: "error", message: "Server error" });
    }
});

// Handle GET request
app.get("/api/proxy", async (req, res) => {
    if (req.query.login) {
        try {
            const response = await fetch(`${url}?login=true`);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

            const users = await response.json();
            res.json(users);
        } catch (error) {
            console.error("GET Proxy Error:", error);
            res.status(500).json({ status: "error", message: "Server error" });
        }
    } else {
        res.status(400).json({ status: "error", message: "Invalid request" });
    }
});

// Ekspor handler untuk Vercel
export default app;