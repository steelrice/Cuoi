/**
 * Nhận hồi âm (RSVP) từ index.html và ghi thẳng vào tab của từng bên (Sơn / Thảo).
 * Dò đúng hàng của khách (khớp Xưng hô + Tên khách + Ngày mời) để cập nhật đè — khách gửi
 * lại nhiều lần vẫn ghi vào đúng 1 hàng, không tạo dòng trùng. Không tìm thấy
 * (link không tham số, hoặc khách lạ) thì thêm hàng mới ở cuối.
 *
 * Cài đặt: xem README.md, mục "Nối hồi âm vào Google Sheet".
 */

// Đây là TÊN TAB thật ở dưới cùng màn hình Sheets — khác với tên hiển thị ở
// thanh tím phía trên nếu bạn có dùng tính năng "Table" (Table đặt tên riêng,
// không phải tên tab). Kiểm tra đúng tên tab trước khi deploy.
var SHEET_NAME = 'Sơn';
// Mỗi bên một tab, cùng thứ tự cột. Tham số s trên link: 1 = bên Sơn, 2 = bên Thảo;
// không có s (link cũ) hoặc giá trị lạ → tab SHEET_NAME ở trên (Sơn)
var SIDE_SHEETS = { '1': 'Sơn', '2': 'Thảo' };
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
  // thiệp gửi "mù" (no-cors) nên không biết Apps Script có lỗi hay không → ở đây phải tự chống lỗi:
  // khoá để 2 hồi âm cùng lúc không ghi chồng / tạo dòng trùng, lỗi thì vẫn trả về JSON
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    handleRsvp((e && e.parameter) || {});
    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function handleRsvp(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var side = norm(data.side);
  // chưa có tab của bên đó (vd chưa tạo tab 'Thảo') thì ghi vào tab mặc định, không để mất hồi âm
  var sheet = ss.getSheetByName(SIDE_SHEETS[side] || SHEET_NAME) || ss.getSheetByName(SHEET_NAME);

  var pronounGuest = (data.pronounGuest || '').trim();
  var guestName    = (data.guestName || '').trim();
  var attend       = data.attend || '';
  var phone        = (data.phone || '').trim();
  var move         = data.move || '';
  var pickup       = data.pickup || '';
  var companion    = data.companionName || '';
  var date         = data.date || '';
  var formName     = (data.formName || '').trim();

  var yes = attend === 'yes', no = attend === 'no';
  var statusText = yes ? STATUS_YES : (no ? STATUS_NO : '');
  var moveText = move === 'shuttle' ? MOVE_SHUTTLE : (move === 'self' ? MOVE_SELF : '');
  var notesText = buildNotes(pickup, formName, guestName);
  // số người đi cùng: ghi cả 0; khách từ chối thì để trống
  var guestsCount = yes && data.guests !== undefined && data.guests !== '' ? Number(data.guests) : '';
  // dấu ' ở đầu để Sheets giữ nguyên số 0 đầu của số điện thoại (0901… không thành 901…)
  var phoneText = phone ? "'" + phone : '';

  var rowIndex = findGuestRow(sheet, pronounGuest, guestName, date);

  if (rowIndex > -1) {
    if (statusText) sheet.getRange(rowIndex, COL.rsvp).setValue(statusText);
    if (yes) {
      sheet.getRange(rowIndex, COL.guestsCount).setValue(guestsCount);
      if (moveText) sheet.getRange(rowIndex, COL.move).setValue(moveText);
    } else if (no) {
      // đổi ý từ "có mặt" sang "không đến được" → xoá số người + cách đi cũ cho khỏi nhầm
      sheet.getRange(rowIndex, COL.guestsCount).setValue('');
      sheet.getRange(rowIndex, COL.move).setValue('');
    }
    if (phoneText) sheet.getRange(rowIndex, COL.phone).setValue(phoneText);
    if (notesText) sheet.getRange(rowIndex, COL.notes).setValue(asText(notesText));
  } else {
    var row = [];
    for (var c = 0; c < COL.notes; c++) row[c] = '';
    row[COL.pronounGuest - 1] = asText(pronounGuest);
    row[COL.guestName - 1] = asText(guestName || formName);
    row[COL.date - 1] = normDate(date);
    row[COL.companion - 1] = asText(companion);
    row[COL.rsvp - 1] = statusText;
    row[COL.guestsCount - 1] = guestsCount;
    row[COL.phone - 1] = phoneText;
    row[COL.move - 1] = yes ? moveText : '';
    row[COL.notes - 1] = asText(notesText);
    sheet.appendRow(row);
  }
}

// chữ khách gõ / trên link mà bắt đầu bằng = + - @ thì Sheets hiểu là công thức (vd =IMPORTXML(...) có thể
// gửi dữ liệu trong Sheet ra ngoài) → thêm dấu ' ở đầu để Sheets giữ nguyên là chữ (dấu ' không hiện trong ô)
function asText(v) {
  v = String(v || '');
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
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
  if (pickup) parts.push(pickup);   // ghi nguyên nội dung khách gõ, không thêm tiền tố
  // link có tên mà tên gõ trong form khác đi thì ghi chú lại; link không tên thì tên gõ đã nằm ở cột Tên khách
  if (guestName && formName && formName !== guestName) parts.push('Tên tự gõ trong form: ' + formName);
  return parts.join(' · ');
}
