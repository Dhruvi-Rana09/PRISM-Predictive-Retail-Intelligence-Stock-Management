// ProductList.tsx
import React, { useState, useEffect } from 'react';
import { Product } from '../types/Product';
import { ProductService } from '../services/productServices';
import { ImageService } from '../services/imageService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface ProductListProps {
  onEdit: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ onEdit }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const fetchedProducts = await ProductService.getAllProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}" (ID: ${product.id})? This action cannot be undone.`)) {
      return;
    }

    try {
      if (product.image) {
        await ImageService.deleteImage(product.image);
      }
      
      await ProductService.deleteProduct(product.id);
      await fetchProducts(); // Refresh the list
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">Get started by adding your first product!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          {product.image && (
            <div className="aspect-video overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
              />
            </div>
          )}
          
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <Badge variant="secondary" className="text-xs font-mono">
                ID: {product.id}
              </Badge>
              <Badge 
                variant={product.inStock ? "default" : "destructive"}
                className="text-xs"
              >
                {product.inStock ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    In Stock
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 mr-1" />
                    Out of Stock
                  </>
                )}
              </Badge>
            </div>
            
            <CardTitle className="text-lg leading-tight">
              {product.name}
            </CardTitle>
            
            <Badge variant="outline" className="w-fit capitalize text-xs">
              {product.category}
            </Badge>
          </CardHeader>
          
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {product.description}
            </p>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-green-600">
                ${product.price.toFixed(2)}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => onEdit(product)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={() => handleDelete(product)}
                variant="destructive"
                size="sm"
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};