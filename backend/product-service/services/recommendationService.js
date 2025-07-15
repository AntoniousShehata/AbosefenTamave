const { ObjectId } = require('mongodb');

class RecommendationService {
  constructor(db) {
    this.db = db;
    this.categoryWeights = new Map();
    this.userPreferences = new Map();
    this.initializeWeights();
  }

  // Initialize category weights and relationships
  async initializeWeights() {
    try {
      // Build category relationships based on products
      const categories = await this.db.collection('categories').find({ isActive: true }).toArray();
      const products = await this.db.collection('products').find({ isActive: true }).toArray();
      
      // Create category similarity matrix
      categories.forEach(category => {
        this.categoryWeights.set(category._id, {
          relatedCategories: this.findRelatedCategories(category._id, products),
          popularityScore: this.calculateCategoryPopularity(category._id, products)
        });
      });
      
      console.log('✅ Recommendation weights initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing recommendation weights:', error);
    }
  }

  // Find related categories based on product specifications and tags
  findRelatedCategories(categoryId, products) {
    if (!products || !Array.isArray(products)) return [];
    
    const categoryProducts = products.filter(p => p.categoryId === categoryId);
    const relatedCategories = new Map();
    
    categoryProducts.forEach(product => {
      // Find products with similar specifications
      const similarProducts = products.filter(p => 
        p.categoryId !== categoryId && 
        this.calculateProductSimilarity(product, p) > 0.3
      );
      
      similarProducts.forEach(similar => {
        const score = relatedCategories.get(similar.categoryId) || 0;
        relatedCategories.set(similar.categoryId, score + 1);
      });
    });
    
    return Array.from(relatedCategories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }

  // Calculate category popularity score
  calculateCategoryPopularity(categoryId, products) {
    const categoryProducts = products.filter(p => p.categoryId === categoryId);
    return categoryProducts.reduce((score, product) => {
      let productScore = 0;
      
      // Weight by rating
      if (product.rating && product.rating.average) {
        productScore += product.rating.average * 0.3;
      }
      
      // Weight by features
      if (product.isFeatured) productScore += 2;
      if (product.inventory?.inStock) productScore += 1;
      if (product.pricing?.isOnSale) productScore += 1.5;
      
      return score + productScore;
    }, 0);
  }

  // Calculate similarity between two products
  calculateProductSimilarity(product1, product2) {
    if (!product1 || !product2) return 0;
    
    // Ensure tags are arrays or set to empty arrays
    if (!Array.isArray(product1.tags)) product1.tags = [];
    if (!Array.isArray(product2.tags)) product2.tags = [];
    
    let similarity = 0;
    
    // Price similarity
    const price1 = product1.pricing?.salePrice || product1.pricing?.originalPrice || 0;
    const price2 = product2.pricing?.salePrice || product2.pricing?.originalPrice || 0;
    const priceRatio = Math.min(price1, price2) / Math.max(price1, price2);
    similarity += priceRatio * 0.3;
    
    // Specification similarity
    if (product1.specifications && product2.specifications) {
      const spec1Keys = Object.keys(product1.specifications);
      const spec2Keys = Object.keys(product2.specifications);
      const commonSpecs = spec1Keys.filter(key => spec2Keys.includes(key));
      
      if (commonSpecs.length > 0) {
        const matchingSpecs = commonSpecs.filter(key => 
          product1.specifications[key] === product2.specifications[key]
        );
        similarity += (matchingSpecs.length / commonSpecs.length) * 0.4;
      }
    }
    
    // Brand similarity (if available)
    if (product1.brand && product2.brand && product1.brand === product2.brand) {
      similarity += 0.2;
    }
    
    // Tag similarity
    if (product1.tags && product2.tags && Array.isArray(product1.tags) && Array.isArray(product2.tags)) {
      const commonTags = product1.tags.filter(tag => product2.tags.includes(tag));
      similarity += (commonTags.length / Math.max(product1.tags.length, product2.tags.length)) * 0.1;
    }
    
    return similarity;
  }

  // Get related products for a specific product
  async getRelatedProducts(productId, limit = 6) {
    try {
      // Convert string ID to ObjectId if needed
      const objectId = typeof productId === 'string' ? new ObjectId(productId) : productId;
      
      const product = await this.db.collection('products').findOne({ _id: objectId });
      if (!product) return [];
      
      const allProducts = await this.db.collection('products')
        .find({ 
          isActive: true, 
          _id: { $ne: objectId },
          'inventory.inStock': true 
        })
        .toArray();
      
      // Calculate similarity scores
      const scoredProducts = allProducts.map(p => ({
        ...p,
        similarityScore: this.calculateProductSimilarity(product, p)
      }));
      
      // Sort by similarity and return top results
      return scoredProducts
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, limit);
      
    } catch (error) {
      console.error('❌ Error getting related products:', error);
      return [];
    }
  }

  // Get frequently bought together products
  async getFrequentlyBoughtTogether(productId, limit = 4) {
    try {
      // Convert string ID to ObjectId if needed
      const objectId = typeof productId === 'string' ? new ObjectId(productId) : productId;
      
      // This would typically use order history data
      // For now, we'll simulate with category-based and specification-based recommendations
      const product = await this.db.collection('products').findOne({ _id: objectId });
      if (!product) return [];
      
      const complementaryProducts = await this.db.collection('products')
        .find({
          isActive: true,
          _id: { $ne: objectId },
          'inventory.inStock': true,
          $or: [
            { categoryId: { $in: this.getComplementaryCategories(product.categoryId) } },
            { tags: { $in: this.getComplementaryTags(product.tags || []) } }
          ]
        })
        .limit(limit * 2)
        .toArray();
      
      // Score based on complementary probability
      const scoredProducts = complementaryProducts.map(p => ({
        ...p,
        complementaryScore: this.calculateComplementaryScore(product, p)
      }));
      
      return scoredProducts
        .sort((a, b) => b.complementaryScore - a.complementaryScore)
        .slice(0, limit);
      
    } catch (error) {
      console.error('❌ Error getting frequently bought together:', error);
      return [];
    }
  }

  // Get complementary categories
  getComplementaryCategories(categoryId) {
    const complementaryMap = {
      'bathroom-fittings': ['accessories', 'ceramics', 'furniture'],
      'kitchen-fittings': ['accessories', 'ceramics'],
      'ceramics': ['bathroom-fittings', 'kitchen-fittings', 'accessories'],
      'accessories': ['bathroom-fittings', 'kitchen-fittings', 'furniture'],
      'furniture': ['accessories', 'bathroom-fittings', 'prewall-systems'],
      'prewall-systems': ['furniture', 'bathroom-fittings', 'accessories'],
      'bathtubs': ['accessories', 'furniture', 'bathroom-fittings']
    };
    
    return complementaryMap[categoryId] || [];
  }

  // Get complementary tags
  getComplementaryTags(tags) {
    const complementaryTags = [];
    
    if (!Array.isArray(tags)) return complementaryTags;
    
    tags.forEach(tag => {
      const tagLower = tag.toLowerCase();
      if (tagLower.includes('basin') || tagLower.includes('sink')) {
        complementaryTags.push('faucet', 'mixer', 'tap');
      }
      if (tagLower.includes('faucet') || tagLower.includes('mixer')) {
        complementaryTags.push('basin', 'sink');
      }
      if (tagLower.includes('bathtub') || tagLower.includes('bath')) {
        complementaryTags.push('shower', 'accessories');
      }
      if (tagLower.includes('toilet')) {
        complementaryTags.push('seat', 'accessories');
      }
    });
    
    return complementaryTags;
  }

  // Calculate complementary score
  calculateComplementaryScore(mainProduct, complementaryProduct) {
    let score = 0;
    
    // Category complementarity
    const complementaryCategories = this.getComplementaryCategories(mainProduct.categoryId);
    if (complementaryCategories.includes(complementaryProduct.categoryId)) {
      score += 0.5;
    }
    
    // Price complementarity (different price ranges work well together)
    const mainPrice = mainProduct.pricing?.salePrice || mainProduct.pricing?.originalPrice || 0;
    const compPrice = complementaryProduct.pricing?.salePrice || complementaryProduct.pricing?.originalPrice || 0;
    const priceRatio = Math.min(mainPrice, compPrice) / Math.max(mainPrice, compPrice);
    score += (1 - priceRatio) * 0.3; // Different price ranges get higher score
    
    // Brand diversity (different brands complement each other)
    if (mainProduct.brand && complementaryProduct.brand && mainProduct.brand !== complementaryProduct.brand) {
      score += 0.2;
    }
    
    // Popularity boost
    if (complementaryProduct.isFeatured) score += 0.3;
    if (complementaryProduct.rating && complementaryProduct.rating.average > 4) score += 0.2;
    
    return score;
  }

  // Get personalized recommendations for a user
  async getPersonalizedRecommendations(userId, limit = 8) {
    try {
      // This would use user behavior, purchase history, and preferences
      // For now, we'll create smart recommendations based on general patterns
      
      // Get trending products
      const trendingProducts = await this.db.collection('products')
        .find({ 
          isActive: true,
          'inventory.inStock': true,
          isFeatured: true
        })
        .sort({ 'rating.average': -1, createdAt: -1 })
        .limit(limit)
        .toArray();
      
      // Add recommendation scores
      const scoredProducts = trendingProducts.map(p => ({
        ...p,
        recommendationScore: this.calculatePersonalizedScore(p, userId),
        recommendationType: 'trending'
      }));
      
      return scoredProducts.sort((a, b) => b.recommendationScore - a.recommendationScore);
      
    } catch (error) {
      console.error('❌ Error getting personalized recommendations:', error);
      return [];
    }
  }

  // Calculate personalized score
  calculatePersonalizedScore(product, userId) {
    let score = 0;
    
    // Base score from rating
    if (product.rating && product.rating.average) {
      score += product.rating.average * 0.3;
    }
    
    // Featured product boost
    if (product.isFeatured) score += 1.5;
    
    // On sale boost
    if (product.pricing?.isOnSale) score += 1;
    
    // In stock boost
    if (product.inventory?.inStock) score += 0.5;
    
    // New products boost
    const productAge = Date.now() - new Date(product.createdAt).getTime();
    const daysSinceCreation = productAge / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 30) score += 0.5;
    
    return score;
  }

  // Get category-based recommendations
  async getCategoryRecommendations(categoryId, limit = 6) {
    try {
      const products = await this.db.collection('products')
        .find({ 
          categoryId: categoryId,
          isActive: true,
          'inventory.inStock': true
        })
        .sort({ 'rating.average': -1, isFeatured: -1 })
        .limit(limit)
        .toArray();
      
      return products.map(p => ({
        ...p,
        recommendationType: 'category-based'
      }));
      
    } catch (error) {
      console.error('❌ Error getting category recommendations:', error);
      return [];
    }
  }

  // Get similar products by specifications
  async getSimilarBySpecs(productId, limit = 4) {
    try {
      // Convert string ID to ObjectId if needed
      const objectId = typeof productId === 'string' ? new ObjectId(productId) : productId;
      
      const product = await this.db.collection('products').findOne({ _id: objectId });
      if (!product || !product.specifications) return [];
      
      const similarProducts = await this.db.collection('products')
        .find({
          isActive: true,
          _id: { $ne: objectId },
          'inventory.inStock': true,
          categoryId: product.categoryId // Same category
        })
        .toArray();
      
      // Score by specification similarity
      const scoredProducts = similarProducts.map(p => ({
        ...p,
        specSimilarity: this.calculateSpecSimilarity(product.specifications, p.specifications)
      }));
      
      return scoredProducts
        .filter(p => p.specSimilarity > 0.3)
        .sort((a, b) => b.specSimilarity - a.specSimilarity)
        .slice(0, limit);
      
    } catch (error) {
      console.error('❌ Error getting similar products by specs:', error);
      return [];
    }
  }

  // Calculate specification similarity
  calculateSpecSimilarity(specs1, specs2) {
    if (!specs1 || !specs2) return 0;
    
    const keys1 = Object.keys(specs1);
    const keys2 = Object.keys(specs2);
    const commonKeys = keys1.filter(key => keys2.includes(key));
    
    if (commonKeys.length === 0) return 0;
    
    const matchingSpecs = commonKeys.filter(key => {
      const val1 = specs1[key];
      const val2 = specs2[key];
      
      // Handle different data types
      if (typeof val1 === 'string' && typeof val2 === 'string') {
        return val1.toLowerCase() === val2.toLowerCase();
      }
      if (typeof val1 === 'number' && typeof val2 === 'number') {
        return Math.abs(val1 - val2) / Math.max(val1, val2) < 0.1; // 10% tolerance
      }
      if (typeof val1 === 'object' && typeof val2 === 'object') {
        return JSON.stringify(val1) === JSON.stringify(val2);
      }
      
      return val1 === val2;
    });
    
    return matchingSpecs.length / commonKeys.length;
  }

  // Get smart bundle recommendations
  async getSmartBundles(productId, limit = 3) {
    try {
      // Convert string ID to ObjectId if needed
      const objectId = typeof productId === 'string' ? new ObjectId(productId) : productId;
      
      const mainProduct = await this.db.collection('products').findOne({ _id: objectId });
      if (!mainProduct) return [];
      
      const complementaryProducts = await this.getFrequentlyBoughtTogether(productId, 10);
      
      // Create bundles of 2-3 products
      const bundles = [];
      
      for (let i = 0; i < Math.min(complementaryProducts.length, limit); i++) {
        const bundle = {
          mainProduct: mainProduct,
          complementaryProducts: [complementaryProducts[i]],
          totalPrice: this.calculateBundlePrice([mainProduct, complementaryProducts[i]]),
          savings: this.calculateBundleSavings([mainProduct, complementaryProducts[i]]),
          bundleType: 'complementary'
        };
        bundles.push(bundle);
      }
      
      return bundles;
      
    } catch (error) {
      console.error('❌ Error getting smart bundles:', error);
      return [];
    }
  }

  // Calculate bundle price
  calculateBundlePrice(products) {
    return products.reduce((total, product) => {
      const price = product.pricing?.salePrice || product.pricing?.originalPrice || 0;
      return total + price;
    }, 0);
  }

  // Calculate bundle savings
  calculateBundleSavings(products) {
    const totalPrice = this.calculateBundlePrice(products);
    const discount = totalPrice * 0.05; // 5% bundle discount
    return discount;
  }

  // Track user interaction for learning
  async trackUserInteraction(userId, productId, interactionType) {
    try {
      // This would typically store user behavior data
      // For now, we'll just log the interaction
      console.log(`📊 User ${userId} ${interactionType} product ${productId}`);
      
      // Could store in analytics collection for future ML training
      // await this.db.collection('user_interactions').insertOne({
      //   userId,
      //   productId,
      //   interactionType,
      //   timestamp: new Date()
      // });
      
    } catch (error) {
      console.error('❌ Error tracking user interaction:', error);
    }
  }
}

module.exports = RecommendationService; 