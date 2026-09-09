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

| Tham số | Giá trị | Mặc định | Tác dụng |
|---|---|---|---|
| `date` | `21` hoặc `28` | `21` | `21` = tiệc Vũng Tàu, `28` = lễ Hưng Yên |
| `guestName` | tên khách | *(trống)* | Không truyền thì hiện "Quý khách" |
| `pronounGuest` | `Bạn`, `Anh`, `Chị`, `Cô`, `Chú`… | `Bạn` | Cách xưng hô, chỉ áp dụng bản tiếng Việt |
| `genderEn` | `m` hoặc `f` | *(trống)* | `m` → Mr., `f` → Ms., bỏ trống thì không có danh xưng |
| `companionName` | tên người đi cùng | *(trống)* | Hiện thành "… và …" |
| `pronounHost` | `chúng mình`, `tụi mình`, `em`, `cháu`… | `chúng mình` | Cách cô dâu chú rể tự xưng ở phần xe đưa đón |

Ví dụ:

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
- [ ] **Phần hồi âm chưa thật sự gửi đi đâu.** Code đã đấu nối sẵn tới Google Form (xem mục "Nối hồi âm vào Google Form" bên dưới), nhưng `RSVP_CONFIG` còn để trống — **bắt buộc điền link Form + entry ID thật trước khi gửi thiệp cho khách**, nếu không hồi âm sẽ không tới tay ai cả.
- [ ] Điểm đón còn là Điểm A, B, C — có đánh dấu `TODO` trong `index.html`, cần thay bằng địa điểm thật.
- [ ] Chưa có file nhạc nền thật. Khung phát nhạc (nút bật/tắt, thẻ `<audio>`) đã có sẵn, trỏ tới `audio/bg-music.mp3` — chỉ cần thả file nhạc (đã xin phép bản quyền) vào đúng đường dẫn đó, không cần sửa `index.html`.

## Nối hồi âm vào Google Form

1. Tạo một Google Form với các câu hỏi tương ứng: họ tên, tham dự hay không, số người, cách di chuyển, điểm đón, số điện thoại.
2. Mở form ở chế độ xem trước, bấm **⋮ → Nhận liên kết được điền sẵn (Get pre-filled link)**, điền tạm mỗi ô một giá trị rồi bấm **Nhận liên kết**.
3. Liên kết trả về có dạng `...?entry.111111111=...&entry.222222222=...` — mỗi `entry.xxxxxxxxx` ứng với một câu hỏi theo đúng thứ tự bạn đã điền, ghi lại từng cặp.
4. Lấy URL nộp form: mở form thật (không phải link rút gọn), copy đường dẫn, đổi đuôi `/viewform` thành `/formResponse`.
5. Trong `index.html`, tìm `RSVP_CONFIG` (gần đầu phần xử lý hồi âm), điền:
   - `googleFormAction`: URL `/formResponse` ở bước 4
   - từng `fields.*`: entry ID tương ứng ở bước 3
6. Gửi thử một hồi âm trên trang, kiểm tra có xuất hiện dòng mới trong Google Sheet liên kết với Form không.

Muốn dùng Formspree hoặc dịch vụ khác thay vì Google Form thì thay nội dung hàm `sendRsvpToGoogleForm` trong `index.html` bằng lệnh gọi tới dịch vụ đó.

## Cấu trúc

```
index.html          toàn bộ giao diện và mã xử lý
audio/
  bg-music.mp3      nhạc nền — placeholder, tự thêm file thật (xem mục "Việc còn tồn")
images/
  album/            ảnh album — xem mục dưới
    01.jpg
    02.jpg
    ...
  hero.jpg          ảnh trang đầu
  story.jpg         ảnh phần lời tâm sự
  map-vungtau.jpg   bản đồ Merastis
  map-hungyen.jpg   bản đồ QL39A
  qr-chu-re.png     mã QR chuyển khoản
  qr-co-dau.png
  icon-gmaps.png    biểu tượng trên nút chỉ đường
```

## Thêm ảnh vào album

Thả ảnh vào `images/album/` và đặt tên theo số thứ tự hai chữ số:

```
01.jpg  02.jpg  03.jpg  04.jpg ...
```

Không phải sửa `index.html`. Trang tự dò từ `01` trở đi và dừng khi gặp số không tồn tại.

Ba điều cần nhớ:

- **Tên phải liên tục.** Có `01, 02, 04` thì trang chỉ nhận `01, 02` rồi dừng ở `03`.
- **Đuôi file** chấp nhận `.jpg`, `.jpeg`, `.png`, `.webp`.
- **Tối đa 60 ảnh.** Muốn hơn thì sửa `ALBUM_MAX` trong `index.html`.

Về dung lượng: ảnh album hiển thị rộng khoảng 1000px trên iPhone Pro Max, nên ảnh khoảng 1000–1200px bề ngang là đủ nét. Mỗi ảnh nên dưới 150KB. Ảnh chỉ tải khi khách cuộn tới nên nhiều ảnh không làm chậm lúc mở thiệp, nhưng vẫn tốn dung lượng mạng của khách.

Ảnh trang đầu được ưu tiên tải trước, các ảnh còn lại chỉ tải khi cuộn tới.
