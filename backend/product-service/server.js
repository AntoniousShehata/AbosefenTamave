const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
// const SmartSearchService = require('./services/smartSearchService'); // Not needed anymore
const RecommendationService = require('./services/recommendationService');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://admin:AbosefenMongo2024!@mongodb:27017';
const DB_NAME = 'abosefen-catalog';

let db;
// let smartSearchService; // Not needed anymore
let recommendationService;

// ===== ENHANCED SCHEMAS FOR ENTERPRISE FEATURES =====

// Hierarchical Category System
const enhancedCategorySchema = {
  _id: String, // BF, KF, BT, etc.
  code: String, // 2-digit category code
  name: { en: String, ar: String },
  description: { en: String, ar: String },
  image: String,
  isActive: Boolean,
  sortOrder: Number,
  subcategories: [{
    _id: String, // BF-01, BF-02, etc.
    code: String, // 2-digit subcategory code  
    name: { en: String, ar: String },
    description: { en: String, ar: String },
    image: String,
    isActive: Boolean,
    sortOrder: Number,
    productTypes: [{
      _id: String, // BF-01-001, BF-01-002, etc.
      code: String, // 3-digit product type code
      name: { en: String, ar: String },
      description: { en: String, ar: String },
      isActive: Boolean,
      sortOrder: Number
    }]
  }],
  createdAt: Date,
  updatedAt: Date
};

// Store/Branch Management Schema
const storeSchema = {
  _id: String, // ST01, ST02, etc.
  code: String, // 2-digit store code
  name: { en: String, ar: String },
  type: String, // "main", "branch", "warehouse", "showroom"
  location: {
    address: { en: String, ar: String },
    city: { en: String, ar: String },
    governorate: { en: String, ar: String },
    postalCode: String,
    coordinates: { lat: Number, lng: Number },
    phone: String,
    email: String
  },
  manager: {
    name: String,
    phone: String,
    email: String
  },
  operatingHours: {
    weekdays: { open: String, close: String },
    weekends: { open: String, close: String },
    holidays: String
  },
  isActive: Boolean,
  features: [String], // ["showroom", "warehouse", "service", "delivery"]
  createdAt: Date,
  updatedAt: Date
};

// Enhanced Product Schema with Hierarchical Coding
const enhancedProductSchema = {
  _id: String, // Auto-generated hierarchical SKU
  hierarchicalCode: {
    category: String, // BF
    subcategory: String, // 01  
    productType: String, // 001
    variant: String, // 01
    full: String // BF-01-001-01
  },
  name: { en: String, ar: String },
  slug: String,
  categoryId: String,
  subcategoryId: String,
  productTypeId: String,
  description: { en: String, ar: String },
  specifications: {
    dimensions: { width: Number, height: Number, depth: Number, unit: String },
    weight: { value: Number, unit: String },
    material: { en: String, ar: String },
    color: { en: String, ar: String },
    finish: { en: String, ar: String },
    brand: String,
    model: String,
    countryOfOrigin: String
  },
  variants: [{
    _id: String,
    code: String, // 01, 02, etc.
    name: { en: String, ar: String },
    sku: String, // Full hierarchical SKU
    specifications: Object,
    pricing: Object,
    inventory: Object,
    images: Array,
    isActive: Boolean
  }],
  pricing: {
    originalPrice: Number,
    salePrice: Number,
    isOnSale: Boolean,
    discountPercentage: Number,
    currency: String,
    priceHistory: [{
      price: Number,
      date: Date,
      reason: String
    }]
  },
  inventory: {
    multiLocation: [{
      storeId: String,
      storeName: String,
      quantity: Number,
      reserved: Number,
      available: Number,
      lowStockThreshold: Number,
      lastUpdated: Date
    }],
    totalQuantity: Number,
    totalReserved: Number,
    totalAvailable: Number,
    inStock: Boolean,
    lowStockThreshold: Number,
    reorderPoint: Number,
    reorderQuantity: Number,
    autoReorder: Boolean
  },
  supplier: {
    _id: String,
    name: String,
    contact: Object,
    leadTime: Number, // days
    minOrderQuantity: Number,
    pricePerUnit: Number,
    paymentTerms: String
  },
  images: [{
    url: String,
    alt: { en: String, ar: String },
    isPrimary: Boolean,
    sortOrder: Number,
    variants: [String] // Which variants this image applies to
  }],
  seo: {
    metaTitle: { en: String, ar: String },
    metaDescription: { en: String, ar: String },
    keywords: [String]
  },
  ratings: {
    average: Number,
    count: Number,
    distribution: { 1: Number, 2: Number, 3: Number, 4: Number, 5: Number }
  },
  sales: {
    totalSold: Number,
    totalRevenue: Number,
    lastSaleDate: Date,
    averageSalesPerMonth: Number
  },
  tags: [String],
  isActive: Boolean,
  isFeatured: Boolean,
  isNewArrival: Boolean,
  isBestSeller: Boolean,
  status: String, // "active", "discontinued", "out-of-stock", "pre-order"
  createdAt: Date,
  updatedAt: Date,
  createdBy: String,
  updatedBy: String
};

// Supplier Management Schema
const supplierSchema = {
  _id: String,
  code: String, // SUP001, SUP002, etc.
  name: { en: String, ar: String },
  legalName: String,
  taxId: String,
  contact: {
    address: { en: String, ar: String },
    city: { en: String, ar: String },
    country: String,
    phone: String,
    email: String,
    website: String,
    contactPerson: {
      name: String,
      position: String,
      phone: String,
      email: String
    }
  },
  businessInfo: {
    establishedYear: Number,
    businessType: String,
    certifications: [String],
    paymentTerms: String,
    creditLimit: Number,
    currency: String
  },
  performance: {
    rating: Number,
    onTimeDelivery: Number,
    qualityRating: Number,
    responseTime: Number,
    totalOrders: Number,
    totalValue: Number
  },
  products: [String], // Product IDs they supply
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
};

// Purchase Order Schema
const purchaseOrderSchema = {
  _id: String, // PO-2024-001
  orderNumber: String,
  supplierId: String,
  storeId: String, // Destination store
  status: String, // "draft", "sent", "confirmed", "shipped", "received", "completed", "cancelled"
  orderDate: Date,
  expectedDeliveryDate: Date,
  actualDeliveryDate: Date,
  items: [{
    productId: String,
    variantId: String,
    sku: String,
    name: { en: String, ar: String },
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number,
    receivedQuantity: Number,
    specifications: Object
  }],
  totals: {
    subtotal: Number,
    tax: Number,
    shipping: Number,
    discount: Number,
    total: Number,
    currency: String
  },
  shipping: {
    method: String,
    trackingNumber: String,
    estimatedDelivery: Date,
    actualDelivery: Date
  },
  payments: [{
    amount: Number,
    date: Date,
    method: String,
    reference: String,
    status: String
  }],
  notes: String,
  attachments: [String],
  createdBy: String,
  createdAt: Date,
  updatedAt: Date
};

// Sales/Orders Analytics Schema
const salesOrderSchema = {
  _id: String,
  orderNumber: String,
  customerId: String,
  storeId: String, // Which store fulfilled the order
  status: String,
  orderDate: Date,
  items: [{
    productId: String,
    variantId: String,
    sku: String,
    name: { en: String, ar: String },
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number,
    storeId: String // Which store the item came from
  }],
  totals: {
    subtotal: Number,
    tax: Number,
    shipping: Number,
    discount: Number,
    total: Number,
    currency: String
  },
  customer: {
    name: String,
    email: String,
    phone: String,
    address: Object
  },
  createdAt: Date,
  updatedAt: Date
};

// Automation Rules Schema
const automationRuleSchema = {
  _id: String,
  name: String,
  type: String, // "low-stock-alert", "auto-reorder", "price-update", "promotion"
  isActive: Boolean,
  conditions: [{
    field: String,
    operator: String,
    value: Object
  }],
  actions: [{
    type: String,
    parameters: Object
  }],
  lastExecuted: Date,
  executionCount: Number,
  createdAt: Date,
  updatedAt: Date
};

// Enhanced Categories with Hierarchical Structure
const enhancedCategories = [
  {
    _id: "BF",
    code: "BF",
    name: { en: "Bathroom Fittings", ar: "تجهيزات الحمام" },
    description: { en: "Complete range of bathroom fixtures and fittings", ar: "مجموعة كاملة من تجهيزات الحمام" },
    image: "/images/categories/BATHROOM_FITTINGS.jpg",
    isActive: true,
    sortOrder: 1,
    subcategories: [
      {
        _id: "BF-01",
        code: "01",
        name: { en: "Basins & Sinks", ar: "الأحواض والمغاسل" },
        description: { en: "Wall-mounted and countertop basins", ar: "أحواض معلقة وأحواض الطاولة" },
        isActive: true,
        sortOrder: 1,
        productTypes: [
          { _id: "BF-01-001", code: "001", name: { en: "Wall-Mounted Basins", ar: "أحواض معلقة" }, isActive: true, sortOrder: 1 },
          { _id: "BF-01-002", code: "002", name: { en: "Countertop Basins", ar: "أحواض الطاولة" }, isActive: true, sortOrder: 2 },
          { _id: "BF-01-003", code: "003", name: { en: "Pedestal Basins", ar: "أحواض القاعدة" }, isActive: true, sortOrder: 3 }
        ]
      },
      {
        _id: "BF-02",
        code: "02", 
        name: { en: "Toilets & Bidets", ar: "المراحيض والبيديت" },
        description: { en: "Modern toilet fixtures and bidets", ar: "تجهيزات المراحيض والبيديت الحديثة" },
        isActive: true,
        sortOrder: 2,
        productTypes: [
          { _id: "BF-02-001", code: "001", name: { en: "Wall-Hung Toilets", ar: "مراحيض معلقة" }, isActive: true, sortOrder: 1 },
          { _id: "BF-02-002", code: "002", name: { en: "Floor-Standing Toilets", ar: "مراحيض أرضية" }, isActive: true, sortOrder: 2 },
          { _id: "BF-02-003", code: "003", name: { en: "Bidets", ar: "بيديت" }, isActive: true, sortOrder: 3 }
        ]
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "KF", 
    code: "KF",
    name: { en: "Kitchen Fittings", ar: "تجهيزات المطبخ" },
    description: { en: "Kitchen sinks, faucets and accessories", ar: "أحواض وصنابير ومعدات المطبخ" },
    image: "/images/categories/KITCHEN_FITTINGS.jpg",
    isActive: true,
    sortOrder: 2,
    subcategories: [
      {
        _id: "KF-01",
        code: "01",
        name: { en: "Kitchen Sinks", ar: "أحواض المطبخ" },
        description: { en: "Stainless steel and granite kitchen sinks", ar: "أحواض المطبخ من الستانلس ستيل والجرانيت" },
        isActive: true,
        sortOrder: 1,
        productTypes: [
          { _id: "KF-01-001", code: "001", name: { en: "Single Bowl Sinks", ar: "أحواض وعاء واحد" }, isActive: true, sortOrder: 1 },
          { _id: "KF-01-002", code: "002", name: { en: "Double Bowl Sinks", ar: "أحواض وعاءين" }, isActive: true, sortOrder: 2 },
          { _id: "KF-01-003", code: "003", name: { en: "Farmhouse Sinks", ar: "أحواض الريف" }, isActive: true, sortOrder: 3 }
        ]
      },
      {
        _id: "KF-02",
        code: "02",
        name: { en: "Kitchen Faucets", ar: "صنابير المطبخ" },
        description: { en: "Modern kitchen faucets and mixers", ar: "صنابير ومخلطات المطبخ الحديثة" },
        isActive: true,
        sortOrder: 2,
        productTypes: [
          { _id: "KF-02-001", code: "001", name: { en: "Pull-Out Faucets", ar: "صنابير قابلة للسحب" }, isActive: true, sortOrder: 1 },
          { _id: "KF-02-002", code: "002", name: { en: "Single Handle Faucets", ar: "صنابير مقبض واحد" }, isActive: true, sortOrder: 2 },
          { _id: "KF-02-003", code: "003", name: { en: "Commercial Faucets", ar: "صنابير تجارية" }, isActive: true, sortOrder: 3 }
        ]
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Sample Stores/Branches
const sampleStores = [
  {
    _id: "ST01",
    code: "ST01",
    name: { en: "Abosefen Main Store", ar: "المتجر الرئيسي لأبوسيفين" },
    type: "main",
    location: {
      address: { en: "123 Tahrir Square, Downtown", ar: "123 ميدان التحرير، وسط البلد" },
      city: { en: "Cairo", ar: "القاهرة" },
      governorate: { en: "Cairo", ar: "القاهرة" },
      postalCode: "11511",
      coordinates: { lat: 30.0444, lng: 31.2357 },
      phone: "+20-2-12345678",
      email: "main@abosefen.com"
    },
    manager: {
      name: "Ahmed Hassan",
      phone: "+20-100-1234567", 
      email: "ahmed.hassan@abosefen.com"
    },
    operatingHours: {
      weekdays: { open: "08:00", close: "22:00" },
      weekends: { open: "10:00", close: "20:00" },
      holidays: "10:00-18:00"
    },
    isActive: true,
    features: ["showroom", "warehouse", "service", "delivery"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "ST02",
    code: "ST02", 
    name: { en: "Abosefen Giza Branch", ar: "فرع أبوسيفين الجيزة" },
    type: "branch",
    location: {
      address: { en: "456 Pyramids Road, Giza", ar: "456 طريق الأهرام، الجيزة" },
      city: { en: "Giza", ar: "الجيزة" },
      governorate: { en: "Giza", ar: "الجيزة" },
      postalCode: "12511",
      coordinates: { lat: 30.0131, lng: 31.2089 },
      phone: "+20-2-87654321",
      email: "giza@abosefen.com"
    },
    manager: {
      name: "Fatma Ali",
      phone: "+20-100-7654321",
      email: "fatma.ali@abosefen.com"
    },
    operatingHours: {
      weekdays: { open: "09:00", close: "21:00" },
      weekends: { open: "10:00", close: "19:00" },
      holidays: "10:00-17:00"
    },
    isActive: true,
    features: ["showroom", "service"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "WH01",
    code: "WH01",
    name: { en: "Central Warehouse", ar: "المستودع المركزي" },
    type: "warehouse",
    location: {
      address: { en: "Industrial Zone, 6th October City", ar: "المنطقة الصناعية، مدينة 6 أكتوبر" },
      city: { en: "6th October", ar: "6 أكتوبر" },
      governorate: { en: "Giza", ar: "الجيزة" },
      postalCode: "12566",
      coordinates: { lat: 29.9097, lng: 30.9746 },
      phone: "+20-2-11223344",
      email: "warehouse@abosefen.com"
    },
    manager: {
      name: "Mohamed Saeed",
      phone: "+20-100-1122334",
      email: "mohamed.saeed@abosefen.com"
    },
    operatingHours: {
      weekdays: { open: "06:00", close: "18:00" },
      weekends: { open: "08:00", close: "14:00" },
      holidays: "Closed"
    },
    isActive: true,
    features: ["warehouse", "delivery"],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// ===== UTILITY FUNCTIONS FOR HIERARCHICAL CODING =====

// Generate next available product code
function generateProductCode(categoryCode, subcategoryCode, productTypeCode) {
  // This will be implemented to check existing products and generate next variant code
  return `${categoryCode}-${subcategoryCode}-${productTypeCode}-01`;
}

// Generate SKU with location
function generateSKU(categoryCode, subcategoryCode, productTypeCode, variantCode, storeCode) {
  return `${categoryCode}-${subcategoryCode}-${productTypeCode}-${variantCode}-${storeCode}`;
}

// Parse hierarchical code
function parseHierarchicalCode(code) {
  const parts = code.split('-');
  return {
    category: parts[0],
    subcategory: parts[1],
    productType: parts[2],
    variant: parts[3],
    store: parts[4] || null
  };
}

// Validate hierarchical code format
function validateHierarchicalCode(code) {
  const pattern = /^[A-Z]{2}-\d{2}-\d{3}-\d{2}(-[A-Z]{2}\d{2})?$/;
  return pattern.test(code);
}

// ===== END OF ENHANCED SCHEMAS =====

// Sample categories and products for fallback
const sampleCategories = [
  {
    _id: "bathroom-fittings",
    name: { en: "Bathroom Fittings", ar: "تجهيزات الحمام" },
    description: { en: "Complete range of bathroom fixtures and fittings", ar: "مجموعة كاملة من تجهيزات الحمام" },
    image: "/images/categories/BATHROOM_FITTINGS.jpg",
    isActive: true,
    sortOrder: 1
  },
  {
    _id: "kitchen-fittings", 
    name: { en: "Kitchen Fittings", ar: "تجهيزات المطبخ" },
    description: { en: "Kitchen sinks, faucets and accessories", ar: "أحواض وصنابير ومعدات المطبخ" },
    image: "/images/categories/KITCHEN_FITTINGS.jpg",
    isActive: true,
    sortOrder: 2
  },
  {
    _id: "bathtubs",
    name: { en: "Bathtubs", ar: "أحواض الاستحمام" },
    description: { en: "Luxury bathtubs and spa solutions", ar: "أحواض استحمام فاخرة وحلول سبا" },
    image: "/images/categories/BATHTUBS.jpg", 
    isActive: true,
    sortOrder: 3
  },
  {
    _id: "accessories",
    name: { en: "Bathroom Accessories", ar: "إكسسوارات الحمام" },
    description: { en: "Towel rails, mirrors and bathroom accessories", ar: "علاقات المناشف والمرايا وإكسسوارات الحمام" },
    image: "/images/categories/ACCESSORIES.jpg",
    isActive: true,
    sortOrder: 4
  },
  {
    _id: "ceramics",
    name: { en: "Ceramics & Tiles", ar: "السيراميك والبلاط" },
    description: { en: "Premium tiles and ceramic collections", ar: "مجموعات السيراميك والبلاط المميزة" },
    image: "/images/categories/CERAMIC.jpg",
    isActive: true,
    sortOrder: 5
  },
  {
    _id: "furniture",
    name: { en: "Bathroom Furniture", ar: "أثاث الحمام" },
    description: { en: "Vanity units and bathroom storage solutions", ar: "وحدات الحمام وحلول التخزين" },
    image: "/images/categories/FURNITURE.jpg",
    isActive: true,
    sortOrder: 6
  },
  {
    _id: "prewall-systems",
    name: { en: "Prewall Systems", ar: "أنظمة الجدران المسبقة" },
    description: { en: "Installation systems and prewall solutions", ar: "أنظمة التركيب والجدران المسبقة" },
    image: "/images/categories/PREWALL.jpg",
    isActive: true,
    sortOrder: 7
  }
];

const sampleProducts = [
  // Bathroom Fittings
  {
    _id: "bf-001",
    name: { en: "Premium Wall-Mounted Basin", ar: "حوض حائط فاخر" },
    slug: "premium-wall-mounted-basin",
    categoryId: "bathroom-fittings",
    sku: "BF-WMB-001",
    description: { 
      en: "Elegant wall-mounted ceramic basin with modern design",
      ar: "حوض سيراميك معلق بتصميم عصري أنيق" 
    },
    images: [
      {
        url: "/images/products/ceramic_sink.jpg",
        alt: { en: "Premium wall-mounted basin", ar: "حوض حائط فاخر" },
        isPrimary: true,
        sortOrder: 1
      }
    ],
    pricing: {
      originalPrice: 2500,
      salePrice: 2125,
      isOnSale: true,
      discountPercentage: 15,
      currency: "EGP"
    },
    inventory: {
      inStock: true,
      quantity: 25,
      lowStockThreshold: 5
    },
    rating: { average: 4.8, count: 32 },
    isActive: true,
    isFeatured: true
  },
  {
    _id: "bf-002", 
    name: { en: "Modern Single-Handle Faucet", ar: "صنبور عصري بيد واحدة" },
    slug: "modern-single-handle-faucet",
    categoryId: "bathroom-fittings",
    sku: "BF-MSH-002", 
    description: {
      en: "Premium single-handle bathroom faucet with ceramic cartridge",
      ar: "صنبور حمام فاخر بيد واحدة مع خرطوشة سيراميك"
    },
    images: [
      {
        url: "/images/products/mixer.jpg",
        alt: { en: "Modern single-handle faucet", ar: "صنبور عصري بيد واحدة" },
        isPrimary: true,
        sortOrder: 1
      }
    ],
    pricing: {
      originalPrice: 1200,
      salePrice: 996,
      isOnSale: true, 
      discountPercentage: 17,
      currency: "EGP"
    },
    inventory: {
      inStock: true,
      quantity: 18,
      lowStockThreshold: 5
    },
    rating: { average: 4.7, count: 28 },
    isActive: true,
    isFeatured: true
  },
  {
    _id: "bf-003",
    name: { en: "Premium Bathroom Sink Mixer", ar: "خلاط حوض حمام فاخر" },
    slug: "premium-bathroom-sink-mixer", 
    categoryId: "bathroom-fittings",
    sku: "BF-PSM-003",
    description: {
      en: "High-quality chrome-plated sink mixer with modern styling", 
      ar: "خلاط حوض عالي الجودة مطلي بالكروم بتصميم عصري"
    },
    images: [
      {
        url: "/images/products/kitchen_mixer.jpg",
        alt: { en: "Premium bathroom sink mixer", ar: "خلاط حوض حمام فاخر" },
        isPrimary: true,
        sortOrder: 1
      }
    ],
    pricing: {
      originalPrice: 1800,
      salePrice: 1800,
      isOnSale: false,
      currency: "EGP"
    },
    inventory: {
      inStock: true,
      quantity: 22,
      lowStockThreshold: 5
    },
    rating: { average: 4.6, count: 19 },
    isActive: true,
    isFeatured: false
  },

  // Kitchen Fittings
  {
    _id: "kf-001",
    name: { en: "Professional Kitchen Sink Mixer", ar: "خلاط مطبخ احترافي" },
    slug: "professional-kitchen-sink-mixer",
    categoryId: "kitchen-fittings", 
    sku: "KF-PKM-001",
    description: {
      en: "Professional-grade kitchen faucet with pull-out spray",
      ar: "صنبور مطبخ احترافي مع رشاش قابل للسحب"
    },
    images: [
      {
        url: "/images/products/kitchen_mixer.jpg", 
        alt: { en: "Professional kitchen mixer", ar: "خلاط مطبخ احترافي" },
        isPrimary: true,
        sortOrder: 1
      }
    ],
    pricing: {
      originalPrice: 2200,
      salePrice: 1870,
      isOnSale: true,
      discountPercentage: 15,
      currency: "EGP"
    },
    inventory: {
      inStock: true,
      quantity: 15,
      lowStockThreshold: 5
    },
    rating: { average: 4.9, count: 41 },
    isActive: true,
    isFeatured: true
  },
  {
    _id: "kf-002",
    name: { en: "Kitchen Sink Double Bowl", ar: "حوض مطبخ مزدوج" },
    slug: "kitchen-sink-double-bowl",
    categoryId: "kitchen-fittings",
    sku: "KF-KSD-002",
    description: {
      en: "Stainless steel double bowl kitchen sink with drainer",
      ar: "حوض مطبخ مزدوج من الستانلس ستيل مع مصفاة"
    },
    images: [
      {
        url: "/images/products/sink.jpg",
        alt: { en: "Kitchen sink double bowl", ar: "حوض مطبخ مزدوج" },
        isPrimary: true,
        sortOrder: 1
      }
    ],
    pricing: {
      originalPrice: 3500,
      salePrice: 3150,
      isOnSale: true,
      discountPercentage: 10,
      currency: "EGP"
    },
    inventory: {
      inStock: true,
      quantity: 12,
      lowStockThreshold: 3
    },
    rating: { average: 4.5, count: 23 },
    isActive: true,
    isFeatured: true
  },
  {
    _id: "kf-003",
    name: { en: "Pull-Out Kitchen Faucet", ar: "صنبور مطبخ قابل للسحب" },
    slug: "pull-out-kitchen-faucet",
    categoryId: "kitchen-fittings",
    sku: "KF-PKF-003", 
    description: {
      en: "Modern pull-out kitchen faucet with flexible hose",
      ar: "صنبور مطبخ عصري قابل للسحب مع خرطوم مرن"
    },
    images: [
      {
        url: "/images/products/mixer.jpg",
        alt: { en: "Pull-out kitchen faucet", ar: "صنبور مطبخ قابل للسحب" },
        isPrimary: true,
        sortOrder: 1
      }
    ],
    pricing: {
      originalPrice: 1600,
      salePrice: 1600, 
      isOnSale: false,
      currency: "EGP"
    },
    inventory: {
      inStock: true,
      quantity: 20,
      lowStockThreshold: 5
    },
    rating: { average: 4.4, count: 16 },
    isActive: true,
    isFeatured: false
  }
];

// Initialize database with sample data if empty
async function initializeDatabaseWithSampleData() {
  try {
    // Check if categories exist
    const categoryCount = await db.collection('categories').countDocuments();
    if (categoryCount === 0) {
      console.log('📂 No categories found, inserting sample categories...');
      await db.collection('categories').insertMany(sampleCategories);
      console.log('✅ Sample categories inserted successfully');
    }

    // Check if enhanced categories exist
    const enhancedCategoryCount = await db.collection('enhancedCategories').countDocuments();
    if (enhancedCategoryCount === 0) {
      console.log('🏗️ No enhanced categories found, inserting hierarchical categories...');
      await db.collection('enhancedCategories').insertMany(enhancedCategories);
      console.log('✅ Enhanced hierarchical categories inserted successfully');
    }

    // Check if stores exist
    const storeCount = await db.collection('stores').countDocuments();
    if (storeCount === 0) {
      console.log('🏪 No stores found, inserting sample stores...');
      await db.collection('stores').insertMany(sampleStores);
      console.log('✅ Sample stores inserted successfully');
    }

    // Check if products exist
    const productCount = await db.collection('products').countDocuments();
    if (productCount === 0) {
      console.log('🛍️ No products found, inserting sample products...');
      await db.collection('products').insertMany(sampleProducts);
      console.log('✅ Sample products inserted successfully');
    }
    
    // Initialize automation rules collection
    const automationCount = await db.collection('automationRules').countDocuments();
    if (automationCount === 0) {
      console.log('🤖 Initializing automation rules...');
      const defaultAutomationRules = [
        {
          _id: 'low-stock-alert',
          name: 'Low Stock Alert',
          type: 'low-stock-alert',
          isActive: true,
          conditions: [
            {
              field: 'inventory.totalAvailable',
              operator: 'lte',
              value: 5
            }
          ],
          actions: [
            {
              type: 'send-notification',
              parameters: {
                type: 'email',
                template: 'low-stock-alert',
                recipients: ['admin@abosefen.com']
              }
            }
          ],
          lastExecuted: null,
          executionCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: 'auto-reorder',
          name: 'Auto Reorder Products',
          type: 'auto-reorder',
          isActive: false, // Disabled by default
          conditions: [
            {
              field: 'inventory.totalAvailable',
              operator: 'lte',
              value: 3
            },
            {
              field: 'inventory.autoReorder',
              operator: 'eq',
              value: true
            }
          ],
          actions: [
            {
              type: 'create-purchase-order',
              parameters: {
                orderTemplate: 'auto-reorder'
              }
            }
          ],
          lastExecuted: null,
          executionCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      await db.collection('automationRules').insertMany(defaultAutomationRules);
      console.log('✅ Default automation rules created');
    }
    
    console.log(`📊 Database status: ${categoryCount} categories, ${enhancedCategoryCount} enhanced categories, ${storeCount} stores, ${productCount} products`);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
}

// Connect to MongoDB and start server
async function startServer() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log('📍 MongoDB URI:', MONGO_URI);
    console.log('📍 Database Name:', DB_NAME);
    const client = await MongoClient.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB - Product Service');
    db = client.db(DB_NAME);
    
    // Initialize with sample data if database is empty
    await initializeDatabaseWithSampleData();
    
    // Initialize smart search service
    // try {
    //   smartSearchService = new SmartSearchService(db);
    //   console.log('🔍 Smart search service initialized');
    // } catch (error) {
    //   console.error('⚠️ Smart search service initialization failed:', error.message);
    // }
    
    // Initialize recommendation service
    try {
      recommendationService = new RecommendationService(db);
      console.log('🎯 Recommendation service initialized');
    } catch (error) {
      console.error('⚠️ Recommendation service initialization failed:', error.message);
      console.log('⚠️ Recommendations will use fallback logic');
    }
    
    // Start the server only after MongoDB is connected
    app.listen(PORT, () => {
      console.log(`🛍️ Product Service running on port ${PORT}`);
      console.log(`📱 Health check: http://localhost:${PORT}/health`);
      console.log(`📂 Categories: http://localhost:${PORT}/categories`);
      console.log(`🛍️ Products: http://localhost:${PORT}/products`);
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Routes will be defined below, then server will start

// 🏠 Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'product-service',
    timestamp: new Date().toISOString() 
  });
});

// 🌟 Test endpoint for featured products (placed early to avoid route conflicts)
app.get('/products/test-featured', async (req, res) => {
  try {
    console.log('🔥 Testing featured products endpoint...');
    
    const products = await db.collection('products')
      .find({ 
        isActive: true, 
        isFeatured: true,  // Use consistent field name
        'inventory.inStock': true 
      })
      .sort({ 'rating.average': -1, createdAt: -1 })
      .limit(8)
      .toArray();
    
    console.log(`🔥 Found ${products.length} featured products`);
    
    res.json({
      success: true,
      products,
      total: products.length,
      message: 'Featured products retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error in test featured products:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch featured products' 
    });
  }
});

// 🌟 Featured products endpoint (called by frontend)
app.get('/products/featured', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ 
        success: false, 
        error: 'Database not connected' 
      });
    }

    const { limit = 8 } = req.query;
    
    const products = await db.collection('products')
      .find({ 
        isActive: true, 
        isFeatured: true,
        'inventory.inStock': true 
      })
      .sort({ 'rating.average': -1, createdAt: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    console.log(`✅ Found ${products.length} featured products`);
    
    res.json({
      success: true,
      products,
      total: products.length,
      message: 'Featured products retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching featured products:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch featured products' 
    });
  }
});

// 📈 Trending products endpoint (called by frontend)
app.get('/products/trending', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ 
        success: false, 
        error: 'Database not connected' 
      });
    }

    const { limit = 6 } = req.query;
    
    // For now, return highest rated products as trending
    const products = await db.collection('products')
      .find({ 
        isActive: true,
        'inventory.inStock': true 
      })
      .sort({ 'rating.average': -1, 'rating.count': -1 })
      .limit(parseInt(limit))
      .toArray();
    
    console.log(`✅ Found ${products.length} trending products`);
    
    res.json({
      success: true,
      products,
      total: products.length,
      message: 'Trending products retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching trending products:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch trending products' 
    });
  }
});

// 💎 Categories endpoint
app.get('/categories', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ 
        success: false, 
        error: 'Database not connected' 
      });
    }

    const categories = await db.collection('categories')
      .find({ isActive: true })
      .sort({ sortOrder: 1 })
      .toArray();
    
    res.json({
      success: true,
      categories,
      total: categories.length
    });
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch categories' 
    });
  }
});

// 📂 Get category by slug
app.get('/categories/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const category = await db.collection('categories')
      .findOne({ slug, isActive: true });
    
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        error: 'Category not found' 
      });
    }
    
    res.json({
      success: true,
      category
    });
  } catch (error) {
    console.error('❌ Error fetching category:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch category' 
    });
  }
});

// 📂 Get all products
app.get('/products', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      search,
      inStock = true
    } = req.query;
    
    let query = { isActive: true };
    
    if (category) {
      query.categoryId = category;
    }
    
    if (search) {
      query.$or = [
        { 'name.en': { $regex: search, $options: 'i' } },
        { 'name.ar': { $regex: search, $options: 'i' } },
        { 'description.en': { $regex: search, $options: 'i' } },
        { 'description.ar': { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (inStock === 'true') {
      query['inventory.inStock'] = true;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    
    const products = await db.collection('products')
      .find(query)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await db.collection('products').countDocuments(query);
    
    res.json({
      success: true,
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        hasNext: skip + products.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch products' 
    });
  }
});

// 🎯 Get products by category
app.get('/products/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;
    
    // Get category info
    const category = await db.collection('categories').findOne({ _id: categoryId });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    
    const products = await db.collection('products')
      .find({ 
        categoryId: categoryId,
        isActive: true,
        'inventory.inStock': true
      })
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await db.collection('products').countDocuments({ 
      categoryId: categoryId,
      isActive: true 
    });
    
    res.json({
      success: true,
      category,
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        hasNext: skip + products.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('❌ Error fetching category products:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch category products' 
    });
  }
});

// 🔍 Get product details by slug
app.get('/products/details/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const product = await db.collection('products').findOne({ 
      slug: slug,
      isActive: true 
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    // Get category info
    const category = await db.collection('categories').findOne({ _id: product.categoryId });
    
    // Get related products (same category, excluding current product)
    const relatedProducts = await db.collection('products')
      .find({ 
        categoryId: product.categoryId,
        _id: { $ne: product._id },
        isActive: true,
        'inventory.inStock': true
      })
      .limit(4)
      .toArray();
    
    res.json({
      success: true,
      product: {
        ...product,
        category
      },
      relatedProducts
    });
  } catch (error) {
    console.error('❌ Error fetching product details:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch product details' 
    });
  }
});

// 🔍 Search products (legacy endpoint)
app.get('/products/search', async (req, res) => {
  try {
    const { q, category, sortBy = 'relevance', limit = 20, page = 1 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    // Simple search using direct database query
    const searchTerm = q.toLowerCase().trim();
    const searchLimit = parseInt(limit);
    const skip = (parseInt(page) - 1) * searchLimit;
    
    // Build search filter
    const searchFilter = {
      isActive: true,
      $or: [
        { 'name.en': { $regex: searchTerm, $options: 'i' } },
        { 'description.en': { $regex: searchTerm, $options: 'i' } }
      ]
    };

    // Add category filter if provided
    if (category) {
      searchFilter.categoryId = category;
    }

    // Build sort criteria
    let sortCriteria = {};
    switch (sortBy) {
      case 'price_low':
        sortCriteria = { 'pricing.salePrice': 1, 'pricing.originalPrice': 1 };
        break;
      case 'price_high':
        sortCriteria = { 'pricing.salePrice': -1, 'pricing.originalPrice': -1 };
        break;
      case 'rating':
        sortCriteria = { 'rating.average': -1 };
        break;
      case 'newest':
        sortCriteria = { createdAt: -1 };
        break;
      default:
        sortCriteria = { featured: -1, 'rating.average': -1 };
    }

    // Get products and total count
    const [products, totalCount] = await Promise.all([
      db.collection('products')
        .find(searchFilter)
        .sort(sortCriteria)
        .skip(skip)
        .limit(searchLimit)
        .toArray(),
      db.collection('products').countDocuments(searchFilter)
    ]);

    res.json({
      success: true,
      products: products,
      total: totalCount,
      suggestions: []
    });
  } catch (error) {
    console.error('❌ Error in product search:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to search products' 
    });
  }
});

// 🎯 Smart search - working version based on search endpoint
app.get('/products/smart-search', async (req, res) => {
  try {
    const { q, category, sortBy = 'relevance', limit = 20, page = 1 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    // Simple search using direct database query
    const searchTerm = q.toLowerCase().trim();
    const searchLimit = parseInt(limit);
    const skip = (parseInt(page) - 1) * searchLimit;
    
    // Build search filter
    const searchFilter = {
      isActive: true,
      $or: [
        { 'name.en': { $regex: searchTerm, $options: 'i' } },
        { 'description.en': { $regex: searchTerm, $options: 'i' } }
      ]
    };

    // Add category filter if provided
    if (category) {
      searchFilter.categoryId = category;
    }

    // Build sort criteria
    let sortCriteria = {};
    switch (sortBy) {
      case 'price_low':
        sortCriteria = { 'pricing.salePrice': 1, 'pricing.originalPrice': 1 };
        break;
      case 'price_high':
        sortCriteria = { 'pricing.salePrice': -1, 'pricing.originalPrice': -1 };
        break;
      case 'rating':
        sortCriteria = { 'rating.average': -1 };
        break;
      case 'newest':
        sortCriteria = { createdAt: -1 };
        break;
      default:
        sortCriteria = { featured: -1, 'rating.average': -1 };
    }

    // Get products and total count
    const [products, totalCount] = await Promise.all([
      db.collection('products')
        .find(searchFilter)
        .sort(sortCriteria)
        .skip(skip)
        .limit(searchLimit)
        .toArray(),
      db.collection('products').countDocuments(searchFilter)
    ]);

    res.json({
      success: true,
      results: products,
      totalFound: totalCount,
      suggestions: []
    });
  } catch (error) {
    console.error('❌ Error in smart search:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to perform smart search' 
    });
  }
});

// 🔮 Auto-complete for search
app.get('/products/autocomplete', async (req, res) => {
  try {
    const { q, limit = 8 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.json({
        success: true,
        suggestions: []
      });
    }

    // Improved autocomplete with better matching logic
    const searchTerm = q.toLowerCase().trim();
    const suggestions = await db.collection('products').aggregate([
      {
        $match: {
          isActive: true,
          $or: [
            // Prioritize matches at the beginning of product names
            { 'name.en': { $regex: `^${searchTerm}`, $options: 'i' } },
            // Then matches at the beginning of words in product names
            { 'name.en': { $regex: `\\b${searchTerm}`, $options: 'i' } },
            // Finally, matches in descriptions (lower priority)
            { 'description.en': { $regex: `\\b${searchTerm}`, $options: 'i' } }
          ]
        }
      },
      {
        $addFields: {
          // Add scoring for better relevance
          score: {
            $switch: {
              branches: [
                { case: { $regexMatch: { input: '$name.en', regex: `^${searchTerm}`, options: 'i' } }, then: 3 },
                { case: { $regexMatch: { input: '$name.en', regex: `\\b${searchTerm}`, options: 'i' } }, then: 2 },
                { case: { $regexMatch: { input: '$description.en', regex: `\\b${searchTerm}`, options: 'i' } }, then: 1 }
              ],
              default: 0
            }
          }
        }
      },
      { $sort: { score: -1, 'name.en': 1 } },
      {
        $project: {
          suggestion: '$name.en',
          type: 'product'
        }
      },
      { $limit: parseInt(limit) }
    ]).toArray();
    
    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('❌ Error in autocomplete:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get autocomplete suggestions' 
    });
  }
});

// 📈 Get trending searches - simplified version
app.get('/products/trending', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    // For now, return highest rated products as trending
    const trendingProducts = await db.collection('products')
      .find({ 
        isActive: true,
        'inventory.inStock': true 
      })
      .sort({ 'rating.average': -1, 'rating.count': -1 })
      .limit(parseInt(limit))
      .toArray();
    
    // Convert to search terms format for frontend compatibility
    const trending = trendingProducts.map(product => ({
      term: product.name.en,
      count: product.rating.count || 0
    }));
    
    res.json({
      success: true,
      trending: trending
    });
  } catch (error) {
    console.error('❌ Error fetching trending searches:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch trending searches' 
    });
  }
});

// ⭐ Get featured products
app.get('/products/featured', async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const products = await db.collection('products')
      .find({ 
        isActive: true, 
        isFeatured: true,
        'inventory.inStock': true 
      })
      .sort({ 'rating.average': -1, createdAt: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    res.json({
      success: true,
      products,
      total: products.length
    });
  } catch (error) {
    console.error('❌ Error fetching featured products:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch featured products' 
    });
  }
});

// 🔥 Get sale products
app.get('/products/sale', async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const products = await db.collection('products')
      .find({ 
        isActive: true, 
        'pricing.isOnSale': true,
        'inventory.inStock': true 
      })
      .sort({ 'pricing.discountPercentage': -1, createdAt: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    res.json({
      success: true,
      products,
      total: products.length
    });
  } catch (error) {
    console.error('❌ Error fetching sale products:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch sale products' 
    });
  }
});

// 🎯 Get personalized recommendations
app.get('/products/recommendations/personalized', async (req, res) => {
  try {
    const { userId, limit = 8 } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    if (!recommendationService) {
      // Fallback: return featured products when recommendation service is not available
      console.log('⚠️ Recommendation service not available, using fallback logic');
      
      if (!db) {
        return res.status(503).json({ 
          success: false, 
          error: 'Database not connected' 
        });
      }

      const fallbackProducts = await db.collection('products')
        .find({ 
          isActive: true, 
          isFeatured: true,
          'inventory.inStock': true 
        })
        .sort({ 'rating.average': -1, createdAt: -1 })
        .limit(parseInt(limit))
        .toArray();
      
      return res.json({
        success: true,
        recommendations: fallbackProducts,
        total: fallbackProducts.length,
        message: 'Personalized recommendations (fallback mode)'
      });
    }
    
    const recommendations = await recommendationService.getPersonalizedRecommendations(userId, parseInt(limit));
    
    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('❌ Error fetching personalized recommendations:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch personalized recommendations' 
    });
  }
});

// 🎯 Get related products
app.get('/products/:productId/related', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 6 } = req.query;

    if (!recommendationService) {
      return res.status(503).json({ 
        success: false, 
        error: 'Recommendation service not available' 
      });
    }
    
    const relatedProducts = await recommendationService.getRelatedProducts(productId, parseInt(limit));
    
    res.json({
      success: true,
      relatedProducts
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch related products' 
    });
  }
});

// 🛍️ Get frequently bought together
app.get('/products/:productId/frequently-bought-together', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 4 } = req.query;

    if (!recommendationService) {
      return res.status(503).json({ 
        success: false, 
        error: 'Recommendation service not available' 
      });
    }
    
    const frequentlyBoughtTogether = await recommendationService.getFrequentlyBoughtTogether(productId, parseInt(limit));
    
    res.json({
      success: true,
      frequentlyBoughtTogether
    });
  } catch (error) {
    console.error('❌ Error fetching frequently bought together:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch frequently bought together' 
    });
  }
});

// 📦 Get product bundles
app.get('/products/:productId/bundles', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 3 } = req.query;

    if (!recommendationService) {
      return res.status(503).json({ 
        success: false, 
        error: 'Recommendation service not available' 
      });
    }
    
    const bundles = await recommendationService.getSmartBundles(productId, parseInt(limit));
    
    res.json({
      success: true,
      bundles
    });
  } catch (error) {
    console.error('❌ Error fetching product bundles:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch product bundles' 
    });
  }
});

// 🔍 Get similar products
app.get('/products/:productId/similar', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 6 } = req.query;

    if (!recommendationService) {
      return res.status(503).json({ 
        success: false, 
        error: 'Recommendation service not available' 
      });
    }
    
    const similarProducts = await recommendationService.getRelatedProducts(productId, parseInt(limit));
    
    res.json({
      success: true,
      similarProducts
    });
  } catch (error) {
    console.error('❌ Error fetching similar products:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch similar products' 
    });
  }
});

// 📊 Track user interaction
app.post('/products/:productId/interaction', async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId, interactionType } = req.body;

    if (!recommendationService) {
      return res.status(503).json({ 
        success: false, 
        error: 'Recommendation service not available' 
      });
    }
    
    await recommendationService.trackUserInteraction(userId, productId, interactionType);
    
    res.json({
      success: true,
      message: 'Interaction tracked successfully'
    });
  } catch (error) {
    console.error('❌ Error tracking interaction:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to track interaction' 
    });
  }
});

// 📊 Get product statistics
app.get('/stats/products', async (req, res) => {
  try {
    const totalProducts = await db.collection('products')
      .countDocuments({ isActive: true });
    
    const inStockProducts = await db.collection('products')
      .countDocuments({ 
        isActive: true, 
        'inventory.inStock': true 
      });
    
    const featuredProducts = await db.collection('products')
      .countDocuments({ 
        isActive: true, 
        isFeatured: true 
      });
    
    const onSaleProducts = await db.collection('products')
      .countDocuments({ 
        isActive: true, 
        'pricing.isOnSale': true 
      });
    
    const categoryStats = await db.collection('products').aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
      { $lookup: { 
        from: 'categories', 
        localField: '_id', 
        foreignField: '_id', 
        as: 'category' 
      }},
      { $unwind: '$category' },
      { $project: { 
        categoryName: '$category.name.en',
        count: 1 
      }}
    ]).toArray();
    
    res.json({
      success: true,
      stats: {
        totalProducts,
        inStockProducts,
        featuredProducts,
        onSaleProducts,
        categoryBreakdown: categoryStats
      }
    });
  } catch (error) {
    console.error('❌ Error fetching product stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch product statistics' 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// ===== PRODUCT MANAGEMENT ENDPOINTS (ADMIN) =====

// Create new product
app.post('/products', async (req, res) => {
  try {
    console.log('Creating new product:', req.body);
    
    const product = {
      ...req.body,
      _id: req.body.sku || `product_${Date.now()}`, // Use SKU or generate ID
      slug: req.body.name.en.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      sales: 0,
      rating: {
        average: 0,
        count: 0,
        reviews: []
      }
    };

    const result = await db.collection('products').insertOne(product);
    
    if (result.acknowledged) {
      res.json({
        success: true,
        message: 'Product created successfully',
        product: { ...product, _id: result.insertedId }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to create product'
      });
    }
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update existing product
app.put('/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    console.log('Updating product:', productId, req.body);
    
    const updateData = {
      ...req.body,
      updatedAt: new Date(),
      slug: req.body.name?.en ? req.body.name.en.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') : undefined
    };
    
    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const result = await db.collection('products').updateOne(
      { _id: productId },
      { $set: updateData }
    );
    
    if (result.matchedCount > 0) {
      const updatedProduct = await db.collection('products').findOne({ _id: productId });
      res.json({
        success: true,
        message: 'Product updated successfully',
        product: updatedProduct
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete product
app.delete('/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    console.log('Deleting product:', productId);
    
    const result = await db.collection('products').deleteOne({ _id: productId });
    
    if (result.deletedCount > 0) {
      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single product by ID
app.get('/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    console.log('Getting product by ID:', productId);
    
    const product = await db.collection('products').findOne({ _id: productId });
    
    if (product) {
      res.json({
        success: true,
        product: product
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Bulk operations for products
app.post('/products/bulk', async (req, res) => {
  try {
    const { action, productIds } = req.body;
    console.log('Bulk operation:', action, 'on products:', productIds);
    
    let result;
    
    switch (action) {
      case 'delete':
        result = await db.collection('products').deleteMany({ 
          _id: { $in: productIds } 
        });
        res.json({
          success: true,
          message: `${result.deletedCount} products deleted`,
          deletedCount: result.deletedCount
        });
        break;
        
      case 'activate':
        result = await db.collection('products').updateMany(
          { _id: { $in: productIds } },
          { $set: { isActive: true, updatedAt: new Date() } }
        );
        res.json({
          success: true,
          message: `${result.modifiedCount} products activated`,
          modifiedCount: result.modifiedCount
        });
        break;
        
      case 'deactivate':
        result = await db.collection('products').updateMany(
          { _id: { $in: productIds } },
          { $set: { isActive: false, updatedAt: new Date() } }
        );
        res.json({
          success: true,
          message: `${result.modifiedCount} products deactivated`,
          modifiedCount: result.modifiedCount
        });
        break;
        
      default:
        res.status(400).json({
          success: false,
          message: 'Invalid bulk action'
        });
    }
  } catch (error) {
    console.error('Error in bulk operation:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ===== END PRODUCT MANAGEMENT ENDPOINTS =====

// ===== STORES & BRANCHES MANAGEMENT =====

// Get all stores
app.get('/stores', async (req, res) => {
  try {
    const { type, isActive = true } = req.query;
    
    let query = {};
    if (type) query.type = type;
    if (isActive !== 'all') query.isActive = isActive === 'true';
    
    const stores = await db.collection('stores')
      .find(query)
      .sort({ sortOrder: 1, 'name.en': 1 })
      .toArray();
    
    res.json({
      success: true,
      stores
    });
  } catch (error) {
    console.error('❌ Error fetching stores:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stores' });
  }
});

// Get single store
app.get('/stores/:id', async (req, res) => {
  try {
    const store = await db.collection('stores').findOne({ _id: req.params.id });
    
    if (!store) {
      return res.status(404).json({ success: false, error: 'Store not found' });
    }
    
    res.json({ success: true, store });
  } catch (error) {
    console.error('❌ Error fetching store:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch store' });
  }
});

// Create new store
app.post('/stores', async (req, res) => {
  try {
    const store = {
      ...req.body,
      _id: req.body.code,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('stores').insertOne(store);
    
    res.json({
      success: true,
      message: 'Store created successfully',
      store
    });
  } catch (error) {
    console.error('❌ Error creating store:', error);
    res.status(500).json({ success: false, error: 'Failed to create store' });
  }
});

// Update store
app.put('/stores/:id', async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    const result = await db.collection('stores').updateOne(
      { _id: req.params.id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: 'Store not found' });
    }
    
    const store = await db.collection('stores').findOne({ _id: req.params.id });
    
    res.json({
      success: true,
      message: 'Store updated successfully',
      store
    });
  } catch (error) {
    console.error('❌ Error updating store:', error);
    res.status(500).json({ success: false, error: 'Failed to update store' });
  }
});

// ===== ENHANCED CATEGORIES WITH HIERARCHICAL STRUCTURE =====

// Get enhanced categories with full hierarchy
app.get('/enhanced-categories', async (req, res) => {
  try {
    const categories = await db.collection('enhancedCategories')
      .find({ isActive: true })
      .sort({ sortOrder: 1 })
      .toArray();
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('❌ Error fetching enhanced categories:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch enhanced categories' });
  }
});

// Get subcategories for a category
app.get('/enhanced-categories/:categoryId/subcategories', async (req, res) => {
  try {
    const category = await db.collection('enhancedCategories')
      .findOne({ _id: req.params.categoryId });
    
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    
    res.json({
      success: true,
      subcategories: category.subcategories || []
    });
  } catch (error) {
    console.error('❌ Error fetching subcategories:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch subcategories' });
  }
});

// Get product types for a subcategory
app.get('/enhanced-categories/:categoryId/:subcategoryId/product-types', async (req, res) => {
  try {
    const { categoryId, subcategoryId } = req.params;
    
    const category = await db.collection('enhancedCategories')
      .findOne({ _id: categoryId });
    
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    
    const subcategory = category.subcategories?.find(sub => sub._id === subcategoryId);
    
    if (!subcategory) {
      return res.status(404).json({ success: false, error: 'Subcategory not found' });
    }
    
    res.json({
      success: true,
      productTypes: subcategory.productTypes || []
    });
  } catch (error) {
    console.error('❌ Error fetching product types:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch product types' });
  }
});

// ===== SUPPLIER MANAGEMENT =====

// Get all suppliers
app.get('/suppliers', async (req, res) => {
  try {
    const { isActive = true, search } = req.query;
    
    let query = {};
    if (isActive !== 'all') query.isActive = isActive === 'true';
    
    if (search) {
      query.$or = [
        { 'name.en': { $regex: search, $options: 'i' } },
        { 'name.ar': { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }
    
    const suppliers = await db.collection('suppliers')
      .find(query)
      .sort({ 'name.en': 1 })
      .toArray();
    
    res.json({
      success: true,
      suppliers
    });
  } catch (error) {
    console.error('❌ Error fetching suppliers:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch suppliers' });
  }
});

// Create supplier
app.post('/suppliers', async (req, res) => {
  try {
    const supplier = {
      ...req.body,
      _id: req.body.code,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection('suppliers').insertOne(supplier);
    
    res.json({
      success: true,
      message: 'Supplier created successfully',
      supplier
    });
  } catch (error) {
    console.error('❌ Error creating supplier:', error);
    res.status(500).json({ success: false, error: 'Failed to create supplier' });
  }
});

// ===== PURCHASE ORDER MANAGEMENT =====

// Get all purchase orders
app.get('/purchase-orders', async (req, res) => {
  try {
    const { status, supplierId, storeId, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (supplierId) query.supplierId = supplierId;
    if (storeId) query.storeId = storeId;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const orders = await db.collection('purchaseOrders')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await db.collection('purchaseOrders').countDocuments(query);
    
    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalOrders: total
      }
    });
  } catch (error) {
    console.error('❌ Error fetching purchase orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch purchase orders' });
  }
});

// Create purchase order
app.post('/purchase-orders', async (req, res) => {
  try {
    const orderNumber = `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    const purchaseOrder = {
      ...req.body,
      _id: orderNumber,
      orderNumber,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection('purchaseOrders').insertOne(purchaseOrder);
    
    res.json({
      success: true,
      message: 'Purchase order created successfully',
      purchaseOrder
    });
  } catch (error) {
    console.error('❌ Error creating purchase order:', error);
    res.status(500).json({ success: false, error: 'Failed to create purchase order' });
  }
});

// Update purchase order status
app.patch('/purchase-orders/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const updateData = {
      status,
      updatedAt: new Date()
    };
    
    if (notes) updateData.notes = notes;
    if (status === 'received') updateData.actualDeliveryDate = new Date();
    
    const result = await db.collection('purchaseOrders').updateOne(
      { _id: req.params.id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: 'Purchase order not found' });
    }
    
    res.json({
      success: true,
      message: 'Purchase order status updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating purchase order:', error);
    res.status(500).json({ success: false, error: 'Failed to update purchase order' });
  }
});

// ===== MULTI-LOCATION INVENTORY MANAGEMENT =====

// Get inventory by store
app.get('/inventory/by-store/:storeId', async (req, res) => {
  try {
    const { storeId } = req.params;
    const { lowStock = false } = req.query;
    
    let matchQuery = {
      'inventory.multiLocation': {
        $elemMatch: { storeId: storeId }
      }
    };
    
    if (lowStock === 'true') {
      matchQuery['inventory.multiLocation'] = {
        $elemMatch: {
          storeId: storeId,
          $expr: { $lte: ['$available', '$lowStockThreshold'] }
        }
      };
    }
    
    const products = await db.collection('products').aggregate([
      { $match: matchQuery },
      {
        $addFields: {
          storeInventory: {
            $arrayElemAt: [
              {
                $filter: {
                  input: '$inventory.multiLocation',
                  cond: { $eq: ['$$this.storeId', storeId] }
                }
              },
              0
            ]
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          hierarchicalCode: 1,
          images: { $slice: ['$images', 1] },
          pricing: 1,
          storeInventory: 1
        }
      }
    ]).toArray();
    
    res.json({
      success: true,
      storeId,
      products
    });
  } catch (error) {
    console.error('❌ Error fetching store inventory:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch store inventory' });
  }
});

// Update inventory for specific store
app.patch('/inventory/:productId/store/:storeId', async (req, res) => {
  try {
    const { productId, storeId } = req.params;
    const { quantity, reserved = 0, lowStockThreshold } = req.body;
    
    const available = quantity - reserved;
    
    const updateData = {
      'inventory.multiLocation.$.quantity': quantity,
      'inventory.multiLocation.$.reserved': reserved,
      'inventory.multiLocation.$.available': available,
      'inventory.multiLocation.$.lastUpdated': new Date()
    };
    
    if (lowStockThreshold !== undefined) {
      updateData['inventory.multiLocation.$.lowStockThreshold'] = lowStockThreshold;
    }
    
    const result = await db.collection('products').updateOne(
      {
        _id: productId,
        'inventory.multiLocation.storeId': storeId
      },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: 'Product or store not found' });
    }
    
    // Recalculate total inventory
    const product = await db.collection('products').findOne({ _id: productId });
    const totalQuantity = product.inventory.multiLocation.reduce((sum, loc) => sum + loc.quantity, 0);
    const totalReserved = product.inventory.multiLocation.reduce((sum, loc) => sum + loc.reserved, 0);
    const totalAvailable = totalQuantity - totalReserved;
    
    await db.collection('products').updateOne(
      { _id: productId },
      {
        $set: {
          'inventory.totalQuantity': totalQuantity,
          'inventory.totalReserved': totalReserved,
          'inventory.totalAvailable': totalAvailable,
          'inventory.inStock': totalAvailable > 0
        }
      }
    );
    
    res.json({
      success: true,
      message: 'Inventory updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating inventory:', error);
    res.status(500).json({ success: false, error: 'Failed to update inventory' });
  }
});

// ===== AUTOMATION RULES MANAGEMENT =====

// Get automation rules
app.get('/automation-rules', async (req, res) => {
  try {
    const rules = await db.collection('automationRules')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({
      success: true,
      rules
    });
  } catch (error) {
    console.error('❌ Error fetching automation rules:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch automation rules' });
  }
});

// Toggle automation rule
app.patch('/automation-rules/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    
    const rule = await db.collection('automationRules').findOne({ _id: id });
    
    if (!rule) {
      return res.status(404).json({ success: false, error: 'Automation rule not found' });
    }
    
    const newStatus = !rule.isActive;
    
    await db.collection('automationRules').updateOne(
      { _id: id },
      {
        $set: {
          isActive: newStatus,
          updatedAt: new Date()
        }
      }
    );
    
    res.json({
      success: true,
      message: `Automation rule ${newStatus ? 'enabled' : 'disabled'} successfully`,
      isActive: newStatus
    });
  } catch (error) {
    console.error('❌ Error toggling automation rule:', error);
    res.status(500).json({ success: false, error: 'Failed to toggle automation rule' });
  }
});

// Execute automation rules (can be called by cron job)
app.post('/automation-rules/execute', async (req, res) => {
  try {
    const activeRules = await db.collection('automationRules')
      .find({ isActive: true })
      .toArray();
    
    const executionResults = [];
    
    for (const rule of activeRules) {
      try {
        // Execute rule based on type
        switch (rule.type) {
          case 'low-stock-alert':
            const lowStockProducts = await db.collection('products').find({
              'inventory.totalAvailable': { $lte: rule.conditions[0].value }
            }).toArray();
            
            if (lowStockProducts.length > 0) {
              // Here you would send actual notifications
              console.log(`🔔 Low stock alert: ${lowStockProducts.length} products need attention`);
              
              await db.collection('automationRules').updateOne(
                { _id: rule._id },
                {
                  $set: {
                    lastExecuted: new Date(),
                    executionCount: rule.executionCount + 1
                  }
                }
              );
              
              executionResults.push({
                ruleId: rule._id,
                success: true,
                message: `Low stock alert sent for ${lowStockProducts.length} products`
              });
            }
            break;
            
          case 'auto-reorder':
            // Auto-reorder logic would go here
            executionResults.push({
              ruleId: rule._id,
              success: true,
              message: 'Auto-reorder rule checked (no action needed)'
            });
            break;
        }
      } catch (error) {
        executionResults.push({
          ruleId: rule._id,
          success: false,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: 'Automation rules executed',
      results: executionResults
    });
  } catch (error) {
    console.error('❌ Error executing automation rules:', error);
    res.status(500).json({ success: false, error: 'Failed to execute automation rules' });
  }
});

// ===== HIERARCHICAL PRODUCT CODE MANAGEMENT =====

// Generate next available product code
app.post('/hierarchical-codes/generate', async (req, res) => {
  try {
    const { categoryCode, subcategoryCode, productTypeCode } = req.body;
    
    if (!categoryCode || !subcategoryCode || !productTypeCode) {
      return res.status(400).json({
        success: false,
        error: 'Category code, subcategory code, and product type code are required'
      });
    }
    
    // Find the next available variant code
    const existingProducts = await db.collection('products').find({
      'hierarchicalCode.category': categoryCode,
      'hierarchicalCode.subcategory': subcategoryCode,
      'hierarchicalCode.productType': productTypeCode
    }).toArray();
    
    const existingVariants = existingProducts.map(p => parseInt(p.hierarchicalCode.variant));
    const nextVariant = existingVariants.length > 0 ? Math.max(...existingVariants) + 1 : 1;
    const variantCode = String(nextVariant).padStart(2, '0');
    
    const fullCode = `${categoryCode}-${subcategoryCode}-${productTypeCode}-${variantCode}`;
    
    res.json({
      success: true,
      hierarchicalCode: {
        category: categoryCode,
        subcategory: subcategoryCode,
        productType: productTypeCode,
        variant: variantCode,
        full: fullCode
      }
    });
  } catch (error) {
    console.error('❌ Error generating hierarchical code:', error);
    res.status(500).json({ success: false, error: 'Failed to generate hierarchical code' });
  }
});

// Validate hierarchical code
app.post('/hierarchical-codes/validate', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Code is required'
      });
    }
    
    const isValid = validateHierarchicalCode(code);
    
    if (isValid) {
      const parsed = parseHierarchicalCode(code);
      
      // Check if code already exists
      const existingProduct = await db.collection('products').findOne({
        'hierarchicalCode.full': code
      });
      
      res.json({
        success: true,
        valid: true,
        parsed,
        exists: !!existingProduct
      });
    } else {
      res.json({
        success: true,
        valid: false,
        error: 'Invalid hierarchical code format'
      });
    }
  } catch (error) {
    console.error('❌ Error validating hierarchical code:', error);
    res.status(500).json({ success: false, error: 'Failed to validate hierarchical code' });
  }
});

// ===== ADVANCED ANALYTICS =====

// Get comprehensive dashboard analytics
app.get('/analytics/dashboard', async (req, res) => {
  try {
    const { startDate, endDate, storeId } = req.query;
    
    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    // Product analytics
    const productStats = await db.collection('products').aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          featuredProducts: {
            $sum: { $cond: [{ $eq: ['$isFeatured', true] }, 1, 0] }
          },
          totalInventoryValue: {
            $sum: {
              $multiply: [
                '$pricing.originalPrice',
                '$inventory.totalQuantity'
              ]
            }
          }
        }
      }
    ]).toArray();
    
    // Low stock products
    const lowStockProducts = await db.collection('products').countDocuments({
      'inventory.totalAvailable': { $lte: 5 }
    });
    
    // Category breakdown
    const categoryBreakdown = await db.collection('products').aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          categoryName: '$category.name.en',
          count: 1
        }
      }
    ]).toArray();
    
    // Store inventory breakdown (if storeId provided)
    let storeBreakdown = null;
    if (storeId) {
      storeBreakdown = await db.collection('products').aggregate([
        {
          $match: {
            'inventory.multiLocation.storeId': storeId
          }
        },
        {
          $addFields: {
            storeInventory: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: '$inventory.multiLocation',
                    cond: { $eq: ['$$this.storeId', storeId] }
                  }
                },
                0
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalQuantity: { $sum: '$storeInventory.quantity' },
            totalValue: {
              $sum: {
                $multiply: ['$pricing.originalPrice', '$storeInventory.quantity']
              }
            }
          }
        }
      ]).toArray();
    }
    
    res.json({
      success: true,
      analytics: {
        products: productStats[0] || {
          totalProducts: 0,
          activeProducts: 0,
          featuredProducts: 0,
          totalInventoryValue: 0
        },
        lowStockProducts,
        categoryBreakdown,
        storeBreakdown: storeBreakdown?.[0] || null
      }
    });
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found' 
  });
});

// Start the server after all routes are defined
startServer();