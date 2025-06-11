export interface Product {
  id: number; // Use Firestore document ID
  name: string;
  category: string;
  description: string;
  price: number;
  image?: string;
  inStock: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface ProductFormData {
  id: number ;  
  name: string;
  category: string;
  description: string;
  price: string;
  image: File | null;
  inStock: boolean;
}
