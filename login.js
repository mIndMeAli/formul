document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const passwordInput = document.getElementById("password");
    const password = passwordInput.value.trim();
    const loginMessage = document.getElementById("loginMessage");

    // Reset pesan login
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
        // Fetch ke proxy untuk verifikasi login
        const response = await fetch(`/api/proxy?login=true&password=${encodeURIComponent(password)}`);

        if (!response.ok) {
            throw new Error(`Login gagal! Status: ${response.status}`);
        }

        const text = await response.text(); // Ambil sebagai teks dulu
        console.log("🔍 Response dari proxy:", text); // Debugging

        // Pastikan response berupa JSON
        if (!text.startsWith("{")) {
            throw new Error("Response bukan JSON: " + text);
        }

        const data = JSON.parse(text); // Ubah menjadi objek

        if (data.success) {
            // Simpan user di localStorage
            localStorage.setItem("loggedInUser", JSON.stringify({
                jenisPengusulan: data.jenisPengusulan,
                pic: data.pic
            }));

            // Redirect ke halaman form
            window.location.href = "form.html";
        } else {
            loginMessage.textContent = "Password salah!";
            loginMessage.style.color = "red";
        }
    } catch (error) {
        console.error("🚨 Error saat login:", error);
        loginMessage.textContent = "Terjadi kesalahan saat login. Periksa koneksi atau coba lagi.";
        loginMessage.style.color = "red";
    } finally {
        passwordInput.value = ""; // Hapus input password setelah mencoba login
    }
});
