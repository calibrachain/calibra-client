import { parseString } from 'xml2js';
import { CertificateData } from '../types';
import { generateMockCertificateData } from './mockData';

export const parseXMLFile = (xmlContent: string): Promise<CertificateData> => {
  return new Promise((resolve, reject) => {
    // For demo purposes, we'll simulate XML parsing and return mock data
    // In a real implementation, you would parse the actual XML content
    
    setTimeout(() => {
      try {
        // Simulate parsing delay
        const mockData = generateMockCertificateData();
        resolve(mockData);
      } catch (error) {
        reject(new Error('Error processing XML file. Please check if the format is correct.'));
      }
    }, 1500);
  });
};

export const validateXMLFile = (file: File): boolean => {
  const validTypes = ['text/xml', 'application/xml'];
  const validExtensions = ['.xml'];
  
  const hasValidType = validTypes.includes(file.type);
  const hasValidExtension = validExtensions.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  );
  
  return hasValidType || hasValidExtension;
};