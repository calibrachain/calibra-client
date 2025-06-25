import { CertificateData } from '../types';
import metadataTemplate from './metadata-template.json';

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  certificate_file: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  measurement_equipment: Array<{
    name: string;
    identifications: Array<{
      type: string;
      value: string;
    }>;
    onchain_address: string;
  }>;
}

export const generateMetadataFromTemplate = (
  certificateData: CertificateData, 
  imageUrl?: string,
  certificateFileUrl?: string
): NFTMetadata => {
  // Convert the template to a string and replace all placeholders
  let metadataString = JSON.stringify(metadataTemplate, null, 2);
  
  // Calculate expiration date (1 year from issue date)
  const issueDate = new Date(certificateData.issueDate);
  const expirationDate = new Date(issueDate);
  expirationDate.setFullYear(expirationDate.getFullYear() + 1);
  
  // Create certificate name
  const certificateName = `Calibration Certificate #${certificateData.certificateId}`;
  
  // Create description
  const description = `Certificate for ${certificateData.itemName} model ${certificateData.itemModel} from ${certificateData.customerName}.`;
  
  // Get instrument name
  const instrumentName = `${certificateData.itemName} ${certificateData.itemModel}`;
  
  // Get reference certificate info (from first standard if available)
  const referenceStandards = certificateData.standards || [];
  const firstStandard = referenceStandards[0];
  const referenceCertificateName = firstStandard ? 
    `Calibration Certificate #${firstStandard.certificate}` : 
    "Reference Standard";
  const referenceSerial = firstStandard ? firstStandard.serialNumber : "";
  
  // Define all the replacements
  const replacements: Record<string, string> = {
    '{{CERTIFICATE_NAME}}': certificateName,
    '{{DESCRIPTION}}': description,
    '{{IMAGE_URL}}': imageUrl || "",
    '{{CERTIFICATE_FILE_URL}}': certificateFileUrl || "",
    '{{LAB_NAME}}': certificateData.labName,
    '{{ISSUE_DATE}}': certificateData.issueDate,
    '{{EXPIRATION_DATE}}': expirationDate.toISOString().split('T')[0],
    '{{INSTRUMENT_NAME}}': instrumentName,
    '{{SERIAL_NUMBER}}': certificateData.serialNumber,
    '{{REFERENCE_CERTIFICATE_NAME}}': referenceCertificateName,
    '{{REFERENCE_SERIAL}}': referenceSerial,
    '{{ONCHAIN_ADDRESS}}': "" // Empty by default
  };

  // Replace all placeholders
  Object.entries(replacements).forEach(([placeholder, value]) => {
    metadataString = metadataString.replace(new RegExp(placeholder, 'g'), value);
  });

  // Parse back to object and return
  return JSON.parse(metadataString) as NFTMetadata;
};

export const saveMetadataToFile = async (metadata: NFTMetadata, certificateId: string): Promise<string> => {
  try {
    const filename = `metadata-${certificateId}-${Date.now()}.json`;
    const response = await fetch('/api/save-file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename,
        content: JSON.stringify(metadata, null, 2)
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save metadata file');
    }

    const result = await response.json();
    return result.url;
  } catch (error) {
    console.error('Error saving metadata file:', error);
    throw error;
  }
};

export const processAndGenerateMetadata = async (
  certificateData: CertificateData,
  uploadToIPFS = false,
  imageUrl?: string,
  certificateFileUrl?: string
): Promise<{ metadata: NFTMetadata; url?: string; ipfsHash?: string }> => {
  const metadata = generateMetadataFromTemplate(certificateData, imageUrl, certificateFileUrl);
  
  let url: string | undefined;

  if (!uploadToIPFS) {
    url = await saveMetadataToFile(metadata, certificateData.certificateId);
  }

  return {
    metadata,
    url
  };
};
