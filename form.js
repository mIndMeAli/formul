document.getElementById("usulanForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const sheet = document.getElementById("sheet").value.trim();
    const nip = document.getElementById("nip").value.trim();
    const nama = document.getElementById("nama").value.trim();
    const unitKerja = document.getElementById("unitKerja").value.trim();
    const jenisPengusulan = document.getElementById("jenisPengusulan").value.trim();
    const statusMessage = document.getElementById("statusMessage");

    if (!sheet || !nip || !nama || !unitKerja || !jenisPengusulan) {
        statusMessage.textContent = "Harap isi semua kolom!";
        statusMessage.style.color = "red";
        return;
    }

    const formData = { sheet, nip, nama, unitKerja, jenisPengusulan };

    try {
        const response = await fetch("/api/proxy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error("Gagal menghubungi server. Coba lagi nanti.");
        }

        const data = await response.json();

        if (data.status === "success") {
            statusMessage.textContent = "Data berhasil dikirim!";
            statusMessage.style.color = "green";
            document.getElementById("usulanForm").reset();
        } else {
            throw new Error(data.message || "Gagal mengirim data!");
        }
    } catch (error) {
        statusMessage.textContent = error.message;
        statusMessage.style.color = "red";
    }
});
