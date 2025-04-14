let fileDataPPPK = null;
let fileDataPNS = null;

// Ambil elemen-elemen form
const sheetSelect = document.getElementById("sheet");
const uploadPPPK = document.getElementById("uploadPPPK");
const uploadPNS = document.getElementById("uploadPNS");
const form = document.getElementById("usulanForm");
const statusDiv = document.getElementById("status");
const picField = document.getElementById("pic");

// Update nama pengguna login
const loggedUser = sessionStorage.getItem("loggedInUser");
if (!loggedUser) {
    window.location.href = "index.html";
} else {
    document.getElementById("user-info").innerText = "Login sebagai: " + loggedUser;
}

// Set nilai default PIC di form
if (picField) {
    picField.value = loggedUser;
}

// Sheet selection toggle
sheetSelect.addEventListener("change", function () {
    const status = this.value;
    uploadPPPK.disabled = status !== "PPPK";
    uploadPNS.disabled = status !== "PNS";
    updateFormRequirements(); // Update required input saat sheet diganti
});

// Validasi headers file
function validateHeaders(headers) {
    const expected = ["NIP", "Nama", "Unit Kerja", "Jenis Pengusulan"];
    return expected.every((val, index) => headers[index]?.trim().toLowerCase() === val.toLowerCase());
}

// Validasi baris data
function validateRows(rows) {
    return rows.every((row, index) => {
        if (row.length < 4) {
            console.warn(`Baris ${index + 2} tidak lengkap.`);
            return false;
        }
        const [nip, nama, unit, jenis] = row;
        return /^\d{18}$/.test(nip) && nama && unit && jenis;
    });
}

// Tampilkan status
function showStatusMessage(message, color = "black") {
    if (statusDiv) {
        statusDiv.innerText = message;
        statusDiv.style.color = color;
    }
}

// Atur ulang input required tergantung penggunaan upload file
function updateFormRequirements() {
    const isUsingFileUpload =
        (sheetSelect.value === "PPPK" && fileDataPPPK) ||
        (sheetSelect.value === "PNS" && fileDataPNS);

    ["nip", "nama", "unitKerja", "jenisPengusulan", "tanggalUsul"].forEach((id) => {
        const input = document.getElementById(id);
        if (input) input.required = !isUsingFileUpload;
    });
}

// Handle upload file
function handleFileUpload(event, sheetName) {
    const file = event.target.files[0];
    if (!file || !file.name.endsWith(".xlsx")) {
        alert("Hanya file .xlsx yang diterima!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const [headers, ...rows] = jsonData;

        if (!validateHeaders(headers)) {
            showStatusMessage("Header tidak sesuai template!", "red");
            return;
        }

        if (!validateRows(rows)) {
            showStatusMessage("Ada baris dengan format tidak valid (cek NIP dan kolom wajib)!", "red");
            return;
        }

        if (sheetName === "PPPK") fileDataPPPK = rows;
        if (sheetName === "PNS") fileDataPNS = rows;

        showStatusMessage("File berhasil dibaca dan divalidasi!", "green");

        updateFormRequirements(); // ⬅ ini penting
    };
    reader.readAsArrayBuffer(file);
}

uploadPPPK.addEventListener("change", (e) => handleFileUpload(e, "PPPK"));
uploadPNS.addEventListener("change", (e) => handleFileUpload(e, "PNS"));

// Submit form
form.addEventListener("submit", function (e) {
    e.preventDefault();

    const status = sheetSelect.value;
    const url = "https://script.google.com/macros/s/AKfycbwc4OMLCsmijps1UTdtDnsqAe1DZ3n4uFhk23kvL9Q7_Pv-753SwbPsnHFTVYRboKz7/exec";

    const isFormFilled = document.getElementById("nip").value.trim() &&
        document.getElementById("nama").value.trim() &&
        document.getElementById("unitKerja").value.trim() &&
        document.getElementById("jenisPengusulan").value &&
        document.getElementById("tanggalUsul").value;

    const isFileUploaded = (status === "PPPK" && fileDataPPPK) || (status === "PNS" && fileDataPNS);

    if (!status) {
        alert("Pilih jenis status kepegawaian terlebih dahulu.");
        return;
    }

    if (!isFormFilled && !isFileUploaded) {
        alert("Silakan isi formulir atau upload file terlebih dahulu.");
        return;
    }

    if (isFileUploaded) {
        const fileRows = status === "PPPK" ? fileDataPPPK : fileDataPNS;
        const formattedData = fileRows.map(row => ({
            nip: row[0],
            nama: row[1],
            unitKerja: row[2],
            jenisPengusulan: row[3],
            tanggalUsul: "",
            status,
            keterangan: "",
            pic: loggedUser
        }));

        fetch(url, {
            method: "POST",
            body: JSON.stringify({ data: formattedData }),
            headers: { "Content-Type": "application/json" }
        })
            .then(res => res.ok ? res.text() : Promise.reject("Gagal mengirim"))
            .then(response => {
                alert("Data berhasil dikirim!");
                fileDataPPPK = null;
                fileDataPNS = null;
                form.reset();
                showStatusMessage("");
                updateFormRequirements(); // Reset required input
            })
            .catch(err => {
                console.error(err);
                alert("Gagal mengirim data.");
            });

    } else {
        // Submit form manual
        const formData = {
            nip: document.getElementById("nip").value,
            nama: document.getElementById("nama").value,
            unitKerja: document.getElementById("unitKerja").value,
            jenisPengusulan: document.getElementById("jenisPengusulan").value,
            tanggalUsul: document.getElementById("tanggalUsul").value,
            status,
            keterangan: "",
            pic: loggedUser
        };

        fetch(url, {
            method: "POST",
            body: JSON.stringify({ data: [formData] }),
            headers: { "Content-Type": "application/json" }
        })
            .then(res => res.ok ? res.text() : Promise.reject("Gagal mengirim"))
            .then(response => {
                alert("Data berhasil dikirim!");
                form.reset();
                showStatusMessage("");
            })
            .catch(err => {
                console.error(err);
                alert("Gagal mengirim data.");
            });
    }
});
