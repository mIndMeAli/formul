document.addEventListener("DOMContentLoaded", function() {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user || !user.pic) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("loggedInUser").textContent = user.pic;
    document.getElementById("logoutButton")?.addEventListener("click", function() {
        localStorage.removeItem("loggedInUser");
        window.location.href = "index.html";
    });

    const sheetSelect = document.getElementById("sheet");
    sheetSelect?.addEventListener("change", function() {
        const status = this.value;
        document.getElementById("uploadPPPK").disabled = status !== "PPPK";
        document.getElementById("uploadPNS").disabled = status !== "PNS";
    });

    let fileDataPPPK = null;
    let fileDataPNS = null;

    function handleFileUpload(event, sheetName) {
        const file = event.target.files[0];
        if (!file || !file.name.endsWith(".xlsx")) {
            alert("Hanya file .xlsx yang diterima!");
            return;
        }

        let reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = function (e) {
            let data = new Uint8Array(e.target.result);
            let workbook = XLSX.read(data, { type: "array" });
            let sheet = workbook.Sheets[workbook.SheetNames[0]];
            let jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            
            if (sheetName === "PPPK") fileDataPPPK = jsonData;
            if (sheetName === "PNS") fileDataPNS = jsonData;
        };
    }

    document.getElementById("uploadPPPK")?.addEventListener("change", function(event) {
        handleFileUpload(event, "PPPK");
    });
    document.getElementById("uploadPNS")?.addEventListener("change", function(event) {
        handleFileUpload(event, "PNS");
    });

    document.getElementById("usulanForm")?.addEventListener("submit", async function(event) {
        event.preventDefault();
        
        const sheet = sheetSelect?.value.trim();
        const nip = document.getElementById("nip")?.value.trim();
        const nama = document.getElementById("nama")?.value.trim();
        const unitKerja = document.getElementById("unitKerja")?.value.trim();
        const jenisPengusulan = document.getElementById("jenisPengusulan")?.value.trim();
        const tanggalUsul = document.getElementById("tanggalUsul")?.getAttribute("data-value") || "";

        if (!sheet || !nip || !nama || !unitKerja || !jenisPengusulan || !tanggalUsul) {
            showStatusMessage("Harap isi semua kolom!", "red");
            return;
        }

        const formData = {
            sheet, nip, nama, unitKerja, jenisPengusulan,
            tanggalUsul, pic: user.pic,
            fileDataPPPK: fileDataPPPK || null,
            fileDataPNS: fileDataPNS || null
        };

        try {
            const response = await fetch("https://formul-rays-projects-a6349016.vercel.app/api/proxy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error("Gagal menghubungi server.");
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

    function formatTanggal(tanggal) {
        const bulan = [
            "Januari","Februari","Maret","April","Mei","Juni","Juli",
            "Agustus","September","Oktober","November","Desember"
        ];
        const [year, month, day] = tanggal.split("-");
        return `${parseInt(day)} ${bulan[parseInt(month) - 1]} ${year}`;
    }
    
    if (tanggalInput) {
        tanggalInput.style.pointerEvents = "auto";
        
        tanggalInput.addEventListener("change", function () {
            let date = new Date(this.value);
            if (isNaN(date)) return;
            
            this.setAttribute("data-value", this.value);
            this.value = formatTanggal(this.value);
        });
        
        tanggalInput.addEventListener("focus", function () {
            this.type = "date";
            this.style.pointerEvents = "auto";

            if (this.getAttribute("data-value")) {
                this.value = this.getAttribute("data-value");
            }
        });
        
        tanggalInput.addEventListener("blur", function () {
            if (this.getAttribute("data-value")) {
                this.value = formatTanggal(this.getAttribute("data-value"));
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
