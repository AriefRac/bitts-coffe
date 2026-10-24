/* ==========================================================================
   BITTS CLUB: Penerima pendaftaran dari landing page ke Google Sheets
   ==========================================================================

   Cara deploy:
   1. Buat Google Sheet baru (mis. "Bitts Club"), lalu buka Extensions > Apps Script.
   2. Hapus kode bawaan, tempel seluruh isi file ini, lalu simpan.
   3. Klik Deploy > New deployment > pilih tipe "Web app".
        - Execute as: Me
        - Who has access: Anyone
   4. Izinkan akses saat diminta, lalu salin URL Web App (berakhiran /exec)
      ke konstanta CLUB_SHEET_URL di script.js.

   Setiap kali kode ini diubah, buat deployment versi baru
   (Deploy > Manage deployments > Edit > Version: New version) agar perubahan aktif.
   ========================================================================== */

const SHEET_NAME = 'Anggota';
const HEADERS = ['Waktu Daftar', 'Nomor WhatsApp', 'Sumber (utm_source)', 'Halaman'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // Avoid two signups writing the same row at once

  try {
    const params = (e && e.parameter) || {};
    const phone = String(params.phone || '').replace(/\D/g, '');

    if (!/^628\d{8,11}$/.test(phone)) {
      return jsonResponse_({ ok: false, error: 'invalid_phone' });
    }

    const sheet = getSheet_();
    if (isRegistered_(sheet, phone)) {
      return jsonResponse_({ ok: true, duplicate: true });
    }

    // Leading apostrophe keeps the number as text (no scientific notation)
    sheet.appendRow([new Date(), "'" + phone, params.source || 'direct', params.page || '']);
    return jsonResponse_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function isRegistered_(sheet, phone) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;

  const phones = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
  return phones.some(row => String(row[0]) === phone);
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
