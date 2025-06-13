import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { imagePath } = body;

    if (!imagePath) {
      return NextResponse.json(
        { error: 'No image path provided' },
        { status: 400 }
      );
    }

    // Remove leading slash if present
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    const filePath = path.join(process.cwd(), 'public', cleanPath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Delete the file
    fs.unlinkSync(filePath);

    return NextResponse.json(
      { message: 'File deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Your ImageService class
export class ImageService {
  static async uploadImage(file: File): Promise<string> {
    try {
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `product_${timestamp}.${fileExtension}`;
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', fileName);
      
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      return data.imagePath || `/${fileName}`;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }

  static async deleteImage(imagePath: string): Promise<void> {
    try {
      const response = await fetch('/api/delete-image', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagePath }),
      });
      
      if (!response.ok) {
        console.warn(`Failed to delete image: ${response.status}`);
      }
    } catch (error) {
      console.warn('Failed to delete image:', error);
      // Don't throw here as it's not critical
    }
  }
}
