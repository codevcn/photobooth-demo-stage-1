# Tính năng Print Area Detection

## Tổng quan
Tính năng này cho phép nhận diện vùng có thể edit (drag, rotate, zoom) với dữ liệu từ API và hiển thị cảnh báo khi elements lệch ra khỏi vùng in.

## Cách hoạt động

### 1. Dữ liệu sản phẩm được mở rộng
Mỗi sản phẩm giờ có thêm thông tin về vùng in:
```typescript
type TProductImage = {
  // ... existing fields
  print_x?: number  // Tọa độ X vùng in (%)
  print_y?: number  // Tọa độ Y vùng in (%)
  print_w?: number  // Chiều rộng vùng in (%)
  print_h?: number  // Chiều cao vùng in (%)
}
```

### 2. Hook usePrintArea
Hook chính quản lý logic vùng in:
- **updatePrintArea()**: Cập nhật vùng in dựa trên dữ liệu sản phẩm
- **checkElementBounds()**: Kiểm tra element có nằm trong vùng in không
- **Observer**: Theo dõi thay đổi DOM và sự kiện drag/move

### 3. Component PrintAreaOverlay
Hiển thị UI cho vùng in:
- **Print Area Indicator**: Khung đường đứt nét hiển thị vùng in
- **Warning Overlay**: Hiệu ứng làm mờ khi element lệch khỏi vùng in
- **Warning Message**: Thông báo cảnh báo người dùng

### 4. Component PrintAreaDebug (Development)
Panel debug hiển thị thông tin real-time về:
- Tọa độ và kích thước vùng in
- Trạng thái in/out of bounds
- Số lượng elements đang được theo dõi

## Cấu hình vùng in

### Ví dụ cấu hình cho áo thun:
```javascript
{
  id: 'gallery-shirt-1',
  // ... other properties
  print_x: 25,    // Vùng in bắt đầu từ 25% chiều rộng
  print_y: 20,    // Vùng in bắt đầu từ 20% chiều cao
  print_w: 50,    // Vùng in rộng 50% chiều rộng sản phẩm
  print_h: 40,    // Vùng in cao 40% chiều cao sản phẩm
}
```

### Ví dụ cấu hình cho túi tote:
```javascript
{
  id: 'gallery-totebag-1',
  // ... other properties
  print_x: 20,    // Vùng in bắt đầu từ 20% chiều rộng
  print_y: 30,    // Vùng in bắt đầu từ 30% chiều cao  
  print_w: 60,    // Vùng in rộng 60% chiều rộng sản phẩm
  print_h: 35,    // Vùng in cao 35% chiều cao sản phẩm
}
```

## Hiệu ứng trực quan

### Khi element trong vùng in:
- Khung vùng in màu xanh với opacity thấp
- Không có overlay làm mờ
- Label hiển thị "Vùng in"

### Khi element lệch ra ngoài vùng in:
- Khung vùng in chuyển màu đỏ với opacity cao
- Overlay gradient đỏ với animation
- Warning message hiển thị ở top center
- Label hiển thị "Ngoài vùng in!"
- Animation pulse để thu hút sự chú ý

## Hiệu suất

### Tối ưu hóa:
- Sử dụng `requestAnimationFrame` để throttle kiểm tra bounds
- MutationObserver để theo dõi thay đổi DOM hiệu quả
- ResizeObserver để handle thay đổi kích thước container
- Cleanup listeners khi component unmount

### Responsive:
- Vùng in được tính toán dựa trên tỷ lệ phần trăm
- Tự động cập nhật khi container resize
- Hoạt động trên cả desktop và mobile

## API Integration

Khi tích hợp với API thực tế, chỉ cần đảm bảo response trả về các fields:
```json
{
  "id": "product-123",
  "name": "Product Name",
  // ... other fields
  "print_x": 25,
  "print_y": 20, 
  "print_w": 50,
  "print_h": 40
}
```

Nếu sản phẩm không có thông tin vùng in, tính năng sẽ không hoạt động và không ảnh hưởng đến UX.

## Testing

1. Chạy `npm run dev`
2. Vào trang edit
3. Thêm text/sticker elements
4. Kéo elements ra ngoài vùng in được đánh dấu
5. Quan sát hiệu ứng warning và overlay

## Development Mode

Trong development mode, sẽ có debug panel ở góc dưới bên phải hiển thị:
- Thông tin vùng in hiện tại
- Trạng thái bounds checking
- Số lượng elements được theo dõi
- Configuration của sản phẩm đang edit