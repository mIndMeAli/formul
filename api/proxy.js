import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const url = "https://script.google.com/macros/s/AKfycbzkU7zkYnpq3qDHt_gxl7to_iV2H0XBkuVYyBQsPHo3gFX37lWefPvoJjKpiuFLuJLc/exec";

// **Fungsi untuk melakukan fetch dengan timeout**
const fetchWithTimeout = async (resource, options = {}, timeout = 8000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(resource, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
};

// **Handle POST request**
app.post("/api/proxy", async (req, res) => {
    try {
        console.log("🔄 Incoming POST request to proxy:", req.body);

        const response = await fetchWithTimeout(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const text = await response.text();
        console.log("🔍 Response dari Apps Script (POST):", text);

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
            const fullUrl = `${url}?login=true&password=${encodeURIComponent(password)}`;
            console.log("🔗 Fetching URL:", fullUrl);

            const response = await fetchWithTimeout(fullUrl, {}, 8000); // Timeout 8 detik
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const text = await response.text();
            console.log("🔍 Response dari Apps Script (GET):", text);

            if (!text.startsWith("{")) {
                throw new Error("Response bukan JSON: " + text);
            }

            const data = JSON.parse(text);
            res.json(data);
        } else {
            res.status(400).json({ status: "error", message: "Invalid request: missing login or password" });
        }
    } catch (error) {
        console.error("🚨 GET Proxy Error:", error);
        res.status(500).json({ status: "error", message: "Server error", debug: error.message });
    }
});

// **Ekspor handler untuk Vercel**
export default app;
