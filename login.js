document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const password = document.getElementById("password").value.trim();
    const loginMessage = document.getElementById("loginMessage");

    loginMessage.textContent = "";
    loginMessage.style.color = "black";

    if (!password) {
        loginMessage.textContent = "Harap masukkan password!";
        loginMessage.style.color = "red";
        return;
    }

    loginMessage.textContent = "Memuat...";
    loginMessage.style.color = "blue";

    try {
        const response = await fetch(/api/proxy?login=true&password=${encodeURIComponent(password)});

        if (!response.ok) {
            throw new Error(HTTP error! Status: ${response.status});
        }

        const data = await response.json();

        if (data.success) {
            // Simpan informasi user ke localStorage
            localStorage.setItem("loggedInUser", JSON.stringify({
                jenisPengusulan: data.jenisPengusulan,
                pic: data.pic
            }));

            // Redirect ke form.html
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
