document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const passwordInput = document.getElementById("password");
    const password = passwordInput.value.trim();
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
        const response = await fetch(`/api/proxy?login=true`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password })
        });

        if (!response.ok) {
            throw new Error(`Login gagal! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            localStorage.setItem("loggedInUser", JSON.stringify({
                jenisPengusulan: data.jenisPengusulan,
                pic: data.pic
            }));

            window.location.href = "form.html";
        } else {
            loginMessage.textContent = "Password salah!";
            loginMessage.style.color = "red";
        }
    } catch (error) {
        console.error("Error:", error);
        loginMessage.textContent = "Terjadi kesalahan saat login.";
        loginMessage.style.color = "red";
    } finally {
        passwordInput.value = ""; // Hapus input password setelah mencoba login
    }
});
