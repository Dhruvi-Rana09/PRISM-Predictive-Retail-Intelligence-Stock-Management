// src/lib/analytics.ts
import { db } from './firebase-config';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  getDoc, 
  setDoc, 
  serverTimestamp,
  increment,
  getDocs
} from 'firebase/firestore';

// Analytics event types
export type AnalyticsEvent = 
  | 'hover_2s'
  | 'hover_5s'
  | 'product_click'
  | 'add_to_cart'
  | 'cart_abandon';

// Scoring system - raw points for calculation
const SCORING_POINTS = {
  hover_2s: 2,
  hover_5s: 5,
  product_click: 8,
  add_to_cart: 15,
  cart_abandon: -5,
} as const;

// Maximum possible score for normalization (used for scaling to 0-100)
const MAX_SCORE_THRESHOLD = 100; // Adjust based on your expected maximum raw score

// Interface for analytics data
interface AnalyticsData {
  productId: string | number;
  eventType: AnalyticsEvent;
  sessionId: string;
  timestamp: any;
  userId?: string;
  metadata?: Record<string, any>;
}

// Interface for product score
interface ProductScore {
  productId: string | number;
  rawScore: number; // Internal raw score for calculations
  normalizedScore: number; // Score between 0-100
  eventCounts: Record<AnalyticsEvent, number>;
  lastUpdated: any;
}

// Generate session ID
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Session management
let currentSessionId: string | null = null;

export const getSessionId = (): string => {
  if (!currentSessionId) {
    currentSessionId = generateSessionId();
  }
  return currentSessionId;
};

// Normalize score to 0-100 range
const normalizeScore = (rawScore: number): number => {
  // Ensure minimum score is 0
  const positiveScore = Math.max(0, rawScore);
  
  // Scale to 0-100 range using sigmoid-like function
  // This approach ensures scores gradually approach 100 but never exceed it
  const normalized = (positiveScore / (positiveScore + MAX_SCORE_THRESHOLD)) * 100;
  
  return Math.round(normalized * 100) / 100; // Round to 2 decimal places
};

// Track an analytics event
export const trackEvent = async (
  productId: string | number,
  eventType: AnalyticsEvent,
  userId?: string,
  metadata?: Record<string, any>
): Promise<void> => {
  try {
    const sessionId = getSessionId();
    
    // Create analytics data - only include defined values
    const analyticsData: any = {
      productId,
      eventType,
      sessionId,
      timestamp: serverTimestamp(),
    };

    // Only add optional fields if they have values
    if (userId) {
      analyticsData.userId = userId;
    }
    
    if (metadata && Object.keys(metadata).length > 0) {
      analyticsData.metadata = metadata;
    }

    // Add to analytics collection
    await addDoc(collection(db, 'analytics'), analyticsData);

    // Update product score
    await updateProductScore(productId, eventType);

    console.log(`Analytics tracked: ${eventType} for product ${productId}`);
  } catch (error) {
    console.error('Error tracking analytics:', error);
    // Don't throw error to prevent breaking the UI
  }
};

// Update product score
const updateProductScore = async (
  productId: string | number,
  eventType: AnalyticsEvent
): Promise<void> => {
  try {
    const productRef = doc(db, 'productScores', productId.toString());
    const productDoc = await getDoc(productRef);
    
    const points = SCORING_POINTS[eventType];
    
    if (productDoc.exists()) {
      const currentData = productDoc.data() as ProductScore;
      const newRawScore = currentData.rawScore + points;
      const newNormalizedScore = normalizeScore(newRawScore);
      
      // Update existing score
      await updateDoc(productRef, {
        rawScore: newRawScore,
        normalizedScore: newNormalizedScore,
        [`eventCounts.${eventType}`]: increment(1),
        lastUpdated: serverTimestamp(),
      });
    } else {
      // Create new score document
      const initialEventCounts: Record<AnalyticsEvent, number> = {
        hover_2s: 0,
        hover_5s: 0,
        product_click: 0,
        add_to_cart: 0,
        cart_abandon: 0,
      };
      
      initialEventCounts[eventType] = 1;
      const normalizedScore = normalizeScore(points);
      
      await setDoc(productRef, {
        productId,
        rawScore: points,
        normalizedScore: normalizedScore,
        eventCounts: initialEventCounts,
        lastUpdated: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error updating product score:', error);
  }
};

// Get product score
export const getProductScore = async (
  productId: string | number
): Promise<ProductScore | null> => {
  try {
    const productRef = doc(db, 'productScores', productId.toString());
    const productDoc = await getDoc(productRef);
    
    if (productDoc.exists()) {
      return productDoc.data() as ProductScore;
    }
    return null;
  } catch (error) {
    console.error('Error getting product score:', error);
    return null;
  }
};

// Cart abandonment tracking
const cartTimers = new Map<string, NodeJS.Timeout>();

export const startCartTimer = (productId: string | number): void => {
  const key = productId.toString();
  
  // Clear existing timer if any
  if (cartTimers.has(key)) {
    const existingTimer = cartTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
  }
  
  // Set new timer for 30 seconds
  const timer = setTimeout(() => {
    trackEvent(productId, 'cart_abandon');
    cartTimers.delete(key);
  }, 30000);
  
  cartTimers.set(key, timer);
};

export const clearCartTimer = (productId: string | number): void => {
  const key = productId.toString();
  if (cartTimers.has(key)) {
    const timer = cartTimers.get(key);
    if (timer) {
      clearTimeout(timer);
    }
    cartTimers.delete(key);
  }
};

// Track cart removal (called when user removes item from cart)
export const trackCartRemoval = async (
  productId: string | number,
  userId?: string,
  metadata?: Record<string, any>
): Promise<void> => {
  // Clear any existing cart timer since item was explicitly removed
  clearCartTimer(productId);
  
  // Track the removal event
  await trackEvent(productId, 'cart_abandon', userId, metadata);
};

// Get all product scores
export const getAllProductScores = async (): Promise<ProductScore[]> => {
  try {
    const scoresRef = collection(db, 'productScores');
    const snapshot = await getDocs(scoresRef);
    
    return snapshot.docs.map(doc => doc.data() as ProductScore);
  } catch (error) {
    console.error('Error getting all product scores:', error);
    return [];
  }
};

// Utility function to recalculate all normalized scores (useful for maintenance)
export const recalculateAllScores = async (): Promise<void> => {
  try {
    const scores = await getAllProductScores();
    
    for (const score of scores) {
      const productRef = doc(db, 'productScores', score.productId.toString());
      const newNormalizedScore = normalizeScore(score.rawScore);
      
      await updateDoc(productRef, {
        normalizedScore: newNormalizedScore,
        lastUpdated: serverTimestamp(),
      });
    }
    
    console.log('All scores recalculated successfully');
  } catch (error) {
    console.error('Error recalculating scores:', error);
  }
};