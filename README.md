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
- **Điểm đón**: tìm `rsvpPickup` — hiện là Điểm A, B, C, cần thay bằng địa điểm thật
- **Màu sắc và phông chữ**: tìm `:root` ở đầu phần `<style>`

## Việc còn tồn

- [ ] **Phần hồi âm chưa gửi dữ liệu đi đâu cả.** Hiện chỉ lưu tạm trên máy khách, chủ thiệp không nhận được gì. Cần đấu nối Google Form, Formspree hoặc dịch vụ tương tự trước khi gửi thiệp cho khách.
- [ ] Khung giờ chưa đổi theo ngày, và giờ lễ (11:00) đang vênh với giờ ghi ở đầu thiệp (10 giờ 30)
- [ ] Điểm đón còn là Điểm A, B, C
- [ ] Chưa có nhạc nền

## Cấu trúc

```
index.html          toàn bộ giao diện và mã xử lý
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
