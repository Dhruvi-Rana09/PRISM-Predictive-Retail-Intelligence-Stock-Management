// services/bundleAnalysisService.ts
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-config'; // Adjust path according to your Firebase config

interface FirebaseSalesData {
  id: string;
  buyer: string;
  date: Timestamp;
  paymentMethod: string;
  price: number;
  productId: string;
  productName: string;
  quantity: number;
  region: string;
  total: number;
}

interface SalesData {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
  buyer: string;
  date: string;
  paymentMethod: string;
  region: string;
}

export interface ProductPair {
  product1: {
    id: string;
    name: string;
    price: number;
  };
  product2: {
    id: string;
    name: string;
    price: number;
  };
  frequency: number;
  buyers: string[];
  bundlePrice: number;
  originalPrice: number;
  discount: number;
  discountPercentage: number;
}

export class BundleAnalysisService {
  
  async fetchSalesData(): Promise<SalesData[]> {
    try {
      const salesRef = collection(db, 'sales');
      const q = query(salesRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const salesData: SalesData[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirebaseSalesData;
        salesData.push({
          id: data.id,
          productId: data.productId,
          productName: data.productName,
          price: data.price,
          quantity: data.quantity,
          total: data.total,
          buyer: data.buyer,
          date: data.date.toDate().toISOString(),
          paymentMethod: data.paymentMethod,
          region: data.region,
        });
      });
      
      return salesData;
    } catch (error) {
      console.error('Error fetching sales data:', error);
      throw new Error('Failed to fetch sales data');
    }
  }

  analyzeBundleOpportunities(salesData: SalesData[], minFrequency: number = 2): ProductPair[] {
    // Group sales by buyer and date (same day purchases)
    const purchaseGroups = new Map<string, SalesData[]>();
    
    salesData.forEach(sale => {
      const purchaseDate = sale.date.split('T')[0]; // Get just the date part
      const key = `${sale.buyer}-${purchaseDate}`;
      
      if (!purchaseGroups.has(key)) {
        purchaseGroups.set(key, []);
      }
      purchaseGroups.get(key)!.push(sale);
    });

    // Find product pairs that were bought together
    const productPairs = new Map<string, ProductPair>();
    
    purchaseGroups.forEach(purchases => {
      if (purchases.length < 2) return; // Skip single item purchases
      
      // Create pairs from all combinations in this purchase group
      for (let i = 0; i < purchases.length; i++) {
        for (let j = i + 1; j < purchases.length; j++) {
          const product1 = purchases[i];
          const product2 = purchases[j];
          
          // Skip if it's the same product
          if (product1.productId === product2.productId) continue;
          
          // Create a consistent key for the pair (alphabetically sorted)
          const pairKey = [product1.productId, product2.productId].sort().join('-');
          
          if (!productPairs.has(pairKey)) {
            const originalPrice = product1.price + product2.price;
            const discountPercentage = 10; // Default 10% discount
            const discount = originalPrice * (discountPercentage / 100);
            const bundlePrice = originalPrice - discount;
            
            productPairs.set(pairKey, {
              product1: {
                id: product1.productId,
                name: product1.productName,
                price: product1.price
              },
              product2: {
                id: product2.productId,
                name: product2.productName,
                price: product2.price
              },
              frequency: 0,
              buyers: [],
              bundlePrice,
              originalPrice,
              discount,
              discountPercentage
            });
          }
          
          const pair = productPairs.get(pairKey)!;
          pair.frequency++;
          if (!pair.buyers.includes(product1.buyer)) {
            pair.buyers.push(product1.buyer);
          }
        }
      }
    });

    // Convert to array and sort by frequency
    return Array.from(productPairs.values())
      .filter(pair => pair.frequency >= minFrequency)
      .sort((a, b) => b.frequency - a.frequency);
  }

  async getBundleSuggestions(minFrequency: number = 2): Promise<ProductPair[]> {
    const salesData = await this.fetchSalesData();
    return this.analyzeBundleOpportunities(salesData, minFrequency);
  }
}

export const bundleAnalysisService = new BundleAnalysisService();