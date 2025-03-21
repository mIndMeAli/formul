// Cek apakah user sudah login berdasarkan localStorage
if (!localStorage.getItem("loggedIn")) {
    window.location.href = "index.html"; // Jika belum login, kembali ke login page
} else {
    // Tampilkan nama PIC di halaman form
    document.getElementById("picName").textContent = localStorage.getItem("pic") || "Tidak Diketahui";
}

// Logout function
document.getElementById("logoutBtn").addEventListener("click", function() {
    localStorage.removeItem("loggedIn"); 
    localStorage.removeItem("jenisPengusulan");
    localStorage.removeItem("pic");
    
    window.location.href = "index.html"; // Redirect ke login
});
