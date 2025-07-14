// Product catalog database setup
use('abosefen-catalog');

// Main Categories for Abosefen Sanitaryware Business
const categories = [
  {
    name: { 
      en: "Bathroom Fittings", 
      ar: "تجهيزات الحمام" 
    },
    description: {
      en: "Complete range of bathroom fixtures, fittings and accessories",
      ar: "مجموعة كاملة من تجهيزات وأدوات ومستلزمات الحمام"
    },
    slug: "bathroom-fittings",
    parentId: null,
    level: 1,
    image: "/images/categories/bathroom.jpg",
    icon: "bathroom-icon.svg",
    sortOrder: 1,
    seo: {
      metaTitle: {
        en: "Bathroom Fittings - Abosefen",
        ar: "تجهيزات الحمام - أبوسيفين"
      },
      metaDescription: {
        en: "Premium bathroom fittings and accessories for modern homes",
        ar: "تجهيزات حمامات عالية الجودة ومستلزماتها للمنازل العصرية"
      },
      keywords: ["bathroom", "fittings", "حمام", "تجهيزات", "صنابير"]
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: { 
      en: "Kitchen Fittings", 
      ar: "تجهيزات المطبخ" 
    },
    description: {
      en: "Kitchen sinks, faucets, and fittings for modern kitchens",
      ar: "أحواض المطبخ والصنابير والتجهيزات للمطابخ العصرية"
    },
    slug: "kitchen-fittings",
    parentId: null,
    level: 1,
    image: "/images/categories/kitchen.jpg",
    icon: "kitchen-icon.svg", 
    sortOrder: 2,
    seo: {
      metaTitle: {
        en: "Kitchen Fittings - Abosefen",
        ar: "تجهيزات المطبخ - أبوسيفين"
      },
      metaDescription: {
        en: "High-quality kitchen sinks, faucets and accessories",
        ar: "أحواض المطبخ والصنابير والمستلزمات عالية الجودة"
      },
      keywords: ["kitchen", "sink", "faucet", "مطبخ", "حوض", "صنبور"]
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: { 
      en: "Ceramics", 
      ar: "السيراميك" 
    },
    description: {
      en: "Premium ceramic tiles, basins, and sanitaryware",
      ar: "بلاط السيراميك الفاخر والأحواض والأدوات الصحية"
    },
    slug: "ceramics",
    parentId: null,
    level: 1,
    image: "/images/categories/ceramics.jpg",
    icon: "ceramic-icon.svg",
    sortOrder: 3,
    seo: {
      metaTitle: {
        en: "Ceramics & Tiles - Abosefen",
        ar: "السيراميك والبلاط - أبوسيفين"
      },
      metaDescription: {
        en: "Premium ceramic tiles and sanitaryware for bathrooms and kitchens",
        ar: "بلاط السيراميك الفاخر والأدوات الصحية للحمامات والمطابخ"
      },
      keywords: ["ceramic", "tiles", "basin", "سيراميك", "بلاط", "حوض"]
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: { 
      en: "Bathtubs", 
      ar: "أحواض الاستحمام" 
    },
    description: {
      en: "Luxury bathtubs and shower enclosures for relaxation",
      ar: "أحواض الاستحمام الفاخرة وكبائن الدش للاسترخاء"
    },
    slug: "bathtubs",
    parentId: null,
    level: 1,
    image: "/images/categories/bathtubs.jpg", 
    icon: "bathtub-icon.svg",
    sortOrder: 4,
    seo: {
      metaTitle: {
        en: "Bathtubs & Showers - Abosefen",
        ar: "أحواض الاستحمام والدش - أبوسيفين"
      },
      metaDescription: {
        en: "Luxury bathtubs and modern shower solutions",
        ar: "أحواض استحمام فاخرة وحلول دش عصرية"
      },
      keywords: ["bathtub", "shower", "حوض استحمام", "دش", "استحمام"]
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: { 
      en: "Toilets", 
      ar: "المراحيض" 
    },
    description: {
      en: "Modern toilet suites, bidets and WC accessories",
      ar: "أطقم المراحيض العصرية والبيديهات ومستلزمات دورات المياه"
    },
    slug: "toilets",
    parentId: null,
    level: 1,
    image: "/images/categories/toilets.jpg",
    icon: "toilet-icon.svg",
    sortOrder: 5,
    seo: {
      metaTitle: {
        en: "Toilets & Bidets - Abosefen",
        ar: "المراحيض والبيديهات - أبوسيفين"
      },
      metaDescription: {
        en: "Modern toilet suites and bidet solutions for contemporary bathrooms",
        ar: "أطقم المراحيض العصرية وحلول البيديه للحمامات المعاصرة"
      },
      keywords: ["toilet", "bidet", "WC", "مرحاض", "بيديه", "دورة مياه"]
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: { 
      en: "Accessories", 
      ar: "الإكسسوارات" 
    },
    description: {
      en: "Bathroom and kitchen accessories, towel rails, soap dispensers",
      ar: "مستلزمات الحمام والمطبخ وعلاقات المناشف وموزعات الصابون"
    },
    slug: "accessories",
    parentId: null,
    level: 1,
    image: "/images/categories/accessories.jpg",
    icon: "accessories-icon.svg",
    sortOrder: 6,
    seo: {
      metaTitle: {
        en: "Bathroom Accessories - Abosefen",
        ar: "إكسسوارات الحمام - أبوسيفين"
      },
      metaDescription: {
        en: "Complete range of bathroom and kitchen accessories",
        ar: "مجموعة كاملة من إكسسوارات الحمام والمطبخ"
      },
      keywords: ["accessories", "towel rail", "soap dispenser", "إكسسوارات", "علاقة مناشف"]
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: { 
      en: "Prewall Systems", 
      ar: "أنظمة الجدار المسبق" 
    },
    description: {
      en: "Concealed cisterns and prewall installation systems",
      ar: "خزانات الشطف المخفية وأنظمة التركيب المسبق"
    },
    slug: "prewall-systems",
    parentId: null,
    level: 1,
    image: "/images/categories/prewall.jpg",
    icon: "prewall-icon.svg",
    sortOrder: 7,
    seo: {
      metaTitle: {
        en: "Prewall Systems - Abosefen",
        ar: "أنظمة الجدار المسبق - أبوسيفين"
      },
      metaDescription: {
        en: "Modern concealed cistern and prewall installation systems",
        ar: "أنظمة خزانات الشطف المخفية والتركيب المسبق العصرية"
      },
      keywords: ["prewall", "concealed cistern", "جدار مسبق", "خزان مخفي"]
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: { 
      en: "Furniture", 
      ar: "الأثاث" 
    },
    description: {
      en: "Bathroom furniture, vanity units and storage solutions",
      ar: "أثاث الحمام ووحدات الزينة وحلول التخزين"
    },
    slug: "furniture",
    parentId: null,
    level: 1,
    image: "/images/categories/furniture.jpg",
    icon: "furniture-icon.svg",
    sortOrder: 8,
    seo: {
      metaTitle: {
        en: "Bathroom Furniture - Abosefen",
        ar: "أثاث الحمام - أبوسيفين"
      },
      metaDescription: {
        en: "Modern bathroom furniture and storage solutions",
        ar: "أثاث الحمام العصري وحلول التخزين"
      },
      keywords: ["furniture", "vanity", "storage", "أثاث", "خزانة", "تخزين"]
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Insert categories
db.categories.insertMany(categories);

// Get category IDs for subcategories
const bathroomCategory = db.categories.findOne({ slug: "bathroom-fittings" });
const kitchenCategory = db.categories.findOne({ slug: "kitchen-fittings" });
const ceramicsCategory = db.categories.findOne({ slug: "ceramics" });

// Add subcategories
const subcategories = [
  // Bathroom subcategories
  {
    name: { en: "Sink Basins", ar: "أحواض الغسيل" },
    slug: "sink-basins",
    parentId: bathroomCategory._id,
    level: 2,
    sortOrder: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: { en: "Faucets & Taps", ar: "الصنابير والحنفيات" },
    slug: "faucets-taps",
    parentId: bathroomCategory._id,
    level: 2,
    sortOrder: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: { en: "Shower Mixers", ar: "خلاطات الدش" },
    slug: "shower-mixers",
    parentId: bathroomCategory._id,
    level: 2,
    sortOrder: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Kitchen subcategories
  {
    name: { en: "Kitchen Sinks", ar: "أحواض المطبخ" },
    slug: "kitchen-sinks",
    parentId: kitchenCategory._id,
    level: 2,
    sortOrder: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: { en: "Kitchen Mixers", ar: "خلاطات المطبخ" },
    slug: "kitchen-mixers",
    parentId: kitchenCategory._id,
    level: 2,
    sortOrder: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Ceramics subcategories
  {
    name: { en: "Wall Tiles", ar: "بلاط الحوائط" },
    slug: "wall-tiles",
    parentId: ceramicsCategory._id,
    level: 2,
    sortOrder: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: { en: "Floor Tiles", ar: "بلاط الأرضيات" },
    slug: "floor-tiles",
    parentId: ceramicsCategory._id,
    level: 2,
    sortOrder: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

db.categories.insertMany(subcategories);

// Create indexes for categories collection
db.categories.createIndex({ slug: 1 }, { unique: true });
db.categories.createIndex({ parentId: 1 });
db.categories.createIndex({ level: 1 });
db.categories.createIndex({ sortOrder: 1 });
db.categories.createIndex({ isActive: 1 });

// Create indexes for products collection
db.products.createIndex({ sku: 1 }, { unique: true });
db.products.createIndex({ categoryId: 1 });
db.products.createIndex({ categoryPath: 1 });
db.products.createIndex({ status: 1 });
db.products.createIndex({ "pricing.price": 1 });
db.products.createIndex({ brand: 1 });
db.products.createIndex({ tags: 1 });
db.products.createIndex({ isFeatured: 1 });
db.products.createIndex({ "stats.rating": -1 });
db.products.createIndex({ createdAt: -1 });

// Text search index for multilingual search
db.products.createIndex({
  "name.en": "text",
  "name.ar": "text", 
  "description.en": "text",
  "description.ar": "text",
  "features.en": "text",
  "features.ar": "text",
  tags: "text"
}, {
  weights: {
    "name.en": 10,
    "name.ar": 10,
    "description.en": 5,
    "description.ar": 5,
    "features.en": 3,
    "features.ar": 3,
    tags: 2
  },
  name: "product_text_search"
});

// Create indexes for reviews collection
db.reviews.createIndex({ productId: 1 });
db.reviews.createIndex({ userId: 1 });
db.reviews.createIndex({ status: 1 });
db.reviews.createIndex({ rating: 1 });
db.reviews.createIndex({ createdAt: -1 });

print(`✅ Catalog database initialized with ${categories.length} main categories and ${subcategories.length} subcategories`); 