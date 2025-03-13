// Cek apakah user sudah login
if (!localStorage.getItem("user")) {
    window.location.href = "index.html"; // Jika belum login, kembali ke login page
}

// Logout function
document.getElementById("logoutBtn").addEventListener("click", function() {
    localStorage.removeItem("user"); // Hapus session
    window.location.href = "index.html"; // Redirect ke login
});
