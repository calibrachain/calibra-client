import { CertificateData } from '../types';
import metadataTemplate from './metadata-template.json';

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  properties: {
    certificate_data: Record<string, unknown>;
  };
}

export const generateMetadataFromTemplate = (certificateData: CertificateData): NFTMetadata => {
  // Convert the template to a string and replace all placeholders
  let metadataString = JSON.stringify(metadataTemplate, null, 2);
  
  // Define all the replacements
  const replacements: Record<string, string> = {
    '{{CERTIFICATE_NAME}}': `DCC - ${certificateData.itemName} ${certificateData.itemModel}`,
    '{{CERTIFICATE_ID}}': certificateData.certificateId,
    '{{ISSUE_DATE}}': certificateData.issueDate,
    '{{VALID_FROM}}': certificateData.validFrom || 'N/A',
    '{{VALID_UNTIL}}': certificateData.validUntil || 'N/A',
    '{{RECEIPT_DATE}}': certificateData.receiptDate || 'N/A',
    '{{LAB_NAME}}': certificateData.labName,
    '{{LAB_EMAIL}}': certificateData.labEmail,
    '{{LAB_PHONE}}': certificateData.labPhone,
    '{{LAB_STREET}}': certificateData.labStreet,
    '{{LAB_CITY}}': certificateData.labCity,
    '{{LAB_POSTAL_CODE}}': certificateData.labPostalCode,
    '{{LAB_COUNTRY_CODE}}': certificateData.labCountryCode,
    '{{LAB_LOCATION}}': certificateData.labLocation,
    '{{CUSTOMER_NAME}}': certificateData.customerName,
    '{{CUSTOMER_EMAIL}}': certificateData.customerEmail,
    '{{CUSTOMER_STREET}}': certificateData.customerStreet,
    '{{CUSTOMER_CITY}}': certificateData.customerCity,
    '{{CUSTOMER_POSTAL_CODE}}': certificateData.customerPostalCode,
    '{{CUSTOMER_COUNTRY_CODE}}': certificateData.customerCountryCode,
    '{{RESPONSIBLE_PERSON}}': certificateData.responsiblePerson,
    '{{MAIN_SIGNER}}': certificateData.mainSigner.toString(),
    '{{ITEM_NAME}}': certificateData.itemName,
    '{{MANUFACTURER}}': certificateData.manufacturer,
    '{{ITEM_MODEL}}': certificateData.itemModel,
    '{{SERIAL_NUMBER}}': certificateData.serialNumber,
    '{{ITEM_IDENTIFICATIONS}}': certificateData.itemIdentifications,
    '{{COUNTRY_CODE}}': certificateData.countryCode,
    '{{LANGUAGE}}': certificateData.language,
    '{{SCHEMA_VERSION}}': certificateData.schemaVersion,
    '{{DCC_SOFTWARE}}': certificateData.dccSoftware,
    '{{SOFTWARE_VERSION}}': certificateData.softwareVersion,
    '{{SOFTWARE_DESCRIPTION}}': certificateData.softwareDescription,
    '{{MEASUREMENT_TYPE}}': certificateData.measurementType,
    '{{MEASUREMENT_METHOD}}': certificateData.measurementMethod,
    '{{MEASUREMENT_UNIT}}': certificateData.measurementUnit,
    '{{MEASURED_VALUE}}': certificateData.measuredValue,
    '{{MEASUREMENT_UNCERTAINTY}}': certificateData.measurementUncertainty,
    '{{MEASUREMENT_DECLARATION}}': certificateData.measurementDeclaration,
    '{{EXTERNAL_URL}}': certificateData.externalUrl,
    '{{IMAGE_URL}}': certificateData.imageUrl
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

// Optional: Upload to IPFS (placeholder for future implementation)
export const uploadMetadataToIPFS = async (metadata: NFTMetadata): Promise<string> => {
  // TODO: Implement IPFS upload using a service like Pinata, Web3.Storage, or local IPFS node
  console.log('IPFS upload not implemented yet', metadata);
  throw new Error('IPFS upload not implemented yet');
};

export const processAndGenerateMetadata = async (
  certificateData: CertificateData,
  uploadToIPFS = false
): Promise<{ metadata: NFTMetadata; url?: string; ipfsHash?: string }> => {
  const metadata = generateMetadataFromTemplate(certificateData);
  
  let url: string | undefined;
  let ipfsHash: string | undefined;

  if (uploadToIPFS) {
    try {
      ipfsHash = await uploadMetadataToIPFS(metadata);
    } catch (error) {
      console.warn('IPFS upload failed, falling back to local file save:', error);
      url = await saveMetadataToFile(metadata, certificateData.certificateId);
    }
  } else {
    url = await saveMetadataToFile(metadata, certificateData.certificateId);
  }

  return {
    metadata,
    url,
    ipfsHash
  };
};
