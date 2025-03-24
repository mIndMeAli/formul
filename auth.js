console.log("🚀 auth.js dijalankan!");

// Ambil data user dari localStorage
const user = JSON.parse(localStorage.getItem("loggedInUser"));

console.log("📌 loggedIn:", user ? true : false);
console.log("📌 jenisPengusulan:", user ? user.jenisPengusulan : "Tidak ada");
console.log("📌 pic:", user ? user.pic : "Tidak ada");

document.addEventListener("DOMContentLoaded", function() {
    // Cek apakah user sudah login
    if (!user || !user.pic) {
        window.location.href = "index.html";
        return;
    }

    // Cek elemen sebelum mengaksesnya
    const picElement = document.getElementById("loggedInUser");
    if (picElement) {
        picElement.textContent = user.pic || "Tidak Diketahui";
    } else {
        console.warn("⚠️ Elemen loggedInUser tidak ditemukan di halaman.");
    }

    // Logout button
    const logoutButton = document.getElementById("logoutBtn");
    if (logoutButton) {
        logoutButton.addEventListener("click", function() {
            localStorage.removeItem("loggedInUser");
            window.location.href = "index.html";
        });
    } else {
        console.warn("⚠️ Tombol logout tidak ditemukan di halaman.");
    }
});
