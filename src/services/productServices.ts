// services/productServices.ts
import {
  collection,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase-config';
import { Product } from '@/types/Product';

export class ProductService {
  private static collectionName = 'products';

  static async getAllProducts(): Promise<Product[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.id, // Use the stored numeric ID, not Firestore doc ID
          ...data
        } as Product;
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  static async addProduct(productData: Product): Promise<number> {
    try {
      // Check if a product with this ID already exists
      const existingProducts = await getDocs(
        query(collection(db, this.collectionName), where('id', '==', productData.id))
      );
      
      if (!existingProducts.empty) {
        throw new Error(`Product with ID ${productData.id} already exists`);
      }

      const newProduct = {
        ...productData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Use Firestore's auto-generated document ID, but store your numeric ID as a field
      await addDoc(collection(db, this.collectionName), newProduct);
      
      return productData.id;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  static async updateProduct(id: number, productData: Partial<Product>): Promise<void> {
    try {
      // Find the document with the specified numeric ID
      const querySnapshot = await getDocs(
        query(collection(db, this.collectionName), where('id', '==', id))
      );
      
      if (querySnapshot.empty) {
        throw new Error(`Product with ID ${id} not found`);
      }

      const docToUpdate = querySnapshot.docs[0];
      const updatedData = {
        ...productData,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(docToUpdate.ref, updatedData);
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  static async deleteProduct(id: number): Promise<void> {
    try {
      // Find the document with the specified numeric ID
      const querySnapshot = await getDocs(
        query(collection(db, this.collectionName), where('id', '==', id))
      );
      
      if (querySnapshot.empty) {
        throw new Error(`Product with ID ${id} not found`);
      }

      const docToDelete = querySnapshot.docs[0];
      await deleteDoc(docToDelete.ref);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }
}
