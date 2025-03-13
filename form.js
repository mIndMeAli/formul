document.addEventListener("DOMContentLoaded", function() {
    const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
    if (!user) {
        window.location.href = "index.html";
    } else {
        document.getElementById("loggedInUser").textContent = user.pic;
    }

    document.getElementById("logoutButton").addEventListener("click", function() {
        sessionStorage.removeItem("loggedInUser");
        window.location.href = "index.html";
    });
});

function showStatusMessage(message, color) {
    const statusMessage = document.getElementById("statusMessage");
    statusMessage.textContent = message;
    statusMessage.style.color = color;
}

document.getElementById("usulanForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const sheet = document.getElementById("sheet").value.trim();
    const nip = document.getElementById("nip").value.trim();
    const nama = document.getElementById("nama").value.trim();
    const unitKerja = document.getElementById("unitKerja").value.trim();
    const jenisPengusulan = document.getElementById("jenisPengusulan").value.trim();
    const user = JSON.parse(sessionStorage.getItem("loggedInUser"));

    if (!sheet || !nip || !nama || !unitKerja || !jenisPengusulan) {
        showStatusMessage("Harap isi semua kolom!", "red");
        return;
    }

    const formData = { sheet, nip, nama, unitKerja, jenisPengusulan, pic: user.pic };

    try {
        const response = await fetch("https://formul-rays-projects-a6349016.vercel.app/api/proxy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error("Gagal menghubungi server. Coba lagi nanti.");
        }

        const data = await response.json();

        if (data.status === "success") {
            showStatusMessage("Data berhasil dikirim!", "green");
            document.getElementById("usulanForm").reset();
        } else {
            throw new Error(data.message || "Gagal mengirim data!");
        }
    } catch (error) {
        showStatusMessage("Error: " + error.message, "red");
    }
});