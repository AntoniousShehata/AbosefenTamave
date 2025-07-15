const { MongoClient } = require('mongodb');

class SmartSearchService {
  constructor(db) {
    this.db = db;
    this.searchIndex = new Map();
    this.categoryIndex = new Map();
    this.initializeSearchIndex();
  }

  // Initialize search index for better performance
  async initializeSearchIndex() {
    try {
      const products = await this.db.collection('products').find({ isActive: true }).toArray();
      const categories = await this.db.collection('categories').find({ isActive: true }).toArray();
      
      // Build product search index
      products.forEach(product => {
        const searchTerms = this.extractSearchTerms(product);
        this.searchIndex.set(product._id, searchTerms);
      });

      // Build category index
      categories.forEach(category => {
        const terms = [
          category.name?.en?.toLowerCase(),
          category.name?.ar?.toLowerCase(),
          category.description?.en?.toLowerCase(),
          category.description?.ar?.toLowerCase()
        ].filter(Boolean);
        this.categoryIndex.set(category._id, terms);
      });

      console.log('✅ Smart search index initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing search index:', error);
    }
  }

  // Extract searchable terms from product
  extractSearchTerms(product) {
    const terms = [];
    
    // Basic product info
    if (product.name?.en) terms.push(product.name.en.toLowerCase());
    if (product.name?.ar) terms.push(product.name.ar.toLowerCase());
    if (product.description?.en) terms.push(product.description.en.toLowerCase());
    if (product.description?.ar) terms.push(product.description.ar.toLowerCase());
    if (product.sku) terms.push(product.sku.toLowerCase());
    
    // Specifications
    if (product.specifications) {
      Object.values(product.specifications).forEach(spec => {
        if (typeof spec === 'string') {
          terms.push(spec.toLowerCase());
        } else if (typeof spec === 'object' && spec !== null) {
          Object.values(spec).forEach(value => {
            if (typeof value === 'string') {
              terms.push(value.toLowerCase());
            }
          });
        }
      });
    }
    
    // Tags
    if (product.tags && Array.isArray(product.tags)) {
      product.tags.forEach(tag => terms.push(tag.toLowerCase()));
    }
    
    return terms;
  }

  // Calculate Levenshtein distance for typo correction
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Smart search with typo correction
  async smartSearch(query, options = {}) {
    const {
      limit = 20,
      categoryId = null,
      minScore = 0.3,
      includeSuggestions = true,
      sortBy = 'relevance'
    } = options;

    const searchTerm = query.toLowerCase().trim();
    const results = [];
    const suggestions = [];

    try {
      // Direct MongoDB search for exact matches
      const mongoQuery = {
        isActive: true,
        $or: [
          { 'name.en': { $regex: searchTerm, $options: 'i' } },
          { 'name.ar': { $regex: searchTerm, $options: 'i' } },
          { 'description.en': { $regex: searchTerm, $options: 'i' } },
          { 'description.ar': { $regex: searchTerm, $options: 'i' } },
          { sku: { $regex: searchTerm, $options: 'i' } },
          { tags: { $regex: searchTerm, $options: 'i' } }
        ]
      };

      if (categoryId) {
        mongoQuery.categoryId = categoryId;
      }

      const directMatches = await this.db.collection('products')
        .find(mongoQuery)
        .limit(limit)
        .toArray();

      // Score direct matches
      directMatches.forEach(product => {
        const score = this.calculateRelevanceScore(product, searchTerm);
        results.push({
          ...product,
          searchScore: score,
          matchType: 'direct'
        });
      });

      // If we have fewer results than limit, use fuzzy search
      if (results.length < limit) {
        const fuzzyMatches = await this.fuzzySearch(searchTerm, limit - results.length, categoryId);
        results.push(...fuzzyMatches);
      }

      // Generate suggestions if enabled
      if (includeSuggestions) {
        const searchSuggestions = await this.generateSuggestions(searchTerm);
        suggestions.push(...searchSuggestions);
      }

      // Sort results
      this.sortResults(results, sortBy);

      return {
        results: results.slice(0, limit),
        suggestions,
        query: searchTerm,
        totalFound: results.length,
        searchTime: Date.now()
      };

    } catch (error) {
      console.error('❌ Smart search error:', error);
      return {
        results: [],
        suggestions: [],
        query: searchTerm,
        totalFound: 0,
        error: 'Search failed'
      };
    }
  }

  // Calculate relevance score for a product
  calculateRelevanceScore(product, searchTerm) {
    let score = 0;
    const term = searchTerm.toLowerCase();
    
    // Name matches (highest priority)
    if (product.name?.en?.toLowerCase().includes(term)) {
      score += product.name.en.toLowerCase().indexOf(term) === 0 ? 1.0 : 0.8;
    }
    if (product.name?.ar?.toLowerCase().includes(term)) {
      score += product.name.ar.toLowerCase().indexOf(term) === 0 ? 1.0 : 0.8;
    }
    
    // SKU exact match
    if (product.sku?.toLowerCase() === term) {
      score += 1.0;
    }
    
    // Description matches (medium priority)
    if (product.description?.en?.toLowerCase().includes(term)) {
      score += 0.6;
    }
    if (product.description?.ar?.toLowerCase().includes(term)) {
      score += 0.6;
    }
    
    // Tags matches
    if (product.tags?.some(tag => tag.toLowerCase().includes(term))) {
      score += 0.5;
    }
    
    // Boost for featured products
    if (product.isFeatured) {
      score += 0.2;
    }
    
    // Boost for in-stock products
    if (product.inventory?.inStock) {
      score += 0.1;
    }
    
    return score;
  }

  // Fuzzy search for typo correction
  async fuzzySearch(searchTerm, limit, categoryId) {
    const results = [];
    const maxDistance = Math.max(2, Math.floor(searchTerm.length / 3)); // Allow more typos for longer words
    
    try {
      const query = { isActive: true };
      if (categoryId) query.categoryId = categoryId;
      
      const products = await this.db.collection('products').find(query).toArray();
      
      products.forEach(product => {
        const searchTerms = this.extractSearchTerms(product);
        let bestScore = 0;
        
        searchTerms.forEach(term => {
          const distance = this.levenshteinDistance(searchTerm, term);
          if (distance <= maxDistance) {
            const score = Math.max(0, 1 - (distance / searchTerm.length));
            bestScore = Math.max(bestScore, score);
          }
        });
        
        if (bestScore > 0.3) {
          results.push({
            ...product,
            searchScore: bestScore,
            matchType: 'fuzzy'
          });
        }
      });
      
      return results.slice(0, limit);
    } catch (error) {
      console.error('❌ Fuzzy search error:', error);
      return [];
    }
  }

  // Generate search suggestions
  async generateSuggestions(searchTerm) {
    const suggestions = [];
    const term = searchTerm.toLowerCase();
    
    try {
      // Category suggestions
      for (const [categoryId, terms] of this.categoryIndex) {
        const matchingTerms = terms.filter(t => t.includes(term));
        if (matchingTerms.length > 0) {
          const category = await this.db.collection('categories').findOne({ _id: categoryId });
          if (category) {
            suggestions.push({
              type: 'category',
              text: category.name.en,
              categoryId: categoryId,
              score: 0.9
            });
          }
        }
      }
      
      // Product name suggestions
      const productSuggestions = await this.db.collection('products').aggregate([
        {
          $match: {
            isActive: true,
            $or: [
              { 'name.en': { $regex: term, $options: 'i' } },
              { 'name.ar': { $regex: term, $options: 'i' } }
            ]
          }
        },
        {
          $project: {
            'name.en': 1,
            'name.ar': 1,
            categoryId: 1
          }
        },
        { $limit: 5 }
      ]).toArray();
      
      productSuggestions.forEach(product => {
        suggestions.push({
          type: 'product',
          text: product.name.en,
          productId: product._id,
          categoryId: product.categoryId,
          score: 0.8
        });
      });
      
      // Common search corrections
      const corrections = this.getSearchCorrections(term);
      corrections.forEach(correction => {
        suggestions.push({
          type: 'correction',
          text: correction,
          score: 0.7
        });
      });
      
      return suggestions.sort((a, b) => b.score - a.score).slice(0, 8);
    } catch (error) {
      console.error('❌ Error generating suggestions:', error);
      return [];
    }
  }

  // Get common search corrections
  getSearchCorrections(term) {
    const corrections = {
      'basins': ['basin', 'sink'],
      'faucets': ['faucet', 'tap', 'mixer'],
      'bathtubs': ['bathtub', 'bath', 'tub'],
      'ceramics': ['ceramic', 'tile', 'tiles'],
      'accessories': ['accessory', 'parts'],
      'kitchen': ['cooking', 'culinary'],
      'bathroom': ['bath', 'washroom']
    };
    
    const result = [];
    Object.entries(corrections).forEach(([key, values]) => {
      if (key.includes(term) || values.some(v => v.includes(term))) {
        result.push(...values.filter(v => v !== term));
      }
    });
    
    return [...new Set(result)];
  }

  // Sort search results
  sortResults(results, sortBy) {
    switch (sortBy) {
      case 'relevance':
        results.sort((a, b) => b.searchScore - a.searchScore);
        break;
      case 'price_low':
        results.sort((a, b) => (a.pricing?.salePrice || 0) - (b.pricing?.salePrice || 0));
        break;
      case 'price_high':
        results.sort((a, b) => (b.pricing?.salePrice || 0) - (a.pricing?.salePrice || 0));
        break;
      case 'rating':
        results.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        break;
      case 'newest':
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        results.sort((a, b) => b.searchScore - a.searchScore);
    }
  }

  // Auto-complete functionality
  async getAutoComplete(query, limit = 10) {
    const term = query.toLowerCase().trim();
    if (term.length < 2) return [];
    
    try {
      const suggestions = await this.db.collection('products').aggregate([
        {
          $match: {
            isActive: true,
            $or: [
              { 'name.en': { $regex: `^${term}`, $options: 'i' } },
              { 'name.ar': { $regex: `^${term}`, $options: 'i' } }
            ]
          }
        },
        {
          $project: {
            suggestion: '$name.en',
            type: 'product',
            categoryId: 1
          }
        },
        { $limit: limit }
      ]).toArray();
      
      return suggestions;
    } catch (error) {
      console.error('❌ Auto-complete error:', error);
      return [];
    }
  }

  // Get trending searches
  async getTrendingSearches(limit = 10) {
    try {
      // This would normally come from analytics data
      // For now, return popular product categories
      const trending = await this.db.collection('products').aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$categoryId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
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
            term: '$category.name.en',
            count: 1,
            categoryId: '$_id'
          }
        }
      ]).toArray();
      
      return trending;
    } catch (error) {
      console.error('❌ Error getting trending searches:', error);
      return [];
    }
  }
}

module.exports = SmartSearchService; 