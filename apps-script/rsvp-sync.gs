/**
 * Nhận hồi âm (RSVP) từ index.html và ghi thẳng vào sheet "Danh sách khách mời".
 * Dò đúng hàng của khách (khớp Xưng hô + Tên khách) để cập nhật đè — khách gửi
 * lại nhiều lần vẫn ghi vào đúng 1 hàng, không tạo dòng trùng. Không tìm thấy
 * (link không tham số, hoặc khách lạ) thì thêm hàng mới ở cuối.
 *
 * Cài đặt: xem README.md, mục "Nối hồi âm vào Google Sheet".
 */

var SHEET_NAME = 'Danh sách khách mời';
var HEADER_ROW = 1; // dòng tiêu đề cột

// Thứ tự cột trong sheet — sửa lại số nếu bạn đổi vị trí cột
var COL = {
  pronounGuest: 1,  // A - Xưng hô
  guestName:    2,  // B - Tên khách
  group:        3,  // C - Nhóm
  date:         4,  // D - Ngày mời
  companion:    5,  // E - Người đi cùng
  pronounHost:  6,  // F - Cô dâu Chú rể xưng hô
  rsvp:         7,  // G - RSVP status
  link:         8,  // H - Link mời (công thức, không đụng vào)
  guestsCount:  9,  // I - Số người đi cùng
  phone:        10, // J - Số điện thoại
  notes:        11  // K - Notes
};

// Chỉnh 2 dòng này cho khớp CHÍNH XÁC chữ trong dropdown "RSVP status" của bạn
var STATUS_YES = 'Tham dự';
var STATUS_NO  = 'Từ chối';

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var data = (e && e.parameter) || {};

  var pronounGuest = (data.pronounGuest || '').trim();
  var guestName    = (data.guestName || '').trim();
  var attend       = data.attend || '';
  var phone        = data.phone || '';
  var guests       = data.guests || '';
  var move         = data.move || '';
  var pickup       = data.pickup || '';
  var companion    = data.companionName || '';
  var pronounHost  = data.pronounHost || '';
  var date         = data.date || '';
  var formName     = data.formName || '';

  var rowIndex = findGuestRow(sheet, pronounGuest, guestName, date);

  var statusText = attend === 'yes' ? STATUS_YES : (attend === 'no' ? STATUS_NO : '');
  var notesText = buildNotes(move, pickup, formName, guestName);
  var guestsCount = attend === 'yes' ? guests : '';

  if (rowIndex > -1) {
    if (statusText) sheet.getRange(rowIndex, COL.rsvp).setValue(statusText);
    if (guestsCount) sheet.getRange(rowIndex, COL.guestsCount).setValue(guestsCount);
    if (phone) sheet.getRange(rowIndex, COL.phone).setValue(phone);
    if (notesText) sheet.getRange(rowIndex, COL.notes).setValue(notesText);
  } else {
    var row = [];
    row[COL.pronounGuest - 1] = pronounGuest;
    row[COL.guestName - 1] = guestName || formName;
    row[COL.group - 1] = '';
    row[COL.date - 1] = date;
    row[COL.companion - 1] = companion;
    row[COL.pronounHost - 1] = pronounHost;
    row[COL.rsvp - 1] = statusText;
    row[COL.link - 1] = '';
    row[COL.guestsCount - 1] = guestsCount;
    row[COL.phone - 1] = phone;
    row[COL.notes - 1] = notesText;
    sheet.appendRow(row);
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function findGuestRow(sheet, pronounGuest, guestName, date) {
  if (!guestName) return -1;
  var lastRow = sheet.getLastRow();
  if (lastRow <= HEADER_ROW) return -1;
  var numRows = lastRow - HEADER_ROW;
  var values = sheet.getRange(HEADER_ROW + 1, 1, numRows, COL.notes).getValues();
  for (var i = 0; i < values.length; i++) {
    var rowPronoun = String(values[i][COL.pronounGuest - 1] || '').trim();
    var rowName = String(values[i][COL.guestName - 1] || '').trim();
    var rowDate = String(values[i][COL.date - 1] || '').trim();
    // Khớp cả 3: xưng hô + tên + ngày mời — tránh nhận nhầm khi trùng tên giữa 2 miền/2 sheet
    if (rowName === guestName && rowPronoun === pronounGuest && rowDate === String(date).trim()) {
      return HEADER_ROW + 1 + i;
    }
  }
  return -1;
}

function buildNotes(move, pickup, formName, guestName) {
  var parts = [];
  if (move === 'shuttle') parts.push('Đi xe chung');
  if (pickup) parts.push('Điểm đón: ' + pickup);
  if (formName && formName !== guestName) parts.push('Tên tự gõ trong form: ' + formName);
  return parts.join(' · ');
}
