// hooks/useProductAnalytics.ts
import { useCallback, useRef, useEffect } from 'react';
import { 
  trackEvent, 
  startCartTimer, 
  clearCartTimer,
  trackCartRemoval 
} from '../lib/analytics';

interface UseProductAnalyticsProps {
  productId: string | number;
  userId?: string;
}

export const useProductAnalytics = ({ productId, userId }: UseProductAnalyticsProps) => {
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hover5sTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasTracked2sRef = useRef(false);
  const hasTracked5sRef = useRef(false);

  // Handle mouse enter (start hover tracking)
  const handleMouseEnter = useCallback(() => {
    // Reset tracking flags
    hasTracked2sRef.current = false;
    hasTracked5sRef.current = false;

    // Clear any existing timers first
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    if (hover5sTimerRef.current) {
      clearTimeout(hover5sTimerRef.current);
      hover5sTimerRef.current = null;
    }

    // Track 2-second hover
    hoverTimerRef.current = setTimeout(() => {
      if (!hasTracked2sRef.current) {
        trackEvent(productId, 'hover_2s', userId).catch(console.error);
        hasTracked2sRef.current = true;
      }
    }, 2000);

    // Track 5-second hover
    hover5sTimerRef.current = setTimeout(() => {
      if (!hasTracked5sRef.current) {
        trackEvent(productId, 'hover_5s', userId).catch(console.error);
        hasTracked5sRef.current = true;
      }
    }, 5000);
  }, [productId, userId]);

  // Handle mouse leave (stop hover tracking)
  const handleMouseLeave = useCallback(() => {
    // Clear timers when mouse leaves
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    if (hover5sTimerRef.current) {
      clearTimeout(hover5sTimerRef.current);
      hover5sTimerRef.current = null;
    }

    // Reset tracking flags
    hasTracked2sRef.current = false;
    hasTracked5sRef.current = false;
  }, []);

  // Handle product click
  const handleProductClick = useCallback(() => {
    trackEvent(productId, 'product_click', userId, {
      clickSource: 'product_card',
      timestamp: new Date().toISOString()
    }).catch(console.error);
  }, [productId, userId]);

  // Handle add to cart
  const handleAddToCart = useCallback(() => {
    // Clear any existing cart timer first (in case item was re-added)
    clearCartTimer(productId);
    
    // Track add to cart event
    trackEvent(productId, 'add_to_cart', userId, {
      addedAt: new Date().toISOString()
    }).catch(console.error);
    
    // Start cart abandonment timer (30 seconds)
    startCartTimer(productId);
  }, [productId, userId]);

  // Handle cart item removal - this is the key function for your cart abandonment logic
  const handleCartRemoval = useCallback(async (metadata?: Record<string, any>) => {
    try {
      // Use the trackCartRemoval function which handles both clearing timer and tracking the event
      await trackCartRemoval(productId, userId, {
        removedAt: new Date().toISOString(),
        reason: 'manual_removal',
        ...metadata
      });
    } catch (error) {
      console.error('Error tracking cart removal:', error);
    }
  }, [productId, userId]);

  // Handle successful purchase/checkout (clears timer without penalty)
  const handlePurchase = useCallback(() => {
    // Clear cart timer since item was successfully purchased
    clearCartTimer(productId);
    
    // Optional: Track purchase event if you want to add that later
    // trackEvent(productId, 'purchase', userId).catch(console.error);
  }, [productId, userId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
      if (hover5sTimerRef.current) {
        clearTimeout(hover5sTimerRef.current);
      }
      // Clear cart timer when component unmounts
      clearCartTimer(productId);
    };
  }, [productId]);

  return {
    handleMouseEnter,
    handleMouseLeave,
    handleProductClick,
    handleAddToCart,
    handleCartRemoval, // This now properly tracks the -5 score
    handlePurchase,    // Use this when purchase is completed
  };
};

