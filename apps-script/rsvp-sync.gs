/**
 * Nhận hồi âm (RSVP) từ index.html và ghi thẳng vào tab của từng bên (Sơn / Thảo).
 * Dò đúng hàng của khách (khớp Xưng hô + Tên khách + Ngày mời) để cập nhật đè — khách gửi
 * lại nhiều lần vẫn ghi vào đúng 1 hàng, không tạo dòng trùng. Không tìm thấy
 * (link không tham số, hoặc khách lạ) thì thêm hàng mới ở cuối (ngay trên dòng "Tổng số" nếu có).
 *
 * Cột I "SĐT + Notes": mỗi loại 1 dòng — "SĐT: 0912 123 123" rồi "Note: …" (ghi chú khách gõ trong hồi âm).
 * Cột K "Logs": dòng theo dõi khách mở thiệp / dùng hộp quà mừng (action=track) "▸ …". Không tìm thấy hàng thì bỏ qua.
 * Lỗi: dòng "⚠ …" trong ô Logs của đúng khách, kèm toàn bộ dữ liệu khách gửi (hồi âm không bị mất). Không tìm được
 * hàng khách (vd link có tên mà lệch với Sheet) thì thêm 1 dòng mới cuối tab — lần mở sau khớp dòng đó nên không lặp.
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
  phone:        9,  // I - SĐT + Notes (dòng "SĐT: …" + dòng "Note: …")
  move:         10, // J - Cách di chuyển (dropdown Tự di chuyển / Đi xe chung)
  notes:        11  // K - Logs (dòng theo dõi "▸ …"; Apps Script tìm theo số cột, tên tiêu đề đặt gì cũng được)
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
  var data = (e && e.parameter) || {};
  try {
    if (data.action === 'track') {
      // theo dõi chỉ chờ tối đa 5 giây, quá thì bỏ — không bắt hồi âm phải xếp hàng chờ sau cả loạt lượt mở thiệp
      if (!lock.tryLock(5000)) return json({ ok: false, error: 'busy' });
      handleTrack(data);
    } else {
      lock.waitLock(20000);
      handleRsvp(data);
    }
    return json({ ok: true });
  } catch (err) {
    console.error(err);
    logIssue(data.action === 'track' ? 'Track error' : 'RSVP error', data, String(err && err.message || err));
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
    if (phone || notesText) {
      // chỉ thay phần khách vừa gửi (SĐT hoặc Note), phần còn lại giữ như cũ
      var cell = sheet.getRange(rowIndex, COL.phone), old = splitContact(cell.getValue());
      cell.setValue(asText(contactText(phone || old.phone, notesText || old.note)));
    }
  } else {
    var row = [];
    for (var c = 0; c < COL.notes; c++) row[c] = '';
    row[COL.pronounGuest - 1] = asText(pronounGuest);
    row[COL.guestName - 1] = asText(guestName || formName);
    row[COL.date - 1] = normDate(date);
    row[COL.companion - 1] = asText(companion);
    row[COL.rsvp - 1] = statusText;
    row[COL.guestsCount - 1] = guestsCount;
    row[COL.phone - 1] = asText(contactText(phone, notesText));
    row[COL.move - 1] = yes ? moveText : '';
    addGuestRow(sheet, row);
  }
}

// chữ khách gõ / trên link mà bắt đầu bằng = + - @ thì Sheets hiểu là công thức (vd =IMPORTXML(...) có thể
// gửi dữ liệu trong Sheet ra ngoài) → thêm dấu ' ở đầu để Sheets giữ nguyên là chữ (dấu ' không hiện trong ô)
function asText(v) {
  v = String(v || '');
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

/* ---- theo dõi mở thiệp + hộp quà mừng ----
   Thiệp gửi action=track, ev = open | copy | qr, who = groom | bride (với copy, qr). Chỉ mở hộp quà xem thì không ghi
   (khách tò mò mở xem là chuyện thường). Dòng theo dõi viết bằng tiếng Anh cho gọn, luôn viết lại theo đúng 1 mẫu:
   ▸ Opens: 3 (last 12.11 20:15) · Copy: Groom · QR: Bride, Groom
   (vẫn đọc được dòng tiếng Việt cũ "Mở thiệp 3 lần (gần nhất …) · Chép STK Chú rể · Tải QR Cô dâu" để cộng tiếp) */
var TRACK_MARK = '▸';
var TRACK_KINDS = { copy: ['Copy', 'Chép STK'], qr: ['QR', 'Tải QR'] };
var TRACK_WHO = { groom: ['Groom', 'Chú rể'], bride: ['Bride', 'Cô dâu'] };

function handleTrack(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SIDE_SHEETS[norm(data.side)] || SHEET_NAME) || ss.getSheetByName(SHEET_NAME);
  var rowIndex = findGuestRow(sheet, (data.pronounGuest || '').trim(), (data.guestName || '').trim(), data.date || '');
  if (rowIndex < 0) {   // link không tên: bỏ qua; link có tên mà lệch: logIssue thêm 1 dòng ⚠ để sửa
    if (data.ev === 'open' && norm(data.guestName)) logIssue('Name mismatch', data, 'no matching row, row auto-added');
    return;
  }
  var ev = String(data.ev || ''), who = String(data.who || '');
  if (ev !== 'open' && !(TRACK_KINDS[ev] && TRACK_WHO[who])) return;
  var now = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd.MM HH:mm');

  var cell = sheet.getRange(rowIndex, COL.notes);
  var parts = splitNotes(cell.getValue()), t = parts.track;
  var m, opens = (m = t.match(/Opens: (\d+)|Mở thiệp (\d+) lần/)) ? Number(m[1] || m[2]) : 0;
  var lastOpen = (m = t.match(/\((?:last|gần nhất) ([^)]+)\)/)) ? m[1] : '';
  var done = {};
  Object.keys(TRACK_KINDS).forEach(function (k) {
    var en = t.match(new RegExp('(?:^|· )' + TRACK_KINDS[k][0] + ': ([^·]*)'));
    done[k] = {};
    Object.keys(TRACK_WHO).forEach(function (w) {
      done[k][w] = !!(en && en[1].indexOf(TRACK_WHO[w][0]) >= 0) || t.indexOf(TRACK_KINDS[k][1] + ' ' + TRACK_WHO[w][1]) >= 0;
    });
  });

  if (ev === 'open') { opens++; lastOpen = now; } else done[ev][who] = true;

  var out = [];
  if (opens) out.push('Opens: ' + opens + (lastOpen ? ' (last ' + lastOpen + ')' : ''));
  Object.keys(TRACK_KINDS).forEach(function (k) {
    var ws = Object.keys(TRACK_WHO).filter(function (w) { return done[k][w]; }).map(function (w) { return TRACK_WHO[w][0]; });
    if (ws.length) out.push(TRACK_KINDS[k][0] + ': ' + ws.join(', '));
  });
  var line = TRACK_MARK + ' ' + out.join(' · ');
  cell.setValue(asText(parts.rsvp ? parts.rsvp + '\n' + line : line));
}

/* ô "SĐT + Notes": "SĐT: …" dòng đầu, "Note: …" ngay dưới (ghi chú nhiều dòng thì giữ nguyên các dòng) */
function contactText(phone, note) {
  var out = [];
  if (phone) out.push('SĐT: ' + phone);
  if (note) out.push('Note: ' + note);
  return out.join('\n');
}
// đọc lại ô cũ; ô cũ chỉ có số điện thoại trần (hồi âm gửi trước khi đổi mẫu) thì coi là SĐT
function splitContact(v) {
  v = String(v || '').trim();
  var m = v.match(/^SĐT:\s*([^\n]*)/m), n = v.match(/(^|\n)Note:\s*([\s\S]*)$/);
  if (!m && !n) return /^[+0-9 .()-]+$/.test(v) ? { phone: v, note: '' } : { phone: '', note: v };
  return { phone: m ? m[1].trim() : '', note: n ? n[2].trim() : '' };
}

// tách ô Logs: chữ cũ đã có trong ô (giữ nguyên ở trên) và dòng theo dõi "▸ …" (dưới cùng)
function splitNotes(v) {
  var lines = String(v || '').split('\n'), track = '';
  lines = lines.filter(function (l) { if (l.indexOf(TRACK_MARK) === 0) { track = l; return false; } return true; });
  return { rsvp: lines.join('\n').trim(), track: track };
}

/* thêm 1 dòng khách mới: dòng cuối là "Tổng số…" thì chèn ngay phía trên nó (dòng mới lấy định dạng + dropdown của dòng
   khách phía trên), không thì thêm ở cuối. Không ghi vào cột G (Link mời — công thức ARRAYFORMULA, ghi vào là vỡ) */
function addGuestRow(sheet, row) {
  var last = sheet.getLastRow(), at = last + 1;
  var first = String(sheet.getRange(last, 1).getValue()).trim().toLowerCase();
  if (last > HEADER_ROW + 1 && first.indexOf('tổng') === 0) { sheet.insertRowAfter(last - 1); at = last; }
  sheet.getRange(at, 1, 1, COL.link - 1).setValues([row.slice(0, COL.link - 1)]);
  sheet.getRange(at, COL.link + 1, 1, COL.notes - COL.link).setValues([row.slice(COL.link, COL.notes)]);
}

/* ---- ghi lỗi: dòng "⚠ dd.MM HH:mm Loại: lỗi · Data: …" (tiếng Anh như dòng ▸) trong ô Logs của đúng khách (trên dòng ▸).
   Không tìm được hàng thì thêm 1 dòng mới cuối tab (xưng hô, tên, ngày, đi cùng theo link + dòng ⚠ ở Logs).
   Tự bọc try: ghi lỗi hỏng cũng không làm hỏng việc chính */
function logIssue(kind, data, msg) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SIDE_SHEETS[norm(data.side)] || SHEET_NAME) || ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    var sent = Object.keys(data).filter(function (k) { return k !== 'action'; })
      .map(function (k) { return k + '=' + data[k]; }).join(', ');
    var warn = '⚠ ' + Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd.MM HH:mm') + ' ' + kind + ': ' + msg + (sent ? ' · Data: ' + sent : '');
    var rowIndex = findGuestRow(sheet, (data.pronounGuest || '').trim(), (data.guestName || '').trim(), data.date || '');
    if (rowIndex > -1) {
      var cell = sheet.getRange(rowIndex, COL.notes), parts = splitNotes(cell.getValue());
      var top = parts.rsvp ? parts.rsvp + '\n' + warn : warn;
      cell.setValue(asText(parts.track ? top + '\n' + parts.track : top));
    } else {
      var row = [];
      for (var c = 0; c < COL.notes; c++) row[c] = '';
      row[COL.pronounGuest - 1] = asText(norm(data.pronounGuest));
      row[COL.guestName - 1] = asText(norm(data.guestName) || norm(data.formName));
      row[COL.date - 1] = normDate(data.date);
      row[COL.companion - 1] = asText(norm(data.companionName));
      row[COL.notes - 1] = asText(warn);
      addGuestRow(sheet, row);
    }
  } catch (e) { console.error('logIssue', e); }
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
