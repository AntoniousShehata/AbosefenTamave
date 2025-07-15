// Enhanced Product catalog database setup for E-commerce
use('abosefen-catalog');

// Drop existing categories collection to start fresh
db.categories.drop();

// Main Categories for Abosefen Sanitaryware E-commerce Business
const categories = [
  {
    _id: "bathroom-fittings",
    name: { 
      en: "Bathroom Fittings", 
      ar: "تجهيزات الحمام" 
    },
    description: {
      en: "Complete range of bathroom fixtures, fittings and accessories for modern bathrooms",
      ar: "مجموعة كاملة من تجهيزات وأدوات ومستلزمات الحمام للحمامات المعاصرة"
    },
    slug: "bathroom-fittings",
    parentId: null,
    level: 1,
    image: "/images/categories/BATHROOM_FITTINGS.jpg",
    icon: "bathroom-icon.svg",
    sortOrder: 1,
    isActive: true,
    showOnHomepage: true,
    productCount: 0,
    seo: {
      metaTitle: {
        en: "Bathroom Fittings - Premium Quality | Abosefen",
        ar: "تجهيزات الحمام - جودة فاخرة | أبوسيفين"
      },
      metaDescription: {
        en: "Discover our premium bathroom fittings collection including basins, mixers, and accessories. Quality guaranteed.",
        ar: "اكتشف مجموعتنا من تجهيزات الحمام الفاخرة بما في ذلك الأحواض والخلاطات والاكسسوارات. جودة مضمونة."
      },
      keywords: {
        en: ["bathroom", "fittings", "basin", "mixer", "premium", "abosefen"],
        ar: ["حمام", "تجهيزات", "حوض", "خلاط", "فاخر", "أبوسيفين"]
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  {
    _id: "kitchen-fittings",
    name: { 
      en: "Kitchen Fittings", 
      ar: "تجهيزات المطبخ" 
    },
    description: {
      en: "Professional kitchen fixtures and fittings for modern culinary spaces",
      ar: "تجهيزات وأدوات مطبخ احترافية للمساحات الطبخ العصرية"
    },
    slug: "kitchen-fittings",
    parentId: null,
    level: 1,
    image: "/images/categories/KITCHEN_FITTINGS.jpg",
    icon: "kitchen-icon.svg",
    sortOrder: 2,
    isActive: true,
    showOnHomepage: true,
    productCount: 0,
    seo: {
      metaTitle: {
        en: "Kitchen Fittings - Professional Grade | Abosefen",
        ar: "تجهيزات المطبخ - درجة احترافية | أبوسيفين"
      },
      metaDescription: {
        en: "Professional kitchen fittings including sinks, mixers, and accessories for your dream kitchen.",
        ar: "تجهيزات مطبخ احترافية تشمل الأحواض والخلاطات والاكسسوارات لمطبخ أحلامك."
      },
      keywords: {
        en: ["kitchen", "fittings", "sink", "mixer", "professional", "abosefen"],
        ar: ["مطبخ", "تجهيزات", "حوض", "خلاط", "احترافي", "أبوسيفين"]
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },

  {
    _id: "ceramics",
    name: { 
      en: "Ceramics & Tiles", 
      ar: "السيراميك والبلاط" 
    },
    description: {
      en: "Premium ceramic tiles and porcelain for floors, walls, and decorative applications",
      ar: "بلاط سيراميك وبورسلين فاخر للأرضيات والجدران والتطبيقات الزخرفية"
    },
    slug: "ceramics",
    parentId: null,
    level: 1,
    image: "/images/categories/CERAMIC.jpg",
    icon: "ceramic-icon.svg",
    sortOrder: 3,
    isActive: true,
    showOnHomepage: true,
    productCount: 0,
    seo: {
      metaTitle: {
        en: "Ceramic Tiles - Premium Collection | Abosefen",
        ar: "بلاط سيراميك - مجموعة فاخرة | أبوسيفين"
      },
      metaDescription: {
        en: "Explore our premium ceramic tiles collection with various designs and finishes for every space.",
        ar: "استكشف مجموعة بلاط السيراميك الفاخرة مع تصاميم ولمسات نهائية متنوعة لكل مساحة."
      },
      keywords: {
        en: ["ceramic", "tiles", "porcelain", "floor", "wall", "abosefen"],
        ar: ["سيراميك", "بلاط", "بورسلين", "أرضية", "جدار", "أبوسيفين"]
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },

  {
    _id: "bathtubs",
    name: { 
      en: "Bathtubs", 
      ar: "أحواض الاستحمام" 
    },
    description: {
      en: "Luxury bathtubs including freestanding, built-in, and corner models",
      ar: "أحواض استحمام فاخرة تشمل النماذج المنفصلة والمدمجة والزاوية"
    },
    slug: "bathtubs",
    parentId: null,
    level: 1,
    image: "/images/categories/BATHTUBS.jpg",
    icon: "bathtub-icon.svg",
    sortOrder: 4,
    isActive: true,
    showOnHomepage: true,
    productCount: 0,
    seo: {
      metaTitle: {
        en: "Luxury Bathtubs - Premium Collection | Abosefen",
        ar: "أحواض استحمام فاخرة - مجموعة مميزة | أبوسيفين"
      },
      metaDescription: {
        en: "Discover our luxury bathtub collection featuring freestanding, built-in, and corner designs.",
        ar: "اكتشف مجموعة أحواض الاستحمام الفاخرة التي تضم تصاميم منفصلة ومدمجة وزاوية."
      },
      keywords: {
        en: ["bathtub", "luxury", "freestanding", "acrylic", "spa", "abosefen"],
        ar: ["حوض استحمام", "فاخر", "منفصل", "أكريليك", "سبا", "أبوسيفين"]
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },

  {
    _id: "accessories",
    name: { 
      en: "Bathroom Accessories", 
      ar: "اكسسوارات الحمام" 
    },
    description: {
      en: "Complete range of bathroom accessories and hardware for finishing touches",
      ar: "مجموعة كاملة من اكسسوارات ومعدات الحمام للمسات الأخيرة"
    },
    slug: "accessories",
    parentId: null,
    level: 1,
    image: "/images/categories/ACCESSORIES.jpg",
    icon: "accessories-icon.svg",
    sortOrder: 5,
    isActive: true,
    showOnHomepage: true,
    productCount: 0,
    seo: {
      metaTitle: {
        en: "Bathroom Accessories - Complete Sets | Abosefen",
        ar: "اكسسوارات الحمام - أطقم كاملة | أبوسيفين"
      },
      metaDescription: {
        en: "Complete your bathroom with our premium accessories including towel bars, hooks, and dispensers.",
        ar: "أكمل حمامك بأكسسواراتنا الفاخرة بما في ذلك حاملات المناشف والخطافات والموزعات."
      },
      keywords: {
        en: ["accessories", "bathroom", "towel bar", "hooks", "premium", "abosefen"],
        ar: ["اكسسوارات", "حمام", "حامل مناشف", "خطافات", "فاخر", "أبوسيفين"]
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },

  {
    _id: "prewall-systems",
    name: { 
      en: "Prewall Systems", 
      ar: "أنظمة ما قبل الجدار" 
    },
    description: {
      en: "Advanced concealed installation systems for modern, minimalist bathroom designs",
      ar: "أنظمة تركيب مخفية متقدمة لتصاميم الحمام العصرية والبسيطة"
    },
    slug: "prewall-systems",
    parentId: null,
    level: 1,
    image: "/images/categories/PREWALL.jpg",
    icon: "prewall-icon.svg",
    sortOrder: 6,
    isActive: true,
    showOnHomepage: true,
    productCount: 0,
    seo: {
      metaTitle: {
        en: "Prewall Systems - Concealed Installation | Abosefen",
        ar: "أنظمة ما قبل الجدار - تركيب مخفي | أبوسيفين"
      },
      metaDescription: {
        en: "Advanced prewall systems for concealed toilet and basin installations. Space-saving solutions.",
        ar: "أنظمة متقدمة ما قبل الجدار لتركيبات المراحيض والأحواض المخفية. حلول موفرة للمساحة."
      },
      keywords: {
        en: ["prewall", "concealed", "installation", "space-saving", "modern", "abosefen"],
        ar: ["ما قبل الجدار", "مخفي", "تركيب", "توفير مساحة", "عصري", "أبوسيفين"]
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },

  {
    _id: "furniture",
    name: { 
      en: "Bathroom Furniture", 
      ar: "أثاث الحمام" 
    },
    description: {
      en: "Modern bathroom furniture including vanities, cabinets, and storage solutions",
      ar: "أثاث حمام عصري يشمل الخزائن وحلول التخزين"
    },
    slug: "furniture",
    parentId: null,
    level: 1,
    image: "/images/categories/FURNITURE.jpg",
    icon: "furniture-icon.svg",
    sortOrder: 7,
    isActive: true,
    showOnHomepage: true,
    productCount: 0,
    seo: {
      metaTitle: {
        en: "Bathroom Furniture - Modern Designs | Abosefen",
        ar: "أثاث الحمام - تصاميم عصرية | أبوسيفين"
      },
      metaDescription: {
        en: "Modern bathroom furniture with vanities, mirrors, and storage solutions for stylish bathrooms.",
        ar: "أثاث حمام عصري مع خزائن ومرايا وحلول تخزين للحمامات الأنيقة."
      },
      keywords: {
        en: ["furniture", "bathroom", "vanity", "storage", "modern", "abosefen"],
        ar: ["أثاث", "حمام", "خزانة", "تخزين", "عصري", "أبوسيفين"]
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Insert all categories
db.categories.insertMany(categories);

// Create indexes for better performance
db.categories.createIndex({ "slug": 1 }, { unique: true });
db.categories.createIndex({ "_id": 1 });
db.categories.createIndex({ "isActive": 1 });
db.categories.createIndex({ "showOnHomepage": 1 });
db.categories.createIndex({ "sortOrder": 1 });

console.log(`✅ Created ${categories.length} comprehensive categories for e-commerce`);
console.log("✅ Added database indexes for optimal performance");
console.log("✅ Categories structure ready for product relationships!"); 