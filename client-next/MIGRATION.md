# Component Migration Guide

## Thay đổi đã thực hiện

### Cấu trúc cũ
```
components/
├── Navbar.tsx
├── Navbar.css
├── Footer.tsx
├── Banner.tsx
├── LazyImage.tsx
└── ...
```

### Cấu trúc mới
```
components/
├── index.ts               # Central exports
├── types.ts              # Shared types
├── README.md             # Documentation
├── ClientProviders.tsx   # Providers (không di chuyển)
├── I18nProvider.tsx      # Providers (không di chuyển)
│
├── Navbar/
│   ├── index.tsx
│   ├── Navbar.css
│   └── README.md
│
├── Footer/
│   ├── index.tsx
│   └── README.md
│
└── [Other Components]/
    ├── index.tsx
    └── README.md (optional)
```

## Lợi ích

1. **Tổ chức tốt hơn**: Mỗi component có folder riêng
2. **Dễ mở rộng**: Thêm CSS, tests, stories dễ dàng
3. **Import sạch hơn**: Sử dụng barrel exports
4. **Documentation**: README cho từng component
5. **Scalable**: Dễ dàng thêm related files

## Không ảnh hưởng đến code hiện tại

### Import vẫn hoạt động bình thường
```tsx
// Cách 1: Trực tiếp từ folder
import Navbar from '@/components/Navbar';

// Cách 2: Từ barrel export (khuyên dùng)
import { Navbar, Footer } from '@/components';
```

### Không cần thay đổi code
Tất cả import paths hiện tại vẫn hoạt động vì:
- Next.js tự động resolve `index.tsx`
- Paths tương đối đã được cập nhật
- Barrel export hỗ trợ named imports

## Thêm component mới

1. Tạo folder: `components/NewComponent/`
2. Tạo `index.tsx`:
```tsx
export default function NewComponent() {
  return <div>New Component</div>;
}
```
3. (Optional) Tạo `NewComponent.css` nếu cần
4. (Optional) Tạo `README.md` để document
5. Export trong `components/index.ts`:
```tsx
export { default as NewComponent } from './NewComponent';
```

## Lưu ý

- **Providers** (ClientProviders, I18nProvider) không di chuyển vì chúng là single-file components
- **CSS files** được giữ tên rõ ràng (vd: `Navbar.css`) thay vì `index.css`
- **README.md** được thêm cho các component chính để documentation

## Testing

Đã kiểm tra:
- ✅ No TypeScript errors
- ✅ Import paths work correctly
- ✅ CSS imports resolved
- ✅ App structure maintained
