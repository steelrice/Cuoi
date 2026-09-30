# Thiệp cưới Hoàng Sơn & Phương Thảo

Thiệp cưới dạng trang web tĩnh, một trang, hai ngôn ngữ Việt/Anh.

## Đưa lên GitHub Pages

1. Tạo repo mới trên GitHub (để chế độ Public)
2. Đẩy toàn bộ thư mục này lên nhánh `main`
3. Vào **Settings → Pages**, phần Source chọn **Deploy from a branch**, chọn nhánh `main` và thư mục `/ (root)`
4. Đợi khoảng 1–2 phút, trang sẽ chạy ở `https://<tên-tài-khoản>.github.io/<tên-repo>/`

Mỗi lần đẩy thay đổi lên `main`, trang tự cập nhật sau vài chục giây.

## Tham số trên đường dẫn

Gắn vào sau đường dẫn để cá nhân hoá từng khách.

| Tham số | Viết tắt | Giá trị | Mặc định | Tác dụng |
|---|---|---|---|---|
| `date` | `d` | `21` hoặc `28` | `21` | `21` = tiệc Vũng Tàu, `28` = lễ Hưng Yên |
| `guestName` | `gn` | tên khách | *(trống)* | Không truyền thì hiện "Quý khách" |
| `pronounGuest` | `pg` | `Bạn`, `Anh`, `Chị`, `Cô`, `Chú`… | *(trống)* | Cách xưng hô, chỉ áp dụng bản tiếng Việt. Không truyền thì mọi chỗ chỉ gọi đúng tên (không tự thêm "bạn"; link không có cả tên thì gọi "bạn") — dùng khi `guestName` đã có sẵn xưng hô trong đó, vd `guestName=Chế lớn` |
| `genderEn` | `ge` | `m` hoặc `f` | *(trống)* | `m` → Mr., `f` → Ms., bỏ trống thì không có danh xưng |
| `companionName` | `cn` | tên người đi cùng | *(trống)* | Hiện thành "… và …" (bỏ qua khi `pg` là "Gia đình"). Chữ đầu là xưng hô / từ chung (anh, chị, gia đình, vợ…) thì tự viết thường, còn lại giữ nguyên như link (vd `Anh Minh` → "và anh Minh", `Minh` → "và Minh") |
| `pronounHost` | `ph` | `chúng mình`, `tụi mình`, `em`, `cháu`… | *(trống)* | **Không còn hiện trên thiệp** (các câu đã viết cố định "cô dâu chú rể" / "Sơn và Thảo"). Chỉ gửi kèm hồi âm, ghi vào cột F khi khách chưa có hàng trong Sheet. Link cũ có `ph` vẫn mở bình thường |
| `lang` | `l` | `vi` hoặc `en` | `vi` | Ngôn ngữ lúc mở thiệp. Khách vẫn đổi được bằng nút lá cờ ở bìa |
| `side` | `s` | `1` hoặc `2` | `1` | Khách bên nào: `1` = bên Sơn → hồi âm ghi vào tab "Sơn", `2` = bên Thảo → tab "Thảo"; không truyền = bên Sơn. Không hiện gì trên thiệp |

Dùng tên viết tắt để link ngắn hơn (khuyên dùng khi tạo link mời hàng loạt); tên đầy đủ vẫn đọc được bình thường, không cần đổi các link cũ đã gửi.

Ví dụ (rút gọn):

```
?d=21&pg=Chị&gn=Lan&ge=f&cn=anh_Minh
```

Ví dụ (tên đầy đủ, tương đương):

```
?date=21&pronounGuest=Chị&guestName=Lan&genderEn=f&companionName=anh_Minh
```

Lưu ý: dấu cách trong tham số viết thành `_` (vd `gn=Loan_Trường`) — thiệp tự đổi lại thành dấu cách; `%20` kiểu cũ vẫn đọc được. Ký tự `%`, `&`, `#`, `+` trong tên phải mã hoá (`%25`, `%26`, `%23`, `%2B`) — công thức cột H trong Sheet đã làm sẵn. Nên copy link từ ô trong Sheet: copy từ thanh địa chỉ trình duyệt thì chữ có dấu bị đổi thành dạng `%C4%91…` khó nhìn.

### Mã viết tắt cho `pg` và `cn`

Để link ngắn và không dấu, `pg` và `cn` nhận mã thay cho chữ (vd `?d=21&pg=chi&gn=Trinh&cn=gd`). Chữ đầy đủ vẫn đọc được như cũ — giá trị không có trong bảng thì thiệp dùng nguyên chữ.

| Chữ | Mã | | Chữ | Mã |
|---|---|---|---|---|
| Anh | `anh` | | Cô | `co` |
| Chị | `chi` | | Chú | `chu` |
| Em | `em` | | Bác | `bac` |
| Bạn | `ban` | | Dì | `di` |
| Chế | `che` | | Cậu | `cau` |
| Gia đình | `gd` | | Mợ | `mo` |
| Người thương | `nt` (chỉ `cn`) | | Ông | `ong` |
| Vợ | `vo` (chỉ `cn`) | | Bà | `ba` |
| Chồng | `chong` (chỉ `cn`) | | Các con | `con` (chỉ `cn`) |

Bảng nằm ở `PARAM_CODES` trong `index.html`; trong Sheet là tab **"Mã"** (cột A chữ, cột B mã) để công thức cột H tra. **Không đổi hay xoá mã đã dùng** (link đã gửi sẽ hiện sai) — chỉ thêm mã mới, và thêm cả ở `PARAM_CODES` lẫn tab "Mã". Chữ chưa có mã thì cứ để Sheet gửi nguyên chữ.

## Khác nhau giữa hai ngày

| | 21/11 Vũng Tàu | 28/11 Hưng Yên |
|---|---|---|
| Sự kiện | Buổi tiệc chung vui | Lễ thành hôn |
| Giờ | 10 giờ 30 sáng | 9 giờ sáng |
| Địa điểm | Sảnh 2 Merastis Tower | Tư gia nhà trai, QL39A |
| Xe đưa đón | Có | Không |

Phần hỏi cách di chuyển, ghi chú đưa đón và số điện thoại chỉ hiện với `date=21`.

## Sửa nội dung

Toàn bộ nằm trong `index.html`. Vài mốc để tìm nhanh:

- **Nội dung hai ngày**: tìm `var EVENTS` — chứa toàn bộ chữ nghĩa, giờ giấc, đường dẫn bản đồ của cả hai lễ
- **Khung giờ**: tìm `TIMELINE` — hiện đang cố định, chưa đổi theo ngày
- **Ghi chú đưa đón**: tìm `rsvpPickup` — ô ghi chú tự do (hiện khi khách chọn xe đưa đón), cô dâu chú rể liên hệ lại để hẹn điểm đón. Vẫn gửi lên Apps Script dưới tên trường `pickup`
- **Màu sắc và phông chữ**: tìm `:root` ở đầu phần `<style>`

## Việc còn tồn

- [x] ~~Khung giờ chưa đổi theo ngày, và giờ lễ (11:00) đang vênh với giờ ghi ở đầu thiệp (10 giờ 30)~~ — nay tự tính từ `EVENTS[...].target` theo từng ngày.
- [x] ~~Phần hồi âm chưa thật sự gửi đi đâu~~ — đã triển khai Apps Script và điền `APPS_SCRIPT_URL`; hồi âm ghi thẳng vào sheet "Danh sách khách mời".
- [x] ~~Điểm đón còn là Điểm A, B, C~~ — nay là ô ghi chú tự do, cô dâu chú rể liên hệ lại để hẹn điểm đón.
- [x] ~~Chưa có file nhạc nền thật~~ — đã có 2 bài `audio/dam-cuoi-nhu-mo.mp3` (~1.9MB) và `audio/trai-tai-gai-sac.mp3` (~1.5MB): mỗi lần mở thiệp bốc ngẫu nhiên bài đầu, hết bài nối sang bài kia; còn ~20s hết bài mới tải trước bài kế. `preload="none"` để không giành băng thông với ảnh/font lúc vào trang; chạm mở thiệp mới bắt đầu tải + phát. Trình duyệt chỉ cho phát nhạc có tiếng sau cử chỉ thật (chạm/bấm/gõ phím — lăn chuột không tính), nên nếu bị chặn thì cạnh đĩa nhạc hiện "♪ Bấm để bật nhạc".

## Câu hỏi mở — cần bàn thêm

- **Ăn cỗ chiều 27 (hôm trước lễ 28)**: theo phong tục, nhiều đám cưới ngày lễ chính 28 lại có bữa ăn cỗ vào chiều hôm trước (27). Trang hiện chưa có thông tin gì về bữa này. Cần xác định trước khi làm:
  - Bữa chiều 27 là bữa chính, đa số khách tới ăn hôm đó (lễ 9h sáng 28 chỉ là lễ gia tiên/rước dâu riêng cho gia đình gần)? → nếu vậy cần đổi trọng tâm hiển thị cho khách mời ngày 28: giờ/địa điểm chính nên là chiều 27, lễ sáng 28 chỉ ghi chú thêm.
  - Hay bữa chiều 27 chỉ là bữa nhỏ thân mật (họ hàng/hàng xóm), khách mời chính vẫn tới dự lễ 9h sáng 28 như hiện tại? → nếu vậy chỉ cần thêm 1 dòng ghi chú nhỏ trong trang ngày 28, không đổi cấu trúc.
  - Chưa quyết định phương án nào — để đây bàn tiếp trước khi sửa `index.html`.

## Nối hồi âm vào Google Sheet

Hồi âm không tạo dòng mới lung tung — trang gửi kèm `pronounGuest`+`guestName` lấy từ URL, Apps Script dò đúng hàng của khách đó trong sheet "Danh sách khách mời" để **cập nhật đè** (RSVP status, số điện thoại, ghi chú). Khách gửi lại nhiều lần vẫn ghi vào đúng 1 hàng. Khách không khớp được hàng nào (link không tham số, hoặc lạ) thì tự thêm hàng mới ở cuối.

Cài đặt:

1. Mở Google Sheet chứa danh sách khách mời → menu **Extensions → Apps Script**.
2. Xoá nội dung mặc định, dán toàn bộ nội dung file [`apps-script/rsvp-sync.gs`](apps-script/rsvp-sync.gs) trong repo này vào.
3. Kiểm tra khối `COL` ở đầu file khớp đúng thứ tự cột thật trong sheet của bạn (A=Xưng hô, B=Tên khách... theo đúng sheet hiện tại thì không cần sửa gì).
4. Sửa `STATUS_YES`/`STATUS_NO` cho khớp **chính xác** chữ trong dropdown "RSVP status" của bạn (vd "Đã xác nhận"/"Từ chối") — sai chữ thì dropdown sẽ không nhận diện được giá trị ghi vào.
5. Bấm **Deploy → New deployment** → chọn loại **Web app** → Execute as: **Me**, Who has access: **Anyone** → Deploy. Lần đầu Google sẽ hỏi cấp quyền cho script, đồng ý hết.
6. Copy URL kết thúc bằng `/exec`.
7. Trong `index.html`, tìm `APPS_SCRIPT_URL` (gần đầu phần xử lý hồi âm), dán URL vào.
8. Gửi thử một hồi âm trên trang, kiểm tra đúng hàng của khách đó trong sheet có cập nhật RSVP status/số điện thoại không.

Mỗi lần sửa lại code Apps Script phải **Deploy → Manage deployments → sửa (bút chì) → Version: New version → Deploy** thì thay đổi mới có hiệu lực — sửa code không tự áp dụng vào URL `/exec` đang chạy.

Muốn dùng Google Form/Formspree thay vì ghi thẳng vào Sheet thì thay nội dung hàm `sendRsvpToSheet` trong `index.html` bằng lệnh gọi tới dịch vụ đó.

## Cấu trúc

```
index.html            toàn bộ giao diện và mã xử lý
apps-script/
  rsvp-sync.gs        code Google Apps Script — ghi hồi âm thẳng vào sheet khách mời
audio/
  dam-cuoi-nhu-mo.mp3 nhạc nền (2 bài, bốc ngẫu nhiên bài đầu rồi phát luân phiên)
  trai-tai-gai-sac.mp3
cal/                  file .ics cho nút "Lưu vào lịch" trên iPhone (21/28 × vi/en)
fonts/                font tự host (woff2)
images/
  save-the-date.webp  ảnh lớn đầu tiên sau khi mở thiệp
  story.webp          ảnh câu chuyện (khung ảnh sau đoạn ống kính)
  story-hd.webp       bản nét của ảnh câu chuyện, dùng cho đoạn ống kính zoom vào mặt
  dress.webp          ảnh phần gợi ý trang phục
  ring-groom.webp     nhẫn chú rể / cô dâu (ảnh tách nền) — hiệu ứng "tơ hồng se duyên"
  ring-bride.webp
  book/               album dạng sách lật trang — xem mục dưới
    cover.webp        bìa album
    p01.webp … p10.webp   mỗi file là 1 trang đôi (ảnh nhẹ, hiện trong thiệp)
    hd/p01.webp …     bản nét 2000px, chỉ tải khi khách bấm "Phóng to ảnh"
  footer.webp         ảnh nền mờ ở chân trang
  og.jpg              ảnh xem trước 1200×630 khi dán link vào Zalo / Messenger / Facebook (thẻ og: ở đầu index.html)
  paper.webp, torn-edge.webp   nền giấy, mép giấy xé
  map-vungtau.webp    bản đồ Merastis
  map-hungyen.webp    bản đồ QL39A
  qr-chu-re.svg       mã QR hiển thị trên trang (vẽ lại từ nội dung VietQR gốc, mức sửa lỗi H)
  qr-co-dau.svg
  bank-acb.webp       logo ngân hàng trên thẻ QR
  bank-vcb.webp
  qr-chu-re.png       bản PNG gốc của ngân hàng cho nút "Tải mã QR"
  qr-co-dau.png
  icon-gmaps.png      biểu tượng trên nút chỉ đường
```

## Thêm / đổi trang album

Album là cuốn sách lật trang, mỗi trang là 1 ảnh trang đôi (ngang, tỉ lệ 4:3):

1. Ảnh nhẹ: rộng 1400px, WebP, chép vào `images/book/` (vd `p11.webp`).
2. Ảnh nét: rộng 2000px, WebP, cùng tên, chép vào `images/book/hd/`.
3. Thêm tên file vào mảng `BOOK_PAGES` trong `index.html`, đúng thứ tự muốn hiện:

```js
var BOOK_PAGES = ['p01.webp', 'p02.webp', /* … */ 'p11.webp'];
```

Số trang và trang cuối "Còn tiếp…" tự cập nhật theo độ dài mảng. Ảnh nét chỉ tải khi khách mở xem lớn (trang đang xem trước, rồi các trang kế bên), có vòng tải vàng nếu chậm.
