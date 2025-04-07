import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const url = "https://script.google.com/macros/s/AKfycbyUjz2vOAI-8pUzDHEaR6GLFfT4ZifOGMuGU4jgpYHwgfeL_aYG9-rcIzCcVyPmJawi/exec";

// **Handle POST request (jika dibutuhkan)**
app.post("/api/proxy", async (req, res) => {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body),
        });

        const text = await response.text();
        console.log("RAW Response from Google Script:", text);
        
        try {
          const data = JSON.parse(text);
          res.json(data);
        } catch (err) {
          console.error("POST Proxy Error: Bukan JSON yang valid:", text);
          res.status(500).json({
            status: "error",
            message: "Respon dari Google Script bukan JSON",
            raw: text,
          });
        }

    } catch (error) {
        console.error("POST Proxy Error:", error);
        res.status(500).json({ status: "error", message: "Server error" });
    }
});

// **Handle GET request untuk login**
app.get("/api/proxy", async (req, res) => {
    try {
        const { login, password } = req.query;

        if (login === "true" && password) {
            const response = await fetch(`${url}?login=true&password=${encodeURIComponent(password)}`);
            const text = await response.text(); // Cek response dalam bentuk teks

            // **Pastikan response adalah JSON, bukan HTML atau error lainnya**
            if (!text.startsWith("{")) {
                throw new Error("Response bukan JSON: " + text);
            }

            const data = JSON.parse(text);
            res.json(data);
        } else {
            res.status(400).json({ status: "error", message: "Invalid request" });
        }
    } catch (error) {
        console.error("GET Proxy Error:", error);
        res.status(500).json({ status: "error", message: "Server error" });
    }
});

// **Ekspor handler untuk Vercel**
export default app;
