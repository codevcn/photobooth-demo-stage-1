# Photobooth API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer {jwt_token}
```

---

## 1. List Products Catalog

Retrieve a paginated list of active products from the catalog with their variants and surfaces.

### Endpoint

```
GET /products/catalog
```

### Authentication

Not required (public endpoint)

### Query Parameters

| Parameter   | Type    | Required | Description              |
| ----------- | ------- | -------- | ------------------------ |
| `page`      | integer | No       | Page number (default: 1) |
| `page_size` | integer | No       | Number of items per page |

### Response

**Status Code:** `200 OK`

**Headers:**

- `X-Total-Count`: Total number of products available
- `Content-Type`: `application/json; charset=utf-8`

**Response Body:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Classic Photobooth Mug",
      "slug": "classic-photobooth-mug",
      "base_image_url": "https://i.pinimg.com/1200x/f3/d3/f5/f3d3f5defe1bcf5a6729434b1a33a817.jpg",
      "description": "A ceramic mug customized via photobooth editor.",
      "status": "active",
      "attributes_json": {
        "category": "mug"
      },
      "created_at": "2025-11-11T20:09:18.400Z",
      "updated_at": "2025-11-11T23:06:40.914Z",
      "variants": [
        {
          "id": 1,
          "product_id": 1,
          "sku": "MUG-WHITE-11OZ",
          "size": "11oz",
          "color": "white",
          "price_amount_oneside": "150000",
          "price_amount_bothside": "180000",
          "currency": "VND",
          "stock_qty": 250,
          "attributes_json": {
            "material": "ceramic"
          },
          "created_at": "2025-11-11T20:09:18.400Z",
          "updated_at": "2025-11-11T20:09:18.400Z"
        }
      ],
      "surfaces": [
        {
          "id": 1,
          "product_id": 1,
          "code": "front",
          "display_name": "Front Surface",
          "preview_image_url": "https://i.pinimg.com/1200x/f3/d3/f5/f3d3f5defe1bcf5a6729434b1a33a817.jpg",
          "order_index": 0,
          "created_at": "2025-11-11T20:09:18.400Z",
          "updated_at": "2025-11-12T00:06:25.915Z",
          "print_areas": {
            "width_px": 605,
            "height_px": 726,
            "x_px": 153,
            "y_px": 236,
            "width_real_px": 500,
            "height_real_px": 600
          }
        }
      ]
    }
  ]
}
```

### Response Fields

| Field                              | Type    | Description                                             |
| ---------------------------------- | ------- | ------------------------------------------------------- |
| `id`                               | integer | Product unique identifier                               |
| `name`                             | string  | Product name                                            |
| `slug`                             | string  | URL-friendly product identifier                         |
| `base_image_url`                   | string  | Product base image URL                                  |
| `description`                      | string  | Product description                                     |
| `status`                           | string  | Product status (active/inactive)                        |
| `attributes_json`                  | object  | Additional product attributes                           |
| `variants`                         | array   | Array of product variants                               |
| `variants[].sku`                   | string  | Stock keeping unit                                      |
| `variants[].price_amount_oneside`  | string  | Price for one-sided printing (in currency minor units)  |
| `variants[].price_amount_bothside` | string  | Price for both-sided printing (in currency minor units) |
| `variants[].stock_qty`             | integer | Available stock quantity                                |
| `surfaces`                         | array   | Array of printable surfaces                             |
| `surfaces[].code`                  | string  | Surface identifier code                                 |
| `surfaces[].print_areas`           | object  | Print area dimensions and position                      |

### Example Request

```bash
curl -X GET "http://localhost:3000/api/products/catalog?page=1&page_size=10"
```

---

## 2. Create Order

Create a new order with customized products. This endpoint handles order creation, design submission, payment instruction generation, and discount application.

### Endpoint

```
POST /orders
```

### Authentication

Not required (public endpoint)

### Request Headers

```
Content-Type: application/json
```

### Request Body

```json
{
  "store_code": "photoism-hn",
  "customer": {
    "name": "Nguyễn Anh Tuấn",
    "email": "customer@example.com",
    "phone": "+84987794267"
  },
  "shipping_address": {
    "address1": "17/21, Lã Xuân Oai, Tăng Nhơn Phú A",
    "city": "Tăng Nhơn Phú A",
    "province": "Thủ Đức",
    "postcode": "10000",
    "country": "VN"
  },
  "items": [
    {
      "variant_id": 1,
      "quantity": 1,
      "surfaces": [
        {
          "surface_id": 1,
          "editor_state_json": {
            "text": "Front"
          },
          "file_url": "https://example.com/design-front.png",
          "width_px": 2000,
          "height_px": 1400
        },
        {
          "surface_id": 2,
          "editor_state_json": {
            "text": "Back"
          },
          "file_url": "https://example.com/design-back.png",
          "width_px": 2000,
          "height_px": 1400
        }
      ]
    }
  ],
  "voucher_code": "DEMO-VOUCHER",
  "note": "Gọi trước khi giao"
}
```

### Request Fields

| Field                                  | Type    | Required | Description                       |
| -------------------------------------- | ------- | -------- | --------------------------------- |
| `store_code`                           | string  | Yes      | Store identifier code             |
| `customer`                             | object  | Yes      | Customer information              |
| `customer.name`                        | string  | Yes      | Customer full name                |
| `customer.email`                       | string  | Yes      | Customer email address            |
| `customer.phone`                       | string  | Yes      | Customer phone number             |
| `shipping_address`                     | object  | Yes      | Shipping address details          |
| `shipping_address.address1`            | string  | Yes      | Street address                    |
| `shipping_address.city`                | string  | Yes      | City name                         |
| `shipping_address.province`            | string  | Yes      | Province/State                    |
| `shipping_address.postcode`            | string  | Yes      | Postal code                       |
| `shipping_address.country`             | string  | Yes      | Country code (ISO 3166-1 alpha-2) |
| `items`                                | array   | Yes      | Array of order items              |
| `items[].variant_id`                   | integer | Yes      | Product variant ID                |
| `items[].quantity`                     | integer | Yes      | Quantity to order                 |
| `items[].item_note`                    | string  | No       | Special note for this item        |
| `items[].surfaces`                     | array   | Yes      | Array of customized surfaces      |
| `items[].surfaces[].surface_id`        | integer | Yes      | Surface ID to customize           |
| `items[].surfaces[].editor_state_json` | object  | Yes      | Editor state/configuration        |
| `items[].surfaces[].file_url`          | string  | Yes      | URL of the design file            |
| `items[].surfaces[].width_px`          | integer | Yes      | Design width in pixels            |
| `items[].surfaces[].height_px`         | integer | Yes      | Design height in pixels           |
| `voucher_code`                         | string  | No       | Discount voucher code             |
| `note`                                 | string  | No       | Order note                        |

### Response

**Status Code:** `201 Created`

**Response Body:**

```json
{
  "data": {
    "order": {
      "id": 138,
      "partner_id": 1,
      "store_id": 1,
      "hash_code": "UL67NSEAPG",
      "external_order_id": "EXT-1762998222660",
      "customer_name": "Nguyễn Anh Tuấn",
      "customer_email": "customer@example.com",
      "customer_phone": "+84987794267",
      "status": "pending_payment",
      "subtotal_amount": "980000",
      "discount_amount": "98000",
      "shipping_amount": "15000",
      "total_amount": "897000",
      "currency": "VND",
      "note": "Gọi trước khi giao",
      "created_at": "2025-11-13T01:43:42.665Z",
      "updated_at": "2025-11-13T01:43:42.665Z",
      "store": {
        "id": 1,
        "name": "Photoism Hanoi"
      },
      "items_count": 0
    },
    "store": {
      "id": 1,
      "code": "photoism-hn",
      "name": "Photoism Hanoi",
      "routes": [
        {
          "id": 1,
          "path_alias": "/s/photoism-hn",
          "custom_domain": "shop.photoism.vn"
        }
      ]
    },
    "address": {
      "id": 138,
      "order_id": 138,
      "address1": "17/21, Lã Xuân Oai, Tăng Nhơn Phú A",
      "city": "Tăng Nhơn Phú A",
      "province": "Thủ Đức",
      "postcode": "10000",
      "country": "VN",
      "created_at": "2025-11-13T01:43:42.681Z"
    },
    "items": [
      {
        "id": 155,
        "order_id": 138,
        "product_id": 1,
        "variant_id": 1,
        "design_id": 155,
        "quantity": 1,
        "unit_price_amount": 180000,
        "item_note": null,
        "created_at": "2025-11-13T01:43:42.695Z",
        "product": {
          "id": 1,
          "name": "Classic Photobooth Mug"
        },
        "variant": {
          "id": 1,
          "size": "11oz",
          "color": "white"
        },
        "design": {
          "id": 155,
          "surfaces": [
            {
              "id": 167,
              "surface_id": 1,
              "editor_state_json": {
                "text": "Front"
              },
              "file_url": "https://example.com/design-front.png",
              "width_px": 2000,
              "height_px": 1400,
              "generated_at": "2025-11-13T01:43:42.689Z"
            }
          ]
        }
      }
    ],
    "payments": [],
    "shipments": [],
    "discounts": [
      {
        "id": 88,
        "order_id": 138,
        "discount_id": 1,
        "code_snapshot": "DEMO-VOUCHER",
        "type_snapshot": "percent",
        "value_snapshot": 10,
        "amount_amount": 98000,
        "currency": "VND",
        "applied_at": "2025-11-13T01:43:42.715Z"
      }
    ],
    "payment_instructions": [
      {
        "id": 135,
        "order_id": 138,
        "bin": "970422",
        "account_number": "VQRQAFGHB3790",
        "account_name": "LUONG THANH LOI",
        "amount": "897000",
        "description": "EXT1762998222660",
        "order_code": "1762998222723138",
        "currency": "VND",
        "payment_link_id": "e53d91d508d8460e8fa229e6654b51e5",
        "status": "PENDING",
        "checkout_url": "https://pay.payos.vn/web/e53d91d508d8460e8fa229e6654b51e5",
        "qr_code": "00020101021238570010A000000727012700069704220113VQRQAFGHB37900208QRIBFTTA530370454068970005802VN62200816EXT17629982226606304E403",
        "created_at": "2025-11-13T01:43:43.412Z",
        "updated_at": "2025-11-13T01:43:43.412Z"
      }
    ]
  }
}
```

### Response Fields

| Field                                 | Type    | Description                                                                     |
| ------------------------------------- | ------- | ------------------------------------------------------------------------------- |
| `order.id`                            | integer | Order unique identifier                                                         |
| `order.hash_code`                     | string  | Public order hash code for tracking                                             |
| `order.external_order_id`             | string  | External reference ID                                                           |
| `order.status`                        | string  | Order status (pending_payment, paid, processing, shipped, completed, cancelled) |
| `order.subtotal_amount`               | string  | Subtotal before discounts (in currency minor units)                             |
| `order.discount_amount`               | string  | Total discount amount                                                           |
| `order.shipping_amount`               | string  | Shipping cost                                                                   |
| `order.total_amount`                  | string  | Final total amount                                                              |
| `items`                               | array   | Array of ordered items with designs                                             |
| `discounts`                           | array   | Applied discount details                                                        |
| `payment_instructions`                | array   | Payment gateway instructions                                                    |
| `payment_instructions[].checkout_url` | string  | Payment checkout URL                                                            |
| `payment_instructions[].qr_code`      | string  | QR code for bank transfer                                                       |

### Example Request

```bash
curl -X POST "http://localhost:3000/api/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "store_code": "photoism-hn",
    "customer": {
      "name": "Nguyễn Anh Tuấn",
      "email": "customer@example.com",
      "phone": "+84987794267"
    },
    "shipping_address": {
      "address1": "123 Main St",
      "city": "Hanoi",
      "province": "HN",
      "postcode": "10000",
      "country": "VN"
    },
    "items": [
      {
        "variant_id": 1,
        "quantity": 1,
        "surfaces": [
          {
            "surface_id": 1,
            "editor_state_json": {"text": "Custom Design"},
            "file_url": "https://example.com/design.png",
            "width_px": 2000,
            "height_px": 1400
          }
        ]
      }
    ]
  }'
```

---

## 3. Check Payment Status

Check if an order has been paid using the order hash code.

### Endpoint

```
GET /orders/hash/{hash_code}/status
```

### Authentication

Not required (public endpoint)

### Path Parameters

| Parameter   | Type   | Required | Description                                           |
| ----------- | ------ | -------- | ----------------------------------------------------- |
| `hash_code` | string | Yes      | Order hash code (received from create order response) |

### Response

**Status Code:** `200 OK`

**Response Body:**

```json
{
  "data": {
    "id": 144,
    "status": "paid",
    "is_paid": true
  }
}
```

### Response Fields

| Field     | Type    | Description                     |
| --------- | ------- | ------------------------------- |
| `id`      | integer | Order ID                        |
| `status`  | string  | Current order status            |
| `is_paid` | boolean | Whether the order has been paid |

### Order Status Values

| Status            | Description                        |
| ----------------- | ---------------------------------- |
| `pending_payment` | Order created, waiting for payment |
| `paid`            | Payment confirmed                  |
| `processing`      | Order is being processed           |
| `shipped`         | Order has been shipped             |
| `completed`       | Order completed                    |
| `cancelled`       | Order cancelled                    |

### Example Request

```bash
curl -X GET "http://localhost:3000/api/orders/hash/UL67NSEAPG/status"
```

### Usage Notes

- Use this endpoint to poll payment status after redirecting customer to payment gateway
- Recommended polling interval: 5-10 seconds
- The `is_paid` field is a convenient boolean flag that returns `true` when status is `paid` or beyond

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "error": {
    "message": "Validation error",
    "details": ["Field 'customer.email' is required"]
  }
}
```

### 404 Not Found

```json
{
  "error": {
    "message": "Resource not found"
  }
}
```

### 500 Internal Server Error

```json
{
  "error": {
    "message": "Internal server error"
  }
}
```

---

## Data Types

### Currency Amounts

All monetary amounts are represented as strings in the smallest currency unit (e.g., cents for USD, đồng for VND):

- Example: `"150000"` represents 150,000 VND

### Timestamps

All timestamps follow ISO 8601 format:

- Example: `"2025-11-13T01:43:42.665Z"`

### Country Codes

Country codes follow ISO 3166-1 alpha-2 standard:

- Example: `"VN"` for Vietnam
