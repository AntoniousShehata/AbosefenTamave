const { MongoClient } = require('mongodb');

// Enhanced Categories Data
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

async function initializeEnhancedCategories() {
  const MONGO_URI = 'mongodb://admin:AbosefenMongo2024!@localhost:27017';
  const DB_NAME = 'abosefen-catalog';
  
  let client;
  
  try {
    console.log('🔄 Connecting to MongoDB...');
    client = await MongoClient.connect(MONGO_URI);
    const db = client.db(DB_NAME);
    
    console.log('🗑️ Clearing existing enhanced categories...');
    await db.collection('enhancedCategories').deleteMany({});
    
    console.log('📂 Inserting enhanced categories...');
    const result = await db.collection('enhancedCategories').insertMany(enhancedCategories);
    
    console.log(`✅ Successfully inserted ${result.insertedCount} enhanced categories`);
    
    // Verify the data
    const count = await db.collection('enhancedCategories').countDocuments();
    console.log(`📊 Total enhanced categories in database: ${count}`);
    
    // List the categories
    const categories = await db.collection('enhancedCategories').find({}).toArray();
    categories.forEach(cat => {
      console.log(`  📁 ${cat.code}: ${cat.name.en} (${cat.subcategories?.length || 0} subcategories)`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run the initialization
initializeEnhancedCategories(); 