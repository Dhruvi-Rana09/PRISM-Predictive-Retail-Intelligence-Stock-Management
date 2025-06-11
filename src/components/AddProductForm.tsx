// AddProductForm.tsx
import React, { useState } from 'react';
import { Product, ProductFormData } from '../types/Product';
import { ProductService } from '../services/productServices';
import { ImageService } from '../services/imageService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddProductFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddProductForm: React.FC<AddProductFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    id: 0,
    name: '',
    category: '',
    description: '',
    price: '',
    image: null,
    inStock: true
  });

  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (name === 'id') {
      const numValue = parseInt(value) || 0;
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, inStock: checked }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.id || !formData.name || !formData.category || !formData.description || !formData.price) {
      alert('Please fill in all required fields, including Product ID.');
      return;
    }

    if (formData.id <= 0) {
      alert('Product ID must be a positive number.');
      return;
    }

    setLoading(true);

    try {
      let imagePath = '';

      if (formData.image) {
        imagePath = await ImageService.uploadImage(formData.image);
      }

      const productToAdd: Product = {
        id: formData.id,
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price),
        image: imagePath,
        inStock: formData.inStock,
        createdAt: null, // Will be set by service
        updatedAt: null  // Will be set by service
      };

      await ProductService.addProduct(productToAdd);

      alert('Product added successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Error adding product:', error);
      if (error.message?.includes('already exists')) {
        alert('A product with this ID already exists. Please choose a different ID.');
      } else {
        alert('Failed to add product. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Add New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product ID */}
            <div className="space-y-2">
              <Label htmlFor="id">Product ID *</Label>
              <Input
                id="id"
                name="id"
                type="number"
                value={formData.id || ''}
                onChange={handleInputChange}
                min="1"
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter a unique numeric ID for this product
              </p>
            </div>

            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select onValueChange={handleSelectChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="home">Home & Garden</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                required
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
              />
            </div>

            {/* Product Image */}
            <div className="space-y-2">
              <Label htmlFor="image">Product Image</Label>
              <Input
                id="image"
                type="file"
                onChange={handleImageChange}
                accept="image/*"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>

            {/* In Stock Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStock"
                checked={formData.inStock}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="inStock">In Stock</Label>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Adding...' : 'Add Product'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};