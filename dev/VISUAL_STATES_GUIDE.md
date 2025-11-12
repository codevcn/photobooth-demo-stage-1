# Visual States Management Guide

## 📋 Tổng quan

Hệ thống quản lý visual states cho phép lưu trữ và truy xuất trạng thái hiển thị của tất cả elements (text, sticker, printed images) trong mỗi mockup design.

## 🏗️ Kiến trúc

### 1. Data Structure

```typescript
type TElementsVisualState = {
  text?: TTextVisualState[]
  sticker?: TElementVisualBaseState[]
  printedImage?: TElementVisualBaseState[]
}

type TElementVisualBaseState = {
  position: { x: number; y: number }
  scale: number
  angle: number
  zindex: number
}

type TTextVisualState = TElementVisualBaseState & {
  fontSize: number
  textColor: string
  content: string
  fontFamily: string
  fontWeight: number
}

type TMockupData = {
  id: string
  elementsVisualState: TElementsVisualState
  dataURL: string
}
```

### 2. LocalStorage Structure

```json
{
  "sessionId": "uuid",
  "productsInCart": [
    {
      "id": "product-id",
      "color": { "title": "Đen", "value": "#000" },
      "size": "M",
      "mockupDataList": [
        {
          "id": "mockup-uuid",
          "elementsVisualState": {
            "text": [
              {
                "position": { "x": 100, "y": 50 },
                "scale": 1,
                "angle": 0,
                "zindex": 1,
                "fontSize": 24,
                "textColor": "#000000",
                "content": "Hello World",
                "fontFamily": "Arial",
                "fontWeight": 700
              }
            ],
            "sticker": [
              {
                "position": { "x": 150, "y": 100 },
                "scale": 1.2,
                "angle": 45,
                "zindex": 2
              }
            ],
            "printedImage": [...]
          },
          "dataURL": "data:image/webp;base64,..."
        }
      ]
    }
  ]
}
```

## 🔄 Luồng hoạt động

### A. Lưu Visual States (Edit Page)

1. **Real-time tracking**: Mỗi element component lưu visual state vào `data-visual-state` attribute
2. **Collection**: Hook `useVisualStatesCollector` thu thập tất cả states từ DOM
3. **Storage**: Khi click "Thêm vào giỏ hàng", states được lưu cùng với mockup image

```typescript
// Trong TextElement.tsx, StickerElement.tsx, PrintedImageElement.tsx
<div
  data-element-type="text"
  data-visual-state={JSON.stringify({
    position,
    scale,
    angle,
    zindex,
    fontSize,
    textColor,
    content,
    fontFamily,
    fontWeight,
  })}
>
```

### B. Thu thập Visual States

```typescript
// useVisualStatesCollector.ts
const collectVisualStates = (): TElementsVisualState => {
  const textElements = document.querySelectorAll('[data-element-type="text"]')
  const stickerElements = document.querySelectorAll('[data-element-type="sticker"]')
  const printedImageElements = document.querySelectorAll('[data-element-type="printed-image"]')
  
  // Parse data-visual-state từ mỗi element
  return {
    text: parseElements(textElements),
    sticker: parseElements(stickerElements),
    printedImage: parseElements(printedImageElements),
  }
}
```

### C. Lưu vào LocalStorage

```typescript
// EditArea.tsx - beforeAddToCart()
const beforeAddToCart = () => {
  // Thu thập states
  const elementsVisualState = collectVisualStates()
  
  // Truyền vào handleAddToCart
  handleAddToCart(elementsVisualState)
}

// Page.tsx - handleAddToCart()
const handleAddToCart = (elementsVisualState: TElementsVisualState) => {
  handleSaveHtmlAsImage((imageDataUrl) => {
    LocalStorageHelper.saveMockupImageAtLocal(
      elementsVisualState,  // ✅ States được lưu cùng mockup
      productInfo,
      imageDataUrl,
      sessionId
    )
  })
}
```

### D. Truy xuất và hiển thị (Payment Page)

```typescript
// Payment/Page.tsx
const loadCartItems = () => {
  const savedItems = LocalStorageHelper.getSavedMockupData()
  
  for (const mockupData of product.mockupDataList) {
    productItems.push({
      mockupData: { 
        id: mockupData.id, 
        image: mockupData.dataURL 
      },
      elementsVisualState: mockupData.elementsVisualState,  // ✅ Truy xuất states
    })
  }
}
```

## 🛠️ API Reference

### Hooks

#### `useVisualStatesCollector()`
Thu thập visual states từ tất cả elements trong edit area.

```typescript
const { collectVisualStates } = useVisualStatesCollector()
const states = collectVisualStates()
```

### Utilities

#### `formatVisualStatesInfo(visualStates)`
Format thông tin visual states thành string dễ đọc.

```typescript
formatVisualStatesInfo(visualStates)
// Output: "2 text, 1 sticker, 3 image"
```

#### `hasElements(visualStates)`
Kiểm tra xem có elements hay không.

```typescript
if (hasElements(visualStates)) {
  console.log('Has elements')
}
```

#### `countElements(visualStates)`
Đếm tổng số elements.

```typescript
const count = countElements(visualStates) // 6
```

## 📊 Use Cases

### 1. Hiển thị thông tin elements trong giỏ hàng
```tsx
{elementsVisualState && (
  <span className="text-xs text-pink-cl">
    📝 {formatVisualStatesInfo(elementsVisualState)}
  </span>
)}
```

### 2. Re-edit design từ payment page
```typescript
// TODO: Implement edit functionality
const handleEditDesign = (mockupData: TMockupData) => {
  const { elementsVisualState } = mockupData
  // Restore elements với visual states
}
```

### 3. Validate trước khi thanh toán
```typescript
const hasInvalidDesigns = cartItems.some(item => 
  !hasElements(item.elementsVisualState)
)
```

## ⚠️ Lưu ý quan trọng

1. **Performance**: Visual states được thu thập từ DOM, nên chỉ gọi khi cần thiết (trước khi add to cart)
2. **Data attributes**: Mỗi element phải có `data-element-type` và `data-visual-state`
3. **Synchronization**: States trong data attribute phải sync với actual state của component
4. **Array structure**: `TElementsVisualState` sử dụng array cho mỗi loại element để hỗ trợ nhiều instances

## 🔮 Future Enhancements

- [ ] Edit design từ payment page
- [ ] Duplicate design với visual states
- [ ] Export/Import design templates
- [ ] Undo/Redo với visual states history
- [ ] Visual states validation
