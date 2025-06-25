import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filename, content } = req.body;
    
    if (!filename || !content) {
      return res.status(400).json({ error: 'Filename and content are required' });
    }

    // Ensure the public directory exists
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Save the file to public directory
    const filePath = path.join(publicDir, filename);
    fs.writeFileSync(filePath, content, 'utf8');

    // Return the URL to access the file
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? `https://${req.headers.host}` 
      : `http://${req.headers.host}`;
    const fileUrl = `${baseUrl}/${filename}`;
    
    res.status(200).json({
      success: true,
      filename,
      url: fileUrl
    });
  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).json({ error: 'Failed to save file' });
  }
}
