# Database - MongoDB

Modern NoSQL database design for Abosefen sanitaryware e-commerce microservices.

## 🏗️ Database Architecture

Each microservice uses its own MongoDB database following the **Database per Service** pattern:

```
MongoDB Cluster
├── abosefen-auth          # Authentication & User Management
├── abosefen-catalog       # Product Catalog & Categories  
├── abosefen-orders        # Order Processing & History
├── abosefen-payments      # Payment Processing & Records
├── abosefen-notifications # Email & SMS Notifications
└── abosefen-analytics     # Business Intelligence & Reports
```

## 🗄️ Database Schemas

### Auth Database (`abosefen-auth`)

#### Users Collection
```javascript
{
  _id: ObjectId,
  email: "customer@example.com",
  password: "hashed_password",
  profile: {
    firstName: "أحمد",
    lastName: "محمد", 
    phone: "+20123456789",
    avatar: "https://cdn.abosefen.com/avatars/user123.jpg"
  },
  address: {
    street: "١٥ شارع الجمهورية",
    city: "القاهرة",
    governorate: "القاهرة",
    postalCode: "11511",
    coordinates: {
      lat: 30.0444,
      lng: 31.2357
    }
  },
  role: "customer", // customer, admin, manager
  preferences: {
    language: "ar", // ar, en
    currency: "EGP",
    notifications: {
      email: true,
      sms: true,
      orderUpdates: true,
      promotions: false
    }
  },
  isActive: true,
  emailVerified: false,
  phoneVerified: false,
  lastLogin: ISODate,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

#### Sessions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  accessToken: "jwt_token_hash",
  refreshToken: "refresh_token_hash", 
  device: {
    type: "mobile", // mobile, desktop, tablet
    os: "android",
    browser: "chrome",
    ip: "41.234.56.78"
  },
  expiresAt: ISODate,
  isActive: true,
  createdAt: ISODate
}
```

### Catalog Database (`abosefen-catalog`)

#### Categories Collection
```javascript
{
  _id: ObjectId,
  name: {
    en: "Bathroom Fittings",
    ar: "تجهيزات الحمام"
  },
  description: {
    en: "Complete range of bathroom fixtures and fittings",
    ar: "مجموعة كاملة من تجهيزات وأدوات الحمام"
  },
  slug: "bathroom-fittings",
  parentId: ObjectId, // null for root categories
  level: 1, // 1=main, 2=sub, 3=sub-sub
  image: "https://cdn.abosefen.com/categories/bathroom.jpg",
  icon: "bathroom-icon.svg",
  sortOrder: 1,
  seo: {
    metaTitle: {
      en: "Bathroom Fittings - Abosefen",
      ar: "تجهيزات الحمام - أبوسيفين"
    },
    metaDescription: {
      en: "Premium bathroom fittings and accessories",
      ar: "تجهيزات حمامات عالية الجودة ومستلزماتها"
    },
    keywords: ["bathroom", "fittings", "حمام", "تجهيزات"]
  },
  isActive: true,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

#### Products Collection
```javascript
{
  _id: ObjectId,
  name: {
    en: "Premium Ceramic Sink Basin",
    ar: "حوض سيراميك فاخر"
  },
  description: {
    en: "High-quality ceramic sink basin with modern design...",
    ar: "حوض سيراميك عالي الجودة بتصميم عصري..."
  },
  shortDescription: {
    en: "Modern ceramic sink basin",
    ar: "حوض سيراميك عصري"
  },
  categoryId: ObjectId,
  categoryPath: ["bathroom-fittings", "sinks", "ceramic-sinks"],
  
  // Product Details
  sku: "AB-SINK-001",
  barcode: "1234567890123",
  brand: "Ideal Standard",
  model: "Concept Air",
  series: "Premium Collection",
  
  // Pricing
  pricing: {
    cost: 500.00,
    price: 850.00,
    comparePrice: 1200.00, // Original price
    currency: "EGP",
    taxable: true,
    taxRate: 0.14 // 14% VAT
  },
  
  // Physical Properties
  specifications: {
    dimensions: {
      length: 60, // cm
      width: 40,
      height: 15,
      weight: 12.5 // kg
    },
    material: "Ceramic",
    color: "White",
    finish: "Glossy",
    installation: "Wall Mounted",
    drainSize: "32mm",
    overflowIncluded: true,
    tapHoles: 1,
    countryOfOrigin: "Germany"
  },
  
  // Features & Benefits
  features: {
    en: [
      "Scratch resistant surface",
      "Easy to clean",
      "Modern design",
      "Durable ceramic material"
    ],
    ar: [
      "سطح مقاوم للخدش",
      "سهل التنظيف", 
      "تصميم عصري",
      "مادة سيراميك متينة"
    ]
  },
  
  // Media
  images: [
    {
      url: "https://cdn.abosefen.com/products/sink-001-main.jpg",
      alt: {
        en: "Premium ceramic sink basin front view",
        ar: "حوض سيراميك فاخر - المنظر الأمامي"
      },
      isPrimary: true,
      sortOrder: 1
    },
    {
      url: "https://cdn.abosefen.com/products/sink-001-side.jpg", 
      alt: {
        en: "Side view showing installation",
        ar: "منظر جانبي يوضح التركيب"
      },
      isPrimary: false,
      sortOrder: 2
    }
  ],
  videos: [
    {
      url: "https://cdn.abosefen.com/videos/sink-installation.mp4",
      title: {
        en: "Installation Guide",
        ar: "دليل التركيب"
      },
      thumbnail: "https://cdn.abosefen.com/videos/thumbs/sink-install.jpg"
    }
  ],
  
  // Inventory & Availability
  inventory: {
    trackQuantity: true,
    currentStock: 25,
    reservedStock: 3,
    availableStock: 22,
    minStock: 5,
    maxStock: 100,
    locations: [
      {
        warehouse: "main",
        stock: 20,
        location: "A-15-B"
      },
      {
        warehouse: "showroom",
        stock: 5,
        location: "Display-3"
      }
    ]
  },
  
  // Logistics
  shipping: {
    weight: 15.0, // kg including packaging
    requiresSpecialHandling: true,
    fragile: true,
    shippingClass: "large",
    freeShippingEligible: true
  },
  
  // Related Products
  relatedProducts: [ObjectId, ObjectId, ObjectId],
  compatibleProducts: [ObjectId, ObjectId], // Faucets, drains, etc.
  accessories: [ObjectId, ObjectId], // Installation kits, cleaners
  
  // Business Logic
  status: "active", // active, inactive, discontinued
  isFeaturesd: true,
  isBestseller: false,
  isNew: false,
  isClearance: false,
  
  // SEO & Marketing
  seo: {
    slug: "premium-ceramic-sink-basin",
    metaTitle: {
      en: "Premium Ceramic Sink Basin - Abosefen",
      ar: "حوض سيراميك فاخر - أبوسيفين"
    },
    metaDescription: {
      en: "High-quality ceramic sink basin with modern design. Free shipping.",
      ar: "حوض سيراميك عالي الجودة بتصميم عصري. شحن مجاني."
    },
    keywords: ["sink", "ceramic", "bathroom", "حوض", "سيراميك", "حمام"]
  },
  
  tags: ["bathroom", "sink", "ceramic", "premium", "white"],
  
  // Analytics
  stats: {
    views: 1250,
    sales: 45,
    rating: 4.8,
    reviewCount: 23,
    wishlistCount: 67
  },
  
  // Timestamps
  createdAt: ISODate,
  updatedAt: ISODate,
  publishedAt: ISODate,
  lastSoldAt: ISODate
}
```

#### Reviews Collection
```javascript
{
  _id: ObjectId,
  productId: ObjectId,
  userId: ObjectId,
  rating: 5, // 1-5 stars
  title: {
    en: "Excellent quality sink",
    ar: "حوض ممتاز الجودة"
  },
  comment: {
    en: "Very satisfied with the quality and design...",
    ar: "راضٍ جداً عن الجودة والتصميم..."
  },
  pros: {
    en: ["Easy to clean", "Beautiful design"],
    ar: ["سهل التنظيف", "تصميم جميل"]
  },
  cons: {
    en: ["Installation was challenging"],
    ar: ["التركيب كان صعباً"]
  },
  images: [
    "https://cdn.abosefen.com/reviews/review-123-1.jpg"
  ],
  helpful: 15, // Number of "helpful" votes
  verified: true, // Verified purchase
  status: "approved", // pending, approved, rejected
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### Orders Database (`abosefen-orders`)

#### Orders Collection
```javascript
{
  _id: ObjectId,
  orderNumber: "ORD-2024-001234",
  userId: ObjectId,
  
  // Customer Information
  customer: {
    email: "customer@example.com",
    phone: "+20123456789",
    name: "أحمد محمد"
  },
  
  // Shipping Address
  shippingAddress: {
    firstName: "أحمد",
    lastName: "محمد",
    company: "شركة النصر للمقاولات",
    street: "١٥ شارع الجمهورية",
    apartment: "الدور الثالث",
    city: "القاهرة",
    governorate: "القاهرة", 
    postalCode: "11511",
    phone: "+20123456789",
    coordinates: {
      lat: 30.0444,
      lng: 31.2357
    }
  },
  
  // Billing Address (if different)
  billingAddress: {
    // Same structure as shipping
  },
  
  // Order Items
  items: [
    {
      productId: ObjectId,
      sku: "AB-SINK-001",
      name: {
        en: "Premium Ceramic Sink Basin",
        ar: "حوض سيراميك فاخر"
      },
      image: "https://cdn.abosefen.com/products/sink-001-thumb.jpg",
      quantity: 2,
      unitPrice: 850.00,
      totalPrice: 1700.00,
      weight: 15.0
    }
  ],
  
  // Financial Summary
  financials: {
    subtotal: 1700.00,
    shipping: 150.00,
    tax: 259.00, // 14% VAT
    discount: 100.00,
    total: 2009.00,
    currency: "EGP"
  },
  
  // Order Processing
  status: "processing", // pending, confirmed, processing, shipped, delivered, cancelled, refunded
  paymentStatus: "paid", // pending, paid, partially_paid, failed, refunded
  fulfillmentStatus: "unfulfilled", // unfulfilled, partial, fulfilled
  
  // Shipping Information
  shipping: {
    method: "standard", // standard, express, pickup
    carrier: "Aramex",
    trackingNumber: "ARX123456789",
    estimatedDelivery: ISODate,
    actualDelivery: ISODate,
    cost: 150.00
  },
  
  // Payment Information
  payment: {
    method: "card", // card, cash, transfer, installment
    transactionId: "TXN123456789",
    gatewayResponse: {
      // Payment gateway response data
    }
  },
  
  // Special Instructions
  notes: {
    customer: "الرجاء التسليم بعد الساعة 6 مساءً",
    internal: "Customer prefers evening delivery"
  },
  
  // Order Timeline
  timeline: [
    {
      status: "pending",
      timestamp: ISODate,
      note: "Order placed"
    },
    {
      status: "confirmed", 
      timestamp: ISODate,
      note: "Payment confirmed",
      userId: ObjectId // Staff member who updated
    }
  ],
  
  // Timestamps
  createdAt: ISODate,
  updatedAt: ISODate,
  confirmedAt: ISODate,
  shippedAt: ISODate,
  deliveredAt: ISODate
}
```

### Analytics Database (`abosefen-analytics`)

#### Sales Collection
```javascript
{
  _id: ObjectId,
  date: ISODate,
  period: "daily", // daily, weekly, monthly
  metrics: {
    totalOrders: 45,
    totalRevenue: 125750.00,
    averageOrderValue: 2794.44,
    newCustomers: 12,
    returningCustomers: 33,
    conversionRate: 3.2,
    topProducts: [
      {
        productId: ObjectId,
        name: "Premium Ceramic Sink",
        quantity: 15,
        revenue: 12750.00
      }
    ],
    topCategories: [
      {
        categoryId: ObjectId,
        name: "Bathroom Fittings",
        revenue: 85000.00
      }
    ]
  },
  createdAt: ISODate
}
```

## 🔧 Setup Instructions

### Using Docker (Recommended)

```yaml
# Docker Compose Configuration
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=AbosefenMongo2024!
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - ./database/init-scripts:/docker-entrypoint-initdb.d
    networks:
      - microservices-network
    command: mongod --replSet rs0 --bind_ip_all
    
  mongo-express:
    image: mongo-express:1.0.0
    environment:
      - ME_CONFIG_MONGODB_ADMINUSERNAME=admin
      - ME_CONFIG_MONGODB_ADMINPASSWORD=AbosefenMongo2024!
      - ME_CONFIG_MONGODB_URL=mongodb://admin:AbosefenMongo2024!@mongodb:27017/
      - ME_CONFIG_BASICAUTH_USERNAME=admin
      - ME_CONFIG_BASICAUTH_PASSWORD=admin
    ports:
      - "8081:8081"
    depends_on:
      - mongodb
    networks:
      - microservices-network

volumes:
  mongodb_data:

networks:
  microservices-network:
    driver: bridge
```

### Manual MongoDB Setup

1. **Install MongoDB Community Edition**
   ```bash
   # Ubuntu/Debian
   wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   
   # Windows
   # Download from https://www.mongodb.com/try/download/community
   ```

2. **Start MongoDB Service**
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

3. **Create Admin User**
   ```javascript
   use admin
   db.createUser({
     user: "admin",
     pwd: "AbosefenMongo2024!",
     roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
   })
   ```

## 🚀 Database Initialization

### Default Data Script

```javascript
// database/init-scripts/01-create-admin.js
use('abosefen-auth');

// Create default admin user
db.users.insertOne({
  email: "admin@abosefen.com",
  password: "$2a$12$encrypted_password_hash",
  profile: {
    firstName: "Admin",
    lastName: "Abosefen",
    phone: "+201000000000"
  },
  role: "admin",
  preferences: {
    language: "ar",
    currency: "EGP",
    notifications: {
      email: true,
      sms: true,
      orderUpdates: true,
      promotions: true
    }
  },
  isActive: true,
  emailVerified: true,
  phoneVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ "profile.phone": 1 });
db.users.createIndex({ role: 1 });
db.sessions.createIndex({ userId: 1 });
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

```javascript
// database/init-scripts/02-create-categories.js
use('abosefen-catalog');

// Main Categories
const categories = [
  {
    name: { en: "Bathroom Fittings", ar: "تجهيزات الحمام" },
    slug: "bathroom-fittings",
    level: 1,
    sortOrder: 1,
    image: "/images/categories/bathroom.jpg"
  },
  {
    name: { en: "Kitchen Fittings", ar: "تجهيزات المطبخ" },
    slug: "kitchen-fittings", 
    level: 1,
    sortOrder: 2,
    image: "/images/categories/kitchen.jpg"
  },
  {
    name: { en: "Ceramics", ar: "السيراميك" },
    slug: "ceramics",
    level: 1,
    sortOrder: 3,
    image: "/images/categories/ceramics.jpg"
  },
  {
    name: { en: "Bathtubs", ar: "أحواض الاستحمام" },
    slug: "bathtubs",
    level: 1, 
    sortOrder: 4,
    image: "/images/categories/bathtubs.jpg"
  },
  {
    name: { en: "Toilets", ar: "المراحيض" },
    slug: "toilets",
    level: 1,
    sortOrder: 5,
    image: "/images/categories/toilets.jpg"
  },
  {
    name: { en: "Accessories", ar: "الإكسسوارات" },
    slug: "accessories",
    level: 1,
    sortOrder: 6,
    image: "/images/categories/accessories.jpg"
  }
];

categories.forEach(category => {
  category.isActive = true;
  category.createdAt = new Date();
  category.updatedAt = new Date();
});

db.categories.insertMany(categories);

// Create indexes
db.categories.createIndex({ slug: 1 }, { unique: true });
db.categories.createIndex({ parentId: 1 });
db.categories.createIndex({ level: 1 });
db.products.createIndex({ sku: 1 }, { unique: true });
db.products.createIndex({ categoryId: 1 });
db.products.createIndex({ status: 1 });
db.products.createIndex({ "name.en": "text", "name.ar": "text", "description.en": "text", "description.ar": "text" });
```

## 📊 Queries & Operations

### Common Queries

#### Product Search (Multilingual)
```javascript
// Search products in Arabic and English
db.products.find({
  $text: { $search: "حوض سيراميك" },
  status: "active"
}).sort({ score: { $meta: "textScore" } });

// Filter by category and price range
db.products.find({
  categoryPath: { $in: ["bathroom-fittings"] },
  "pricing.price": { $gte: 500, $lte: 2000 },
  status: "active"
}).sort({ "stats.rating": -1 });
```

#### Order Analytics
```javascript
// Monthly sales report
db.orders.aggregate([
  {
    $match: {
      createdAt: {
        $gte: new Date("2024-01-01"),
        $lt: new Date("2024-02-01")
      },
      status: { $ne: "cancelled" }
    }
  },
  {
    $group: {
      _id: null,
      totalOrders: { $sum: 1 },
      totalRevenue: { $sum: "$financials.total" },
      avgOrderValue: { $avg: "$financials.total" }
    }
  }
]);
```

#### Customer Insights
```javascript
// Top customers by purchase value
db.orders.aggregate([
  {
    $match: { status: { $ne: "cancelled" } }
  },
  {
    $group: {
      _id: "$userId",
      totalSpent: { $sum: "$financials.total" },
      orderCount: { $sum: 1 },
      lastOrder: { $max: "$createdAt" }
    }
  },
  {
    $sort: { totalSpent: -1 }
  },
  {
    $limit: 10
  }
]);
```

## 🔒 Security & Performance

### Indexes Strategy
```javascript
// Performance indexes
db.products.createIndex({ categoryId: 1, status: 1 });
db.products.createIndex({ "pricing.price": 1 });
db.products.createIndex({ tags: 1 });
db.orders.createIndex({ userId: 1, createdAt: -1 });
db.orders.createIndex({ status: 1, createdAt: -1 });
db.reviews.createIndex({ productId: 1, status: 1 });
```

### Data Validation
```javascript
// Product schema validation
db.createCollection("products", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "sku", "categoryId", "pricing", "status"],
      properties: {
        sku: {
          bsonType: "string",
          pattern: "^[A-Z]{2}-[A-Z0-9]+-[0-9]{3}$"
        },
        "pricing.price": {
          bsonType: "number",
          minimum: 0
        },
        status: {
          enum: ["active", "inactive", "discontinued"]
        }
      }
    }
  }
});
```

## 🔄 Migration from SQL Server

### Data Migration Script
```javascript
// migration/migrate-from-sql.js
const { MongoClient } = require('mongodb');
const sql = require('mssql');

async function migrateSQLToMongo() {
  // Connect to both databases
  const mongoClient = new MongoClient('mongodb://localhost:27017');
  await mongoClient.connect();
  
  const sqlConfig = {
    user: 'sa',
    password: 'Tmahereswd123.',
    server: 'localhost',
    database: 'Abosefen_Products'
  };
  
  await sql.connect(sqlConfig);
  
  // Migrate products
  const products = await sql.query`SELECT * FROM Products`;
  const mongoDb = mongoClient.db('abosefen-catalog');
  
  const transformedProducts = products.recordset.map(product => ({
    name: {
      en: product.name,
      ar: product.nameAr || product.name
    },
    description: {
      en: product.description,
      ar: product.descriptionAr || product.description
    },
    sku: product.sku,
    categoryId: new ObjectId(), // Map to new category structure
    pricing: {
      price: product.price,
      comparePrice: product.comparePrice,
      currency: "EGP"
    },
    status: product.isActive ? "active" : "inactive",
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  }));
  
  await mongoDb.collection('products').insertMany(transformedProducts);
  
  console.log(`Migrated ${transformedProducts.length} products`);
}
```

---

**Modern MongoDB architecture designed for scalable e-commerce operations** 🚀 