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

document.addEventListener("DOMContentLoaded", function () {
    const uploadPPPK = document.getElementById("uploadPPPK");
    const uploadPNS = document.getElementById("uploadPNS");
    const submitButton = document.querySelector("button[type='submit']");

    let fileDataPPPK = null;
    let fileDataPNS = null;

    uploadPPPK.addEventListener("change", function(event) {
        readExcelFile(event.target.files[0], "PPPK");
    });

    uploadPNS.addEventListener("change", function(event) {
        readExcelFile(event.target.files[0], "PNS");
    });

    function readExcelFile(file, sheetName) {
        if (!file) return;
        if (!file.ame.endWith(".xlsx")) {
            alert("Hanya file .xlsx yang diterima!");
            return;
        }

        let reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = function (event) {
            let data = new Uint8Array(event.target.result);
            let workbook = XLSX.read(data, { type: "array" });
            let sheet = workbook.Sheets[workbook.SheetNames[0]];
            let jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1});

            if (sheetNAme === "PPPK") {
                fileDataPPPK = jsonData;
            } else if (sheetName === "PNS") {
                fileDataPNS = jsonData;
            }

            console.log(`Data ${sheetName}:`, jsonData);
        };
    }

    submitButton.addEventListener("click", function (event) {
        event.preventDefault();

        let formData = {
            tanggalUsul: document.getElementById("tanggalUsul").getAttribute("data-value") || "",
            nip: document.getElementById("nip").value,
            nama: document.getElementById("nama").value,
            unitKerja: document.getElementById("unitKerja").value,
            jenisPengusulan: document.getElementById("jenisPengusulan").value,
            fileDataPPPK: fileDataPPPK,
            fileDataPNS: fileDataPNS
        };
        
        fetch("https://formul-rays-projects-a6349016.vercel.app/api/proxy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            alert("Data berhasil dikirim!");
            console.log(data);
        })
        .catch(error => {
            alert("Terjadi kesalahan saat mengirim data.");
            console.error(error);
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const tanggalInput = document.getElementById("tanggalUsul");

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
        this.type = "date";
    });

    tanggalInput.addEventListener("blur", function () {
        this.type = "text";
        this.value = this.getAttribute("data-value") 
            ? new Date(this.getAttribute("data-value")).toLocaleDateString("id-ID", {
                day: "2-digit", month: "long", year: "numeric"
            }) 
            : "";
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