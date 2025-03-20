document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const password = document.getElementById("password").value.trim();
    const loginMessage = document.getElementById("loginMessage");

    if (!password) {
        loginMessage.textContent = "Harap masukkan password!";
        loginMessage.style.color = "red";
        return;
    }

    try {
        const response = await fetch("/api/proxy?login=true");

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Invalid data format from server");
        }

        const user = data.find(user => user.password === password);
        if (user) {
            sessionStorage.setItem("loggedInUser", JSON.stringify(user));
            window.location.href = "form.html";
        } else {
            loginMessage.textContent = "Password salah!";
            loginMessage.style.color = "red";
        }
    } catch (error) {
        console.error("Error:", error);
        loginMessage.textContent = "Terjadi kesalahan saat login.";
        loginMessage.style.color = "red";
    }
});
