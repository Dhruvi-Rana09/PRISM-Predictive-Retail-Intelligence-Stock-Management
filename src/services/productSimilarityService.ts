// productSimilarityService.ts
import { Product } from '../types/Product';
import { ProductService } from './productServices';

// Types for the similarity service
interface SimilarityResult {
  mostSimilarProduct: Product;
  similarityScore: number;
  allSimilarities: Array<{
    product: Product;
    score: number;
  }>;
}

// Interface for Universal Sentence Encoder
interface UniversalSentenceEncoder {
  embed(texts: string | string[]): Promise<{
    array(): Promise<number[][]>;
    dispose(): void;
  }>;
}

export class ProductSimilarityService {
  private static model: UniversalSentenceEncoder | null = null;
  private static isModelLoaded = false;
  private static modelLoadPromise: Promise<void> | null = null;

  /**
   * Initialize the sentence transformer model
   * Using Universal Sentence Encoder from TensorFlow.js
   */
  static async initializeModel(): Promise<void> {
    if (this.isModelLoaded) return;
    
    // Prevent multiple simultaneous model loading attempts
    if (this.modelLoadPromise) {
      return this.modelLoadPromise;
    }

    this.modelLoadPromise = this._loadModel();
    return this.modelLoadPromise;
  }

  private static async _loadModel(): Promise<void> {
    try {
      console.log('🤖 Loading Universal Sentence Encoder model...');
      console.log('⏳ This may take a few moments on first load...');
      
      // Dynamically import TensorFlow.js and Universal Sentence Encoder
      const [tf, use] = await Promise.all([
        import('@tensorflow/tfjs'),
        import('@tensorflow-models/universal-sentence-encoder')
      ]);
      
      // Load the model
      this.model = await use.load();
      this.isModelLoaded = true;
      console.log('✅ Model loaded successfully!');
    } catch (error) {
      console.error('❌ Error loading model:', error);
      this.isModelLoaded = false;
      this.model = null;
      this.modelLoadPromise = null;
      throw new Error(`Failed to load similarity model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private static cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Create a comprehensive text representation of a product for similarity analysis
   */
  private static createProductText(product: Product): string {
    const parts = [
      product.name,
      product.category,
      product.description,
      // Add price range context
      product.price < 50 ? 'budget' : product.price < 200 ? 'mid-range' : 'premium',
      product.inStock ? 'available' : 'out-of-stock'
    ];
    
    return parts.filter(Boolean).join(' ');
  }

  /**
   * Find the most similar existing product to a new product
   */
  static async findMostSimilarProduct(newProduct: Product): Promise<SimilarityResult | null> {
    try {
      // Ensure model is loaded
      await this.initializeModel();

      if (!this.model) {
        throw new Error('Model failed to load');
      }

      // Fetch all existing products from Firebase
      console.log('📥 Fetching existing products from Firebase...');
      const existingProducts = await ProductService.getAllProducts();
      
      if (existingProducts.length === 0) {
        console.log('⚠️ No existing products found for similarity analysis');
        return null;
      }

      // Filter out the current product if it already exists (for updates)
      const filteredProducts = existingProducts.filter(p => p.id !== newProduct.id);
      
      if (filteredProducts.length === 0) {
        console.log('⚠️ No other products found for comparison');
        return null;
      }

      // Create text representations
      const newProductText = this.createProductText(newProduct);
      const existingProductTexts = filteredProducts.map(p => this.createProductText(p));

      console.log('🔍 Analyzing similarity for:', newProductText);
      console.log('📊 Against', filteredProducts.length, 'existing products');

      // Generate embeddings
      const allTexts = [newProductText, ...existingProductTexts];
      console.log('🧠 Generating embeddings...');
      
      const embeddings = await this.model.embed(allTexts);
      const embeddingArray = await embeddings.array();

      // First embedding is for the new product
      const newProductEmbedding = embeddingArray[0];
      
      // Calculate similarities with all existing products
      const similarities = filteredProducts.map((product, index) => {
        const existingProductEmbedding = embeddingArray[index + 1];
        const similarity = this.cosineSimilarity(newProductEmbedding, existingProductEmbedding);
        
        return {
          product,
          score: similarity
        };
      });

      // Sort by similarity score (highest first)
      similarities.sort((a, b) => b.score - a.score);

      // Clean up tensors to prevent memory leaks
      embeddings.dispose();

      const result: SimilarityResult = {
        mostSimilarProduct: similarities[0].product,
        similarityScore: similarities[0].score,
        allSimilarities: similarities
      };

      return result;

    } catch (error) {
      console.error('❌ Error in similarity analysis:', error);
      
      // Provide fallback similarity based on category and price if model fails
      console.log('🔄 Falling back to basic similarity analysis...');
      return this.fallbackSimilarityAnalysis(newProduct);
    }
  }

  /**
   * Fallback similarity analysis using basic text matching and category/price comparison
   */
  private static async fallbackSimilarityAnalysis(newProduct: Product): Promise<SimilarityResult | null> {
    try {
      const existingProducts = await ProductService.getAllProducts();
      const filteredProducts = existingProducts.filter(p => p.id !== newProduct.id);
      
      if (filteredProducts.length === 0) return null;

      const similarities = filteredProducts.map(product => {
        const categoryMatch = product.category === newProduct.category ? 0.4 : 0;
        const priceRatio = Math.min(product.price, newProduct.price) / Math.max(product.price, newProduct.price);
        const priceMatch = priceRatio * 0.3;
        
        // Simple text similarity based on common words
        const textMatch = this.simpleTextSimilarity(
          this.createProductText(newProduct),
          this.createProductText(product)
        ) * 0.3;

        return {
          product,
          score: categoryMatch + priceMatch + textMatch
        };
      });

      similarities.sort((a, b) => b.score - a.score);

      return {
        mostSimilarProduct: similarities[0].product,
        similarityScore: similarities[0].score,
        allSimilarities: similarities
      };
    } catch (error) {
      console.error('❌ Fallback similarity analysis failed:', error);
      return null;
    }
  }

  /**
   * Simple text similarity based on common words (fallback method)
   */
  private static simpleTextSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(word => 
      word.length > 2 && words2.includes(word)
    );
    
    const totalWords = Math.max(words1.length, words2.length);
    return totalWords > 0 ? commonWords.length / totalWords : 0;
  }
  static async getTopSimilarProducts(newProduct: Product, topN: number = 3): Promise<Array<{product: Product; score: number}> | null> {
    const result = await this.findMostSimilarProduct(newProduct);
    return result ? result.allSimilarities.slice(0, topN) : null;
  }



  /**
   * Log detailed similarity analysis to console
   */
  static async logSimilarityAnalysis(newProduct: Product): Promise<void> {
    try {
      console.log('\n🔍 === PRODUCT SIMILARITY ANALYSIS ===');
      console.log(`New Product: ${newProduct.name}`);
      console.log(`Category: ${newProduct.category}`);
      console.log(`Price: ${newProduct.price}`);
      console.log(`Description: ${newProduct.description}`);
      
      const result = await this.findMostSimilarProduct(newProduct);
      
      if (!result) {
        console.log('❌ No existing products found for comparison');
        return;
      }

      const { mostSimilarProduct, similarityScore, allSimilarities } = result;

      console.log('\n📈 MOST SIMILAR PRODUCT:');
      console.log(`Name: ${mostSimilarProduct.name}`);
      console.log(`Category: ${mostSimilarProduct.category}`);
      console.log(`Price: ${mostSimilarProduct.price}`);
      console.log(`Description: ${mostSimilarProduct.description}`);
      console.log(`Similarity Score: ${(similarityScore * 100).toFixed(2)}%`);
      
      console.log('\n📊 TOP 5 SIMILAR PRODUCTS:');
      allSimilarities.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. ${item.product.name} - ${(item.score * 100).toFixed(2)}% similar`);
      });

      console.log('\n=== END ANALYSIS ===\n');

    } catch (error) {
      console.error('❌ Error in similarity analysis:', error);
    }
  }
}