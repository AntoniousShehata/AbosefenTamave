// Sample products for Abosefen sanitaryware catalog
use('abosefen-catalog');

// Get category references
const bathroomCategory = db.categories.findOne({ slug: "bathroom-fittings" });
const sinkBasinsCategory = db.categories.findOne({ slug: "sink-basins" });
const faucetsCategory = db.categories.findOne({ slug: "faucets-taps" });
const kitchenCategory = db.categories.findOne({ slug: "kitchen-fittings" });
const ceramicsCategory = db.categories.findOne({ slug: "ceramics" });
const bathtubsCategory = db.categories.findOne({ slug: "bathtubs" });
const toiletsCategory = db.categories.findOne({ slug: "toilets" });

// Sample products
const products = [
  {
    name: {
      en: "Premium Ceramic Sink Basin",
      ar: "حوض سيراميك فاخر"
    },
    description: {
      en: "High-quality ceramic sink basin with modern design, perfect for contemporary bathrooms. Features scratch-resistant surface and easy-to-clean finish.",
      ar: "حوض سيراميك عالي الجودة بتصميم عصري، مثالي للحمامات المعاصرة. يتميز بسطح مقاوم للخدش ولمسة نهائية سهلة التنظيف."
    },
    shortDescription: {
      en: "Modern ceramic sink basin with premium finish",
      ar: "حوض سيراميك عصري بلمسة نهائية فاخرة"
    },
    categoryId: sinkBasinsCategory._id,
    categoryPath: ["bathroom-fittings", "sink-basins"],
    
    sku: "AB-SINK-001",
    barcode: "1234567890123",
    brand: "Ideal Standard",
    model: "Concept Air",
    series: "Premium Collection",
    
    pricing: {
      cost: 500.00,
      price: 850.00,
      comparePrice: 1200.00,
      currency: "EGP",
      taxable: true,
      taxRate: 0.14
    },
    
    specifications: {
      dimensions: {
        length: 60,
        width: 40,
        height: 15,
        weight: 12.5
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
    
    features: {
      en: [
        "Scratch resistant surface",
        "Easy to clean",
        "Modern design",
        "Durable ceramic material",
        "Anti-bacterial coating"
      ],
      ar: [
        "سطح مقاوم للخدش",
        "سهل التنظيف",
        "تصميم عصري",
        "مادة سيراميك متينة",
        "طلاء مضاد للبكتيريا"
      ]
    },
    
    images: [
      {
        url: "/images/products/ab-sink-001-main.jpg",
        alt: {
          en: "Premium ceramic sink basin front view",
          ar: "حوض سيراميك فاخر - المنظر الأمامي"
        },
        isPrimary: true,
        sortOrder: 1
      },
      {
        url: "/images/products/ab-sink-001-side.jpg",
        alt: {
          en: "Side view showing installation details",
          ar: "منظر جانبي يوضح تفاصيل التركيب"
        },
        isPrimary: false,
        sortOrder: 2
      }
    ],
    
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
    
    shipping: {
      weight: 15.0,
      requiresSpecialHandling: true,
      fragile: true,
      shippingClass: "large",
      freeShippingEligible: true
    },
    
    relatedProducts: [],
    compatibleProducts: [],
    accessories: [],
    
    status: "active",
    isFeatured: true,
    isBestseller: false,
    isNew: true,
    isClearance: false,
    
    seo: {
      slug: "premium-ceramic-sink-basin",
      metaTitle: {
        en: "Premium Ceramic Sink Basin - Abosefen",
        ar: "حوض سيراميك فاخر - أبوسيفين"
      },
      metaDescription: {
        en: "High-quality ceramic sink basin with modern design. Free shipping available.",
        ar: "حوض سيراميك عالي الجودة بتصميم عصري. شحن مجاني متوفر."
      },
      keywords: ["sink", "ceramic", "bathroom", "حوض", "سيراميك", "حمام"]
    },
    
    tags: ["bathroom", "sink", "ceramic", "premium", "white", "modern"],
    
    stats: {
      views: 1250,
      sales: 45,
      rating: 4.8,
      reviewCount: 23,
      wishlistCount: 67
    },
    
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
    lastSoldAt: new Date(Date.now() - 86400000) // Yesterday
  },
  
  {
    name: {
      en: "Modern Kitchen Mixer Tap",
      ar: "خلاط مطبخ عصري"
    },
    description: {
      en: "Professional kitchen mixer tap with pull-out spray feature. Constructed from solid brass with chrome finish for durability and style.",
      ar: "خلاط مطبخ احترافي مع خاصية الرش القابل للسحب. مصنوع من النحاس الصلب مع لمسة نهائية كروم للمتانة والأناقة."
    },
    shortDescription: {
      en: "Professional kitchen mixer with pull-out spray",
      ar: "خلاط مطبخ احترافي مع رش قابل للسحب"
    },
    categoryId: kitchenCategory._id,
    categoryPath: ["kitchen-fittings", "kitchen-mixers"],
    
    sku: "AB-MIX-002",
    barcode: "2345678901234",
    brand: "Grohe",
    model: "Eurosmart",
    series: "Professional",
    
    pricing: {
      cost: 800.00,
      price: 1350.00,
      comparePrice: 1800.00,
      currency: "EGP",
      taxable: true,
      taxRate: 0.14
    },
    
    specifications: {
      dimensions: {
        length: 25,
        width: 15,
        height: 35,
        weight: 2.8
      },
      material: "Solid Brass",
      color: "Chrome",
      finish: "Polished Chrome",
      installation: "Deck Mounted",
      spoutHeight: "240mm",
      spoutReach: "220mm",
      cartridgeType: "35mm Ceramic",
      countryOfOrigin: "Germany"
    },
    
    features: {
      en: [
        "Pull-out spray function",
        "360° swivel spout",
        "Ceramic disc cartridge",
        "Chrome finish",
        "Easy installation",
        "Water saving aerator"
      ],
      ar: [
        "وظيفة الرش القابل للسحب",
        "صنبور دوار 360°",
        "خرطوشة قرص سيراميك",
        "لمسة نهائية كروم",
        "تركيب سهل",
        "موفر للمياه"
      ]
    },
    
    images: [
      {
        url: "/images/products/ab-mix-002-main.jpg",
        alt: {
          en: "Modern kitchen mixer tap chrome finish",
          ar: "خلاط مطبخ عصري بلمسة نهائية كروم"
        },
        isPrimary: true,
        sortOrder: 1
      }
    ],
    
    inventory: {
      trackQuantity: true,
      currentStock: 15,
      reservedStock: 2,
      availableStock: 13,
      minStock: 3,
      maxStock: 50,
      locations: [
        {
          warehouse: "main",
          stock: 12,
          location: "B-8-C"
        },
        {
          warehouse: "showroom",
          stock: 3,
          location: "Display-1"
        }
      ]
    },
    
    shipping: {
      weight: 3.5,
      requiresSpecialHandling: false,
      fragile: false,
      shippingClass: "medium",
      freeShippingEligible: true
    },
    
    status: "active",
    isFeatured: false,
    isBestseller: true,
    isNew: false,
    isClearance: false,
    
    seo: {
      slug: "modern-kitchen-mixer-tap",
      metaTitle: {
        en: "Modern Kitchen Mixer Tap - Abosefen",
        ar: "خلاط مطبخ عصري - أبوسيفين"
      },
      metaDescription: {
        en: "Professional kitchen mixer tap with pull-out spray. Chrome finish.",
        ar: "خلاط مطبخ احترافي مع رش قابل للسحب. لمسة نهائية كروم."
      },
      keywords: ["kitchen", "mixer", "tap", "chrome", "مطبخ", "خلاط", "صنبور"]
    },
    
    tags: ["kitchen", "mixer", "tap", "chrome", "professional", "grohe"],
    
    stats: {
      views: 890,
      sales: 78,
      rating: 4.9,
      reviewCount: 34,
      wishlistCount: 45
    },
    
    createdAt: new Date(Date.now() - 2592000000), // 30 days ago
    updatedAt: new Date(),
    publishedAt: new Date(Date.now() - 2592000000),
    lastSoldAt: new Date(Date.now() - 172800000) // 2 days ago
  },
  
  {
    name: {
      en: "Luxury Freestanding Bathtub",
      ar: "حوض استحمام قائم فاخر"
    },
    description: {
      en: "Elegant freestanding bathtub crafted from high-quality acrylic. Perfect centerpiece for luxury bathroom designs with excellent heat retention.",
      ar: "حوض استحمام قائم أنيق مصنوع من الأكريليك عالي الجودة. قطعة مركزية مثالية لتصاميم الحمامات الفاخرة مع احتفاظ ممتاز بالحرارة."
    },
    shortDescription: {
      en: "Elegant freestanding acrylic bathtub",
      ar: "حوض استحمام أكريليك قائم أنيق"
    },
    categoryId: bathtubsCategory._id,
    categoryPath: ["bathtubs"],
    
    sku: "AB-TUB-003",
    barcode: "3456789012345",
    brand: "Villeroy & Boch",
    model: "Aveo",
    series: "Designer Collection",
    
    pricing: {
      cost: 8500.00,
      price: 15000.00,
      comparePrice: 22000.00,
      currency: "EGP",
      taxable: true,
      taxRate: 0.14
    },
    
    specifications: {
      dimensions: {
        length: 190,
        width: 95,
        height: 63,
        weight: 65.0
      },
      material: "Acrylic",
      color: "White",
      finish: "Matte",
      installation: "Freestanding",
      capacity: "280L",
      drainPosition: "Center",
      overflowIncluded: true,
      countryOfOrigin: "Germany"
    },
    
    features: {
      en: [
        "Premium acrylic construction",
        "Excellent heat retention",
        "Easy to clean surface",
        "Ergonomic design",
        "Built-in overflow",
        "Non-slip base"
      ],
      ar: [
        "تركيب أكريليك فاخر",
        "احتفاظ ممتاز بالحرارة",
        "سطح سهل التنظيف",
        "تصميم مريح",
        "فائض مدمج",
        "قاعدة مانعة للانزلاق"
      ]
    },
    
    images: [
      {
        url: "/images/products/ab-tub-003-main.jpg",
        alt: {
          en: "Luxury freestanding bathtub in modern bathroom",
          ar: "حوض استحمام قائم فاخر في حمام عصري"
        },
        isPrimary: true,
        sortOrder: 1
      }
    ],
    
    inventory: {
      trackQuantity: true,
      currentStock: 3,
      reservedStock: 1,
      availableStock: 2,
      minStock: 1,
      maxStock: 10,
      locations: [
        {
          warehouse: "main",
          stock: 2,
          location: "C-1-A"
        },
        {
          warehouse: "showroom",
          stock: 1,
          location: "Display-5"
        }
      ]
    },
    
    shipping: {
      weight: 75.0,
      requiresSpecialHandling: true,
      fragile: true,
      shippingClass: "extra-large",
      freeShippingEligible: true
    },
    
    status: "active",
    isFeatured: true,
    isBestseller: false,
    isNew: false,
    isClearance: false,
    
    seo: {
      slug: "luxury-freestanding-bathtub",
      metaTitle: {
        en: "Luxury Freestanding Bathtub - Abosefen",
        ar: "حوض استحمام قائم فاخر - أبوسيفين"
      },
      metaDescription: {
        en: "Elegant freestanding bathtub with premium acrylic construction.",
        ar: "حوض استحمام قائم أنيق مع تركيب أكريليك فاخر."
      },
      keywords: ["bathtub", "freestanding", "luxury", "acrylic", "حوض استحمام", "قائم", "فاخر"]
    },
    
    tags: ["bathtub", "luxury", "freestanding", "acrylic", "designer", "white"],
    
    stats: {
      views: 2150,
      sales: 8,
      rating: 4.7,
      reviewCount: 6,
      wishlistCount: 156
    },
    
    createdAt: new Date(Date.now() - 5184000000), // 60 days ago
    updatedAt: new Date(),
    publishedAt: new Date(Date.now() - 5184000000),
    lastSoldAt: new Date(Date.now() - 1209600000) // 14 days ago
  }
];

// Insert sample products
db.products.insertMany(products);

// Create some sample reviews
const sinkProduct = db.products.findOne({ sku: "AB-SINK-001" });
const mixerProduct = db.products.findOne({ sku: "AB-MIX-002" });

const reviews = [
  {
    productId: sinkProduct._id,
    userId: ObjectId(), // Would be actual user ID
    rating: 5,
    title: {
      en: "Excellent quality sink",
      ar: "حوض ممتاز الجودة"
    },
    comment: {
      en: "Very satisfied with the quality and design. Easy to install and looks great in our new bathroom.",
      ar: "راضٍ جداً عن الجودة والتصميم. سهل التركيب ويبدو رائعاً في حمامنا الجديد."
    },
    pros: {
      en: ["Easy to clean", "Beautiful design", "Good quality"],
      ar: ["سهل التنظيف", "تصميم جميل", "جودة جيدة"]
    },
    cons: {
      en: ["Installation instructions could be clearer"],
      ar: ["تعليمات التركيب يمكن أن تكون أوضح"]
    },
    helpful: 15,
    verified: true,
    status: "approved",
    createdAt: new Date(Date.now() - 1209600000), // 14 days ago
    updatedAt: new Date(Date.now() - 1209600000)
  },
  {
    productId: mixerProduct._id,
    userId: ObjectId(),
    rating: 5,
    title: {
      en: "Perfect kitchen tap",
      ar: "صنبور مطبخ مثالي"
    },
    comment: {
      en: "The pull-out spray feature is very convenient. Great build quality and the chrome finish looks amazing.",
      ar: "خاصية الرش القابل للسحب مريحة جداً. جودة بناء رائعة واللمسة النهائية الكروم تبدو مذهلة."
    },
    pros: {
      en: ["Pull-out spray", "Chrome finish", "Easy installation"],
      ar: ["رش قابل للسحب", "لمسة نهائية كروم", "تركيب سهل"]
    },
    helpful: 22,
    verified: true,
    status: "approved",
    createdAt: new Date(Date.now() - 864000000), // 10 days ago
    updatedAt: new Date(Date.now() - 864000000)
  }
];

db.reviews.insertMany(reviews);

print(`✅ Catalog database populated with ${products.length} sample products and ${reviews.length} reviews`); 