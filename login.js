document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const password = document.getElementById("password").value.trim();
    const loginMessage = document.getElementById("loginMessage");

    if (!password) {
        loginMessage.textContent = "Harap masukkan password!";
        loginMessage.style.color = "red";
        return;
    }

    try {
        const response = await fetch("https://formul-rays-projects-a6349016.vercel.app/api/proxy?login=true");
        const users = await response.json();

        const user = users.find(user => user.password === password);
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