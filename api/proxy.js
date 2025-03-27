import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const url = "https://script.google.com/macros/s/AKfycbzkU7zkYnpq3qDHt_gxl7to_iV2H0XBkuVYyBQsPHo3gFX37lWefPvoJjKpiuFLuJLc/exec";

// **Handle POST request**
app.post("/api/proxy", async (req, res) => {
    try {
        console.log("🔄 Incoming POST request to proxy:", req.body);

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body),
        });

        const text = await response.text(); // Ambil response dalam teks untuk debugging
        console.log("🔍 Response dari Apps Script:", text);

        // **Cek apakah response benar-benar JSON**
        if (!text.startsWith("{")) {
            throw new Error("Response bukan JSON: " + text);
        }

        const data = JSON.parse(text);
        res.json(data);
    } catch (error) {
        console.error("🚨 POST Proxy Error:", error);
        res.status(500).json({ status: "error", message: "Server error", debug: error.message });
    }
});

// **Handle GET request untuk login**
app.get("/api/proxy", async (req, res) => {
    try {
        const { login, password } = req.query;
        console.log("🔄 Incoming GET request:", req.query);

        if (login === "true" && password) {
            const response = await fetch(`${url}?login=true&password=${encodeURIComponent(password)}`);
            const text = await response.text();

            console.log("🔍 Response dari Apps Script (GET):", text);

            if (!text.startsWith("{")) {
                throw new Error("Response bukan JSON: " + text);
            }

            const data = JSON.parse(text);
            res.json(data);
        } else {
            res.status(400).json({ status: "error", message: "Invalid request" });
        }
    } catch (error) {
        console.error("🚨 GET Proxy Error:", error);
        res.status(500).json({ status: "error", message: "Server error", debug: error.message });
    }
});

// **Ekspor handler untuk Vercel**
export default app;
