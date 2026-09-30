/**
 * Nhận hồi âm (RSVP) từ index.html và ghi thẳng vào sheet "Danh sách khách mời".
 * Dò đúng hàng của khách (khớp Xưng hô + Tên khách) để cập nhật đè — khách gửi
 * lại nhiều lần vẫn ghi vào đúng 1 hàng, không tạo dòng trùng. Không tìm thấy
 * (link không tham số, hoặc khách lạ) thì thêm hàng mới ở cuối.
 *
 * Cài đặt: xem README.md, mục "Nối hồi âm vào Google Sheet".
 */

// Đây là TÊN TAB thật ở dưới cùng màn hình Sheets — khác với tên hiển thị ở
// thanh tím phía trên nếu bạn có dùng tính năng "Table" (Table đặt tên riêng,
// không phải tên tab). Kiểm tra đúng tên tab trước khi deploy.
var SHEET_NAME = 'Sơn';
var HEADER_ROW = 1; // dòng tiêu đề cột

// Thứ tự cột trong sheet — sửa lại số nếu bạn đổi vị trí cột
var COL = {
  pronounGuest: 1,  // A - Xưng hô
  guestName:    2,  // B - Tên khách
  group:        3,  // C - Nhóm
  date:         4,  // D - Ngày mời
  companion:    5,  // E - Đi cùng
  rsvp:         6,  // F - RSVP status
  link:         7,  // G - Link mời (công thức, không đụng vào)
  guestsCount:  8,  // H - Số người đi cùng
  phone:        9,  // I - Số điện thoại
  move:         10, // J - Cách di chuyển (dropdown Tự di chuyển / Đi xe chung)
  notes:        11  // K - Notes
};

// Chỉnh 2 dòng này cho khớp CHÍNH XÁC chữ trong dropdown "RSVP status" của bạn
var STATUS_YES = 'Tham dự';
var STATUS_NO  = 'Từ chối';

// Chỉnh 2 dòng này cho khớp CHÍNH XÁC chữ trong dropdown "Cách di chuyển" của bạn
var MOVE_SELF    = 'Tự di chuyển';
var MOVE_SHUTTLE = 'Đi xe chung';

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
  var date         = data.date || '';
  var formName     = data.formName || '';

  var rowIndex = findGuestRow(sheet, pronounGuest, guestName, date);

  var statusText = attend === 'yes' ? STATUS_YES : (attend === 'no' ? STATUS_NO : '');
  var moveText = move === 'shuttle' ? MOVE_SHUTTLE : (move === 'self' ? MOVE_SELF : '');
  var notesText = buildNotes(pickup, formName, guestName);
  var guestsCount = attend === 'yes' ? guests : '';

  if (rowIndex > -1) {
    if (statusText) sheet.getRange(rowIndex, COL.rsvp).setValue(statusText);
    if (guestsCount) sheet.getRange(rowIndex, COL.guestsCount).setValue(guestsCount);
    if (phone) sheet.getRange(rowIndex, COL.phone).setValue(phone);
    if (moveText) sheet.getRange(rowIndex, COL.move).setValue(moveText);
    if (notesText) sheet.getRange(rowIndex, COL.notes).setValue(notesText);
  } else {
    var row = [];
    row[COL.pronounGuest - 1] = pronounGuest;
    row[COL.guestName - 1] = guestName || formName;
    row[COL.group - 1] = '';
    row[COL.date - 1] = normDate(date);
    row[COL.companion - 1] = companion;
    row[COL.rsvp - 1] = statusText;
    row[COL.link - 1] = '';
    row[COL.guestsCount - 1] = guestsCount;
    row[COL.phone - 1] = phone;
    row[COL.move - 1] = moveText;
    row[COL.notes - 1] = notesText;
    sheet.appendRow(row);
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// "--" là giá trị ô dropdown chưa chọn trong Sheet; thiệp coi "--" là trống và gửi lên chuỗi rỗng
// → so khớp phải coi "--" và ô trống là như nhau, không thì tạo dòng trùng
function norm(v) {
  v = String(v || '').trim();
  return v === '--' ? '' : v;
}
// Ngày mời: thiệp hiểu mọi giá trị khác 28 (kể cả thiếu d trên link) là 21
function normDate(v) {
  return norm(v) === '28' ? '28' : '21';
}

function findGuestRow(sheet, pronounGuest, guestName, date) {
  guestName = norm(guestName); pronounGuest = norm(pronounGuest); date = normDate(date);
  if (!guestName) return -1;
  var lastRow = sheet.getLastRow();
  if (lastRow <= HEADER_ROW) return -1;
  var numRows = lastRow - HEADER_ROW;
  var values = sheet.getRange(HEADER_ROW + 1, 1, numRows, COL.notes).getValues();
  for (var i = 0; i < values.length; i++) {
    var rowPronoun = norm(values[i][COL.pronounGuest - 1]);
    var rowName = norm(values[i][COL.guestName - 1]);
    var rowDate = normDate(values[i][COL.date - 1]);
    // Khớp cả 3: xưng hô + tên + ngày mời — tránh nhận nhầm khi trùng tên giữa 2 miền/2 sheet
    if (rowName === guestName && rowPronoun === pronounGuest && rowDate === date) {
      return HEADER_ROW + 1 + i;
    }
  }
  return -1;
}

function buildNotes(pickup, formName, guestName) {
  var parts = [];
  if (pickup) parts.push('Ghi chú đưa đón: ' + pickup);
  if (formName && formName !== guestName) parts.push('Tên tự gõ trong form: ' + formName);
  return parts.join(' · ');
}
