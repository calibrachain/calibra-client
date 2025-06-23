import type { NextApiRequest, NextApiResponse } from "next";
import { pinata } from "../../src/utils/config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { metadata, folderName } = req.body;
    
    if (!metadata || !folderName) {
      return res.status(400).json({
        error: "Metadata and folderName are required"
      });
    }

    console.log(`Uploading metadata for folder: ${folderName}`);

    // Add additional uniqueness to metadata filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    
    // Convert metadata object to JSON file
    const metadataJson = JSON.stringify(metadata, null, 2);
    const metadataFile = new File([metadataJson], `${folderName}-metadata-${timestamp}-${randomSuffix}.json`, {
      type: 'application/json'
    });

    // Upload metadata file with folder reference
    const metadataUpload = await pinata.upload.public.file(metadataFile, {
      metadata: {
        name: `${folderName}/${metadataFile.name}`,
        keyvalues: {
          type: "metadata",
          folder: folderName,
          originalName: metadataFile.name
        }
      }
    });

    // Create URL for the metadata
    const metadataUrl = await pinata.gateways.public.convert(metadataUpload.cid);

    const response = {
      success: true,
      metadata: {
        cid: metadataUpload.cid,
        url: metadataUrl,
        name: metadataFile.name
      }
    };

    console.log('Metadata upload response:', response);
    
    return res.status(200).json(response);
    
  } catch (e) {
    console.error('Metadata upload error:', e);
    return res.status(500).json({
      error: "Internal Server Error", 
      details: e instanceof Error ? e.message : 'Unknown error'
    });
  }
}
