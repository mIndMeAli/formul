document.addEventListener("DOMContentLoaded", function () {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user || !user.pic) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("loggedInUser").textContent = user.pic;
    document.getElementById("logoutButton").addEventListener("click", () => {
        localStorage.removeItem("loggedInUser");
        window.location.href = "index.html";
    });

    const sheetSelect = document.getElementById("sheet");
    const form = document.getElementById("usulanForm");

    sheetSelect.addEventListener("change", function () {
        const status = this.value;
        document.getElementById("uploadPPPK").disabled = status !== "PPPK";
        document.getElementById("uploadPNS").disabled = status !== "PNS";
    });

    let fileDataPPPK = null;
    let fileDataPNS = null;

    const expectedHeaders = [
        "NIP", "Nama", "Unit Kerja", "Jenis Pengusulan",
        "Tanggal Usul Diterima BKPSDMD", "Status Usulan", "Keterangan", "PIC"
    ];

    function validateHeaders(headers) {
        return expectedHeaders.every((head, i) => head === headers[i]);
    }

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
        };
        reader.readAsArrayBuffer(file);
    }

    document.getElementById("uploadPPPK").addEventListener("change", (e) => handleFileUpload(e, "PPPK"));
    document.getElementById("uploadPNS").addEventListener("change", (e) => handleFileUpload(e, "PNS"));

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

    form.addEventListener("submit", async function (event) {
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
            showStatusMessage("Isi form atau unggah file!", "red");
            return;
        }

        const dataToUpload = sheet === "PPPK" ? fileDataPPPK : fileDataPNS;
        if (isFileUploaded) {
            try {
                for (const row of dataToUpload) {
                    const [nip, nama, unitKerja, jenisPengusulan, tanggal = "", status = "", keterangan = ""] = row;
                    const requestBody = {
                        sheet,
                        data: {
                            NIP: String(nip),
                            Nama: nama,
                            "Unit Kerja": unitKerja,
                            "Jenis Pengusulan": jenisPengusulan,
                            "Tanggal Usul Diterima BKPSDMD": tanggal || "",
                            "Status Usulan": status || "",
                            Keterangan: keterangan || "",
                            PIC: user.pic
                        }
                    };

                    await fetch("https://formul-rays-projects-a6349016.vercel.app/api/proxy", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(requestBody)
                    });
                }
                showStatusMessage("File berhasil dikirim ke spreadsheet!", "green");
                form.reset();
                fileDataPPPK = null;
                fileDataPNS = null;
                return;
            } catch (error) {
                showStatusMessage("Gagal kirim file: " + error.message, "red");
                return;
            }
        }

        // Jika user isi manual
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
                    form.reset();
                } else {
                    throw new Error(data?.message || "Gagal mengirim data!");
                }
            } catch (error) {
                showStatusMessage("Error: " + error.message, "red");
            }
            return;
        }

        showStatusMessage("Isi form secara manual atau unggah file terlebih dahulu!", "red");
    });
});
