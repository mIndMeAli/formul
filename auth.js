console.log("🚀 auth.js dijalankan!");
console.log("📌 loggedIn:", localStorage.getItem("loggedIn"));
console.log("📌 jenisPengusulan:", localStorage.getItem("jenisPengusulan"));
console.log("📌 pic:", localStorage.getItem("pic"));

if (!localStorage.getItem("loggedIn")) {
    window.location.href = "index.html";
} else {
    document.getElementById("picName").textContent = localStorage.getItem("pic") || "Tidak Diketahui";
}

document.getElementById("logoutBtn").addEventListener("click", function() {
    localStorage.removeItem("loggedIn"); 
    localStorage.removeItem("jenisPengusulan");
    localStorage.removeItem("pic");
    
    window.location.href = "index.html";
});
