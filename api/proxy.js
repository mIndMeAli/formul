export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const response = await fetch("https://script.google.com/macros/s/AKfycbwIgVqvqWj4rB8SW6OjS_LDv6SwS6mzHFg6Ts1T7f0GHo4kDyoq8CHVCkT_n2RCt7vf/exec", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(req.body)
            });

            const data = await response.json();
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ status: "error", message: "Terjadi kesalahan saat menghubungi Google Apps Script." });
        }
    } else {
        return res.status(405).json({ message: "Method Not Allowed" });
    }
}
