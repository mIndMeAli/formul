document.addEventListener("DOMContentLoaded", function () {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user || !user.pic) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("loggedInUser").textContent = user.pic;
    document.getElementById("logoutButton")?.addEventListener("click", () => {
        localStorage.removeItem("loggedInUser");
        window.location.href = "index.html";
    });

    const sheetSelect = document.getElementById("sheet");
    let fileDataPPPK = null;
    let fileDataPNS = null;

    sheetSelect?.addEventListener("change", function () {
        const status = this.value;
        document.getElementById("uploadPPPK").disabled = status !== "PPPK";
        document.getElementById("uploadPNS").disabled = status !== "PNS";
    });

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

            if (sheetName === "PPPK") fileDataPPPK = jsonData;
            if (sheetName === "PNS") fileDataPNS = jsonData;

            showStatusMessage(`File ${sheetName} berhasil diunggah.`, "green");
        };
        reader.readAsArrayBuffer(file);
    }

    document.getElementById("uploadPPPK")?.addEventListener("change", (e) => handleFileUpload(e, "PPPK"));
    document.getElementById("uploadPNS")?.addEventListener("change", (e) => handleFileUpload(e, "PNS"));

    function formatTanggal(tanggal) {
        const bulan = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        const [year, month, day] = tanggal.split("-");
        return `${parseInt(day)} ${bulan[parseInt(month) - 1]} ${year}`;
    }

    function showStatusMessage(message, color) {
        const statusMessage = document.getElementById("statusMessage");
        if (statusMessage) {
            statusMessage.textContent = message;
            statusMessage.style.color = color;
        }
    }

    async function submitExcelData(sheet, fileData) {
        if (!fileData || fileData.length < 2) {
            showStatusMessage("Data dalam file kosong atau tidak valid.", "red");
            return;
        }

        const headers = fileData[0];
        const rows = fileData.slice(1);

        const tanggalHariIni = formatTanggal(new Date().toISOString().split("T")[0]);

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowData = {};
            headers.forEach((header, index) => {
                rowData[header] = row[index] ?? "";
            });

            rowData["PIC"] = user.pic;
            rowData["Tanggal Usul Diterima BKPSDMD"] = tanggalHariIni;
            rowData["Status Usulan"] = rowData["Status Usulan"] || "";
            rowData["Keterangan"] = rowData["Keterangan"] || "";

            const requestBody = {
                sheet,
                data: rowData
            };

            try {
                const response = await fetch("https://formul-rays-projects-a6349016.vercel.app/api/proxy", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestBody)
                });

                const result = await response.json();
                if (!response.ok || result.status !== "success") {
                    throw new Error(result.message || "Gagal kirim baris ke spreadsheet.");
                }
            } catch (err) {
                showStatusMessage(`Error kirim baris ${i + 1}: ${err.message}`, "red");
                return;
            }
        }

        showStatusMessage("Semua data dari file berhasil dikirim!", "green");
        fileDataPPPK = null;
        fileDataPNS = null;
    }

    document.getElementById("usulanForm")?.addEventListener("submit", async function (event) {
        event.preventDefault();

        const sheet = sheetSelect?.value.trim();
        const nip = document.getElementById("nip")?.value.trim();
        const nama = document.getElementById("nama")?.value.trim();
        const unitKerja = document.getElementById("unitKerja")?.value.trim();
        const jenisPengusulan = document.getElementById("jenisPengusulan")?.value.trim();
        const rawTanggal = document.getElementById("tanggalUsul")?.value || "";
        const tanggalUsul = rawTanggal ? formatTanggal(rawTanggal) : "";

        const isFormFilled = sheet && nip && nama && unitKerja && jenisPengusulan && tanggalUsul;
        const isFileUploaded = (sheet === "PPPK" && fileDataPPPK) || (sheet === "PNS" && fileDataPNS);

        if (!isFormFilled && !isFileUploaded) {
            showStatusMessage("Harap isi form atau unggah file .xlsx!", "red");
            return;
        }

        if (isFormFilled) {
            const requestBody = {
                sheet,
                data: {
                    NIP: nip,
                    Nama: nama,
                    "Unit Kerja": unitKerja,
                    "Jenis Pengusulan": jenisPengusulan,
                    "Tanggal Usul Diterima BKPSDMD": tanggalUsul,
                    "Status Usulan": "",
                    Keterangan: "",
                    PIC: user.pic
                }
            };

            try {
                const response = await fetch("https://formul-rays-projects-a6349016.vercel.app/api/proxy", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestBody)
                });

                const data = await response.json();
                if (response.ok && data.status === "success") {
                    showStatusMessage("Data berhasil dikirim!", "green");
                    this.reset();
                    fileDataPPPK = null;
                    fileDataPNS = null;
                } else {
                    throw new Error(data?.message || "Gagal mengirim data!");
                }
            } catch (error) {
                showStatusMessage("Error: " + error.message, "red");
            }
        }

        if (isFileUploaded) {
            const fileData = sheet === "PPPK" ? fileDataPPPK : fileDataPNS;
            await submitExcelData(sheet, fileData);
        }
    });
});
