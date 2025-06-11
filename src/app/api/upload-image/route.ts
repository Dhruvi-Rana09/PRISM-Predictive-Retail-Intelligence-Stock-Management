import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Disable body parser to handle file uploads
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new IncomingForm();
    const uploadDir = path.join(process.cwd(), 'public');

    // Ensure public directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ error: 'Error parsing form data' });
      }

      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      const fileName = Array.isArray(fields.fileName) ? fields.fileName[0] : fields.fileName;

      if (!file || !fileName) {
        return res.status(400).json({ error: 'No file or filename provided' });
      }

      // Move file to public directory
      const oldPath = file.filepath;
      const newPath = path.join(uploadDir, fileName);

      fs.copyFile(oldPath, newPath, (err) => {
        if (err) {
          console.error('Error copying file:', err);
          return res.status(500).json({ error: 'Error saving file' });
        }

        // Clean up temp file
        fs.unlink(oldPath, (unlinkErr) => {
          if (unlinkErr) {
            console.warn('Error deleting temp file:', unlinkErr);
          }
        });

        res.status(200).json({ 
          message: 'File uploaded successfully',
          filename: fileName,
          path: `/${fileName}`
        });
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Alternative for App Router (app/api/upload-image/route.ts)
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;

    if (!file || !fileName) {
      return Response.json({ error: 'No file or filename provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file to public directory
    const uploadDir = path.join(process.cwd(), 'public');
    const filePath = path.join(uploadDir, fileName);

    // Ensure public directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    fs.writeFileSync(filePath, buffer);

    return Response.json({ 
      message: 'File uploaded successfully',
      filename: fileName,
      path: `/${fileName}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
