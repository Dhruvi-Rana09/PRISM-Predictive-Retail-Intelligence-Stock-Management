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
      await fetch('/api/delete-image', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagePath }),
      });
    } catch (error) {
      console.warn('Failed to delete image:', error);
      // Don't throw here as it's not critical
    }
  }
}
