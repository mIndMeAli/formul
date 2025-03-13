const url = "https://script.google.com/macros/s/AKfycbwIgVqvqWj4rB8SW6OjS_LDv6SwS6mzHFg6Ts1T7f0GHo4kDyoq8CHVCkT_n2RCt7vf/exec";

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
        console.error(error);
        res.status(500).json({ status: "error", message: "Server error" });
    }
});

app.get("/api/proxy", async (req, res) => {
    if (req.query.login) {
        try {
            const response = await fetch(url + "?login=true");
            const users = await response.json();
            res.json(users);
        } catch (error) {
            res.status(500).json({ status: "error", message: "Server error" });
        }
    }
});