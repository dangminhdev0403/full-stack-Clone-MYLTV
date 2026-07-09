---
name: Academic Precision
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
typography:
  display-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  caption:
    fontFamily: Be Vietnam Pro
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-padding: 24px
  element-gap: 16px
  section-margin: 32px
  grid-gutter: 20px
  compact-padding: 8px 12px
---

## Brand & Style
Hệ thống thiết kế hướng tới sự chuyên nghiệp, tin cậy và hiện đại cho môi trường giáo dục. Phong cách chủ đạo là **Minimalism (Tối giản)** kết hợp với **Corporate Modern**, tập trung tối đa vào khả năng đọc dữ liệu và giảm thiểu sự nhiễu loạn thị giác. 

Giao diện sử dụng các mảng trắng rộng (whitespace) và cấu trúc phân tầng rõ rệt để quản lý lượng thông tin lớn (big data). Cảm giác trải nghiệm phải mang lại sự ổn định, chính xác và hiệu quả cho người quản lý trường học.

## Colors
Bảng màu được xây dựng dựa trên tiêu chuẩn giáo dục hiện đại. Màu Xanh dương (Primary) đóng vai trò định hướng hành động và đại diện cho tính học thuật. Các màu trạng thái (Success, Warning, Danger) được sử dụng ở độ bão hòa vừa phải để thông báo chỉ số mà không gây căng thẳng cho người dùng. Màu nền `F8FAFC` tạo sự tách biệt nhẹ nhàng với các thẻ nội dung trắng tinh khiết, giúp giảm mỏi mắt khi làm việc trong thời gian dài.

## Typography
Sử dụng **Be Vietnam Pro** để tối ưu hóa hiển thị tiếng Việt, mang lại vẻ ngoài thân thiện nhưng vẫn giữ được sự chỉn chu. Hệ thống phân cấp chữ được thiết kế chặt chẽ:
- **Headline:** Sử dụng trọng số Bold (700) và Semi-bold (600) cho các tiêu đề trang và phân mục.
- **Body:** Ưu tiên kích thước 14px cho dữ liệu bảng biểu để hiển thị được nhiều thông tin hơn trên một màn hình mà không làm giảm khả năng đọc.
- **Label:** Dành cho các tag, badge và nhãn của input, sử dụng Medium (500) để phân biệt rõ với nội dung nhập liệu.

## Layout & Spacing
Hệ thống áp dụng mô hình **Fluid Grid** với lề an toàn cố định.
- **Desktop:** Hệ lưới 12 cột, gutter 20px. Sidebar cố định ở 260px.
- **Tablet:** Thu gọn sidebar thành icon-only (80px), lề container giảm xuống 16px.
- **Mobile:** Chuyển sang bố cục 1 cột, sidebar ẩn vào Hamburger Menu. 

Khoảng cách (spacing) tuân thủ hệ thống bội số của 4. Đối với các trang bảng biểu dữ liệu lớn, sử dụng `compact-padding` để tối ưu diện tích hiển thị.

## Elevation & Depth
Hệ thống sử dụng phương pháp **Tonal Layers** kết hợp với **Low-contrast outlines** để tạo chiều sâu mà không gây nặng nề:
- **Level 0 (Base):** Màu nền hệ thống `#F8FAFC`.
- **Level 1 (Card):** Nền trắng `#FFFFFF`, border mỏng 1px màu `#E2E8F0`, shadow cực nhẹ: `0px 1px 3px rgba(15, 23, 42, 0.05)`.
- **Level 2 (Popovers/Dropdowns):** Nền trắng, shadow trung bình: `0px 10px 15px -3px rgba(15, 23, 42, 0.1)`.
- **Interactive:** Khi hover vào các phần tử có thể tương tác (như hàng trong bảng hoặc thẻ học sinh), border sẽ chuyển sang màu Primary nhẹ hoặc tăng độ đậm của shadow.

## Shapes
Hệ thống sử dụng bo góc đồng nhất 10px cho tất cả các thẻ nội dung (Cards) và các thành phần lớn. 
- **Nút & Inputs:** Bo góc 8px để tạo sự sắc sảo, chuyên nghiệp.
- **Badges/Chips:** Bo góc 6px hoặc bo tròn hoàn toàn (pill-shaped) tùy thuộc vào mục đích phân loại.
- **Hình ảnh học sinh/giáo viên:** Bo góc 8px hoặc hình tròn tùy vị trí hiển thị.

## Components
- **Buttons:** Sử dụng Primary màu `#2563EB` cho hành động chính. Nút phụ sử dụng Ghost style (border mỏng, text xám). Chiều cao chuẩn 40px cho desktop và 44px cho mobile.
- **Tables:** Là thành phần quan trọng nhất. Header bảng có nền xám nhạt `#F1F5F9`, chữ in hoa nhẹ, font-size 12px. Các hàng có border-bottom `#E2E8F0`. Hover state highlight hàng bằng màu xanh nhạt 2%.
- **Input Fields:** Border `#E2E8F0`, focus state chuyển sang Primary `#2563EB` với hiệu ứng ring nhẹ 2px.
- **Cards:** Chứa chỉ số (Summary Cards) có icon Lucide nằm trong khung hình tròn màu pastel (ví dụ: Primary 10% opacity).
- **Badges:** Trạng thái "Đang học", "Nghỉ học", "Hoàn thành" sử dụng màu Success/Danger/Warning với nền nhạt 10% và text đậm màu gốc.
- **Charts:** Sử dụng biểu đồ đường và cột tối giản, lược bỏ các đường lưới không cần thiết để tập trung vào xu hướng dữ liệu.