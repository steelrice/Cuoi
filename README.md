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
| `pronounGuest` | `pg` | `Bạn`, `Anh`, `Chị`, `Cô`, `Chú`… | *(trống)* | Cách xưng hô, chỉ áp dụng bản tiếng Việt. Không truyền thì chỉ hiện tên (không tự thêm "Bạn") — dùng khi `guestName` đã có sẵn xưng hô trong đó, vd `guestName=Chế lớn` |
| `genderEn` | `ge` | `m` hoặc `f` | *(trống)* | `m` → Mr., `f` → Ms., bỏ trống thì không có danh xưng |
| `companionName` | `cn` | tên người đi cùng | *(trống)* | Hiện thành "… và …" |
| `pronounHost` | `ph` | `chúng mình`, `tụi mình`, `em`, `cháu`… | `chúng mình` | Cách cô dâu chú rể tự xưng ở phần xe đưa đón |

Dùng tên viết tắt để link ngắn hơn (khuyên dùng khi tạo link mời hàng loạt); tên đầy đủ vẫn đọc được bình thường, không cần đổi các link cũ đã gửi.

Ví dụ (rút gọn):

```
?d=21&gn=Lan&pg=Chị&ge=f&cn=anh%20Minh
```

Ví dụ (tên đầy đủ, tương đương):

```
?date=21&guestName=Lan&pronounGuest=Chị&genderEn=f&companionName=anh%20Minh
```

Lưu ý: dấu cách trong tham số phải viết thành `%20`.

## Khác nhau giữa hai ngày

| | 21/11 Vũng Tàu | 28/11 Hưng Yên |
|---|---|---|
| Sự kiện | Buổi tiệc chung vui | Lễ thành hôn |
| Giờ | 10 giờ 30 sáng | 9 giờ sáng |
| Địa điểm | Sảnh 2 Merastis Tower | Tư gia nhà trai, QL39A |
| Xe đưa đón | Có | Không |

Phần hỏi cách di chuyển, điểm đón và số điện thoại chỉ hiện với `date=21`.

## Sửa nội dung

Toàn bộ nằm trong `index.html`. Vài mốc để tìm nhanh:

- **Nội dung hai ngày**: tìm `var EVENTS` — chứa toàn bộ chữ nghĩa, giờ giấc, đường dẫn bản đồ của cả hai lễ
- **Khung giờ**: tìm `TIMELINE` — hiện đang cố định, chưa đổi theo ngày
- **Điểm đón**: tìm `rsvpPickup` — hiện là Điểm A, B, C (đánh dấu `TODO` ngay phía trên trong HTML), **bắt buộc thay bằng tên/địa chỉ điểm đón thật trước khi gửi thiệp cho khách**
- **Màu sắc và phông chữ**: tìm `:root` ở đầu phần `<style>`

## Việc còn tồn

- [x] ~~Khung giờ chưa đổi theo ngày, và giờ lễ (11:00) đang vênh với giờ ghi ở đầu thiệp (10 giờ 30)~~ — nay tự tính từ `EVENTS[...].target` theo từng ngày.
- [ ] **Phần hồi âm chưa thật sự gửi đi đâu.** Code đã đấu nối sẵn để ghi thẳng vào sheet "Danh sách khách mời" qua Google Apps Script (xem mục "Nối hồi âm vào Google Sheet" bên dưới), nhưng `APPS_SCRIPT_URL` còn để trống — **bắt buộc triển khai Apps Script rồi điền link Web App thật trước khi gửi thiệp cho khách**, nếu không hồi âm sẽ không tới tay ai cả.
- [ ] Điểm đón còn là Điểm A, B, C — có đánh dấu `TODO` trong `index.html`, cần thay bằng địa điểm thật.
- [x] ~~Chưa có file nhạc nền thật~~ — đã có `audio/bg-music.mp3` (nén còn ~2.7MB, 128kbps để tải nhanh). `preload="auto"` để trình duyệt tải sẵn ngay khi vào trang, tránh khựng lúc bấm mở thiệp.

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
index.html          toàn bộ giao diện và mã xử lý
apps-script/
  rsvp-sync.gs      code Google Apps Script — ghi hồi âm thẳng vào sheet khách mời
audio/
  bg-music.mp3      nhạc nền — placeholder, tự thêm file thật (xem mục "Việc còn tồn")
images/
  album/            ảnh album — xem mục dưới
    01.webp
    02.webp
    ...
  footer.webp       ảnh nền mờ ở chân trang
  story.webp        ảnh phần lời tâm sự
  map-vungtau.webp  bản đồ Merastis
  map-hungyen.webp  bản đồ QL39A
  qr-chu-re.webp    mã QR hiển thị trên trang
  qr-co-dau.webp
  qr-chu-re.png     bản PNG cho nút "Tải mã QR" (app ngân hàng đọc chắc chắn)
  qr-co-dau.png
  icon-gmaps.png    biểu tượng trên nút chỉ đường
```

## Thêm ảnh vào album

Hai bước:

1. Chép ảnh vào `images/album/`, đặt tên theo số thứ tự: `06.webp`, `07.webp`...
2. Thêm tên file vào mảng `ALBUM_FILES` trong `index.html` (tìm dòng `var ALBUM_FILES`), đúng thứ tự muốn hiện:

```js
var ALBUM_FILES = ['01.webp', '02.webp', '03.webp', '04.webp', '05.webp', '06.webp'];
```

Số đếm "01 / 06" tự cập nhật theo độ dài mảng.

Vì sao phải khai báo: trước đây trang tự dò `01, 02, 03...` bằng cách tải thử từng ảnh một, nối đuôi nhau, nên mạng chậm là album hiện rất lâu. Khai báo sẵn thì cả album tải song song. (Để mảng rỗng `[]` thì trang quay về cách tự dò cũ.)

Về dung lượng: ảnh album nên rộng khoảng 800–1000px, định dạng WebP, mỗi ảnh dưới ~110KB. Ảnh đầu tải ngay; các ảnh còn lại tải trước ngay sau khi trang tải xong phần đầu, nên lúc khách kéo tới album thì ảnh đã sẵn. Ảnh nào chưa tải xong sẽ hiện khung vàng có vệt sáng và vòng xoay.
