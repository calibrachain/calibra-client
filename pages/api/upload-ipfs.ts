import formidable from 'formidable';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from "next";
import type { UploadResponse } from "pinata";
import { pinata } from "../../src/utils/config";

// Disable body parsing for multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse form data
    const form = formidable({
      multiples: false,
      keepExtensions: true,
    });

    const [, files] = await form.parse(req);
    
    // Get the XML file (required)
    const xmlFileArray = files.xml;
    const xmlFile = Array.isArray(xmlFileArray) ? xmlFileArray[0] : xmlFileArray;
    
    if (!xmlFile) {
      return res.status(400).json({ error: "XML file is required" });
    }

    // Get the image file (optional)
    const imageFileArray = files.image;
    const imageFile = Array.isArray(imageFileArray) ? imageFileArray[0] : imageFileArray;
    
    // Create a unique folder name based on timestamp and XML filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const xmlBaseName = xmlFile.originalFilename?.replace('.xml', '') || 'dcc';
    const folderName = `dcc-${xmlBaseName}-${timestamp}-${randomSuffix}`;

    console.log(`Creating IPFS folder: ${folderName}`);

    // Read XML file and create File object with unique name
    const xmlBuffer = fs.readFileSync(xmlFile.filepath);
    const uniqueXmlName = `${xmlFile.originalFilename?.replace('.xml', '')}-${timestamp}-${randomSuffix}.xml` || `certificate-${timestamp}-${randomSuffix}.xml`;
    const xmlFileObject = new File([xmlBuffer], uniqueXmlName, {
      type: xmlFile.mimetype || 'application/xml'
    });

    console.log('Uploading XML file to Pinata...');
    console.log('XML file size:', xmlBuffer.length, 'bytes');

    // Upload XML file with folder metadata
    const xmlUpload = await pinata.upload.public.file(xmlFileObject, {
      metadata: {
        name: `${folderName}/${uniqueXmlName}`,
        keyvalues: {
          type: "xml",
          folder: folderName,
          originalName: xmlFile.originalFilename || 'certificate.xml',
          timestamp: timestamp.toString()
        }
      }
    });

    console.log('XML upload successful:', xmlUpload.cid);

    let imageUpload: UploadResponse | null = null;
    
    // Upload image file if provided
    if (imageFile) {
      console.log(`Uploading image: ${imageFile.originalFilename}`);
      
      const imageBuffer = fs.readFileSync(imageFile.filepath);
      const imageExtension = imageFile.originalFilename?.split('.').pop() || 'png';
      const uniqueImageName = `${imageFile.originalFilename?.replace(/\.[^/.]+$/, '')}-${timestamp}-${randomSuffix}.${imageExtension}` || `image-${timestamp}-${randomSuffix}.png`;
      const imageFileObject = new File([imageBuffer], uniqueImageName, {
        type: imageFile.mimetype || 'image/png'
      });
      
      imageUpload = await pinata.upload.public.file(imageFileObject, {
        metadata: {
          name: `${folderName}/${uniqueImageName}`,
          keyvalues: {
            type: "image", 
            folder: folderName,
            originalName: imageFile.originalFilename || 'image.png',
            timestamp: timestamp.toString()
          }
        }
      });
    }

    // Create URLs for the uploaded files
    const xmlUrl = await pinata.gateways.public.convert(xmlUpload.cid);
    const imageUrl = imageUpload ? await pinata.gateways.public.convert(imageUpload.cid) : null;

    // Return the upload results
    const response = {
      success: true,
      folderName,
      xml: {
        cid: xmlUpload.cid,
        url: xmlUrl,
        name: xmlFile.originalFilename || 'certificate.xml'
      },
      image: imageUpload && imageFile ? {
        cid: imageUpload.cid,
        url: imageUrl,
        name: imageFile.originalFilename || 'image.png'
      } : null
    };

    console.log('Upload response:', response);
    
    return res.status(200).json(response);
    
  } catch (e) {
    console.error('Upload error details:', {
      message: e instanceof Error ? e.message : 'Unknown error',
      stack: e instanceof Error ? e.stack : undefined,
      name: e instanceof Error ? e.name : 'Unknown',
      timestamp: new Date().toISOString()
    });
    
    return res.status(500).json({
      error: "Internal Server Error", 
      details: e instanceof Error ? e.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
