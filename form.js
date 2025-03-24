document.addEventListener("DOMContentLoaded", function() {
    // Ambil data user dari localStorage
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    
    if (!user || !user.pic) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("loggedInUser").textContent = user.pic;

    document.getElementById("logoutButton").addEventListener("click", function() {
        localStorage.removeItem("loggedInUser");
        window.location.href = "index.html";
    });

    document.getElementById("sheet").addEventListener("change", function() {
        const status = this.value;
        document.getElementById("uploadPPPK").disabled = status !== "PPPK";
        document.getElementById("uploadPNS").disabled = status !== "PNS";
    });

    const uploadPPPK = document.getElementById("uploadPPPK");
    const uploadPNS = document.getElementById("uploadPNS");
    let fileDataPPPK = null;
    let fileDataPNS = null;

    if (uploadPPPK) {
        uploadPPPK.addEventListener("change", function(event) {
            readExcelFile(event.target.files[0], "PPPK");
        });
    }

    if (uploadPNS) {
        uploadPNS.addEventListener("change", function(event) {
            readExcelFile(event.target.files[0], "PNS");
        });
    }

    function readExcelFile(file, sheetName) {
        if (!file) return;
        if (!file.name.endsWith(".xlsx")) {
            alert("Hanya file .xlsx yang diterima!");
            return;
        }

        let reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = function (event) {
            let data = new Uint8Array(event.target.result);
            let workbook = XLSX.read(data, { type: "array" });
            let sheet = workbook.Sheets[workbook.SheetNames[0]];
            let jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            if (sheetName === "PPPK") {
                fileDataPPPK = jsonData;
            } else if (sheetName === "PNS") {
                fileDataPNS = jsonData;
            }

            console.log(`Data ${sheetName}:`, jsonData);
        };
    }

    document.getElementById("usulanForm").addEventListener("submit", async function(event) {
        event.preventDefault();

        const sheet = document.getElementById("sheet")?.value.trim();
        const nip = document.getElementById("nip")?.value.trim();
        const nama = document.getElementById("nama")?.value.trim();
        const unitKerja = document.getElementById("unitKerja")?.value.trim();
        const jenisPengusulan = document.getElementById("jenisPengusulan")?.value.trim();
        const tanggalUsul = document.getElementById("tanggalUsul")?.getAttribute("data-value") || "";

        if (!sheet || !nip || !nama || !unitKerja || !jenisPengusulan) {
            showStatusMessage("Harap isi semua kolom!", "red");
            return;
        }

        let formData = {
            sheet,
            nip,
            nama,
            unitKerja,
            jenisPengusulan,
            tanggalUsul,
            pic: user.pic,
            fileDataPPPK,
            fileDataPNS
        };

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
                fileDataPPPK = null;
                fileDataPNS = null;
            } else {
                throw new Error(data.message || "Gagal mengirim data!");
            }
        } catch (error) {
            showStatusMessage("Error: " + error.message, "red");
        }
    });

    const tanggalInput = document.getElementById("tanggalUsul");

    if (tanggalInput) {
        tanggalInput.readOnly = true;

        tanggalInput.addEventListener("change", function () {
            let date = new Date(this.value);
            if (isNaN(date)) return;

            let formattedDate = date.toLocaleDateString("id-ID", {
                day: "2-digit", month: "long", year: "numeric"
            });

            this.setAttribute("data-value", this.value);
            this.value = formattedDate;
        });

        tanggalInput.addEventListener("focus", function () {
            this.type = "date"; // Saat diklik, ubah jadi input date agar bisa memilih
        });

        tanggalInput.addEventListener("blur", function () {
            this.type = "text"; // Kembalikan ke format teks
            if (this.getAttribute("data-value")) {
                this.value = new Date(this.getAttribute("data-value")).toLocaleDateString("id-ID", {
                    day: "2-digit", month: "long", year: "numeric"
                });
            } else {
                this.value = "";
        }
        });
    }

    function showStatusMessage(message, color) {
        const statusMessage = document.getElementById("statusMessage");
        if (statusMessage) {
            statusMessage.textContent = message;
            statusMessage.style.color = color;
        }
    }
});
