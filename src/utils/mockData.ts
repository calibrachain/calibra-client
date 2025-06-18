import { CertificateData } from '../types';

export const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateMockCertificateData = (): CertificateData => {
  const calibrationDate = new Date();
  const expirationDate = new Date(calibrationDate.getTime() + 365 * 24 * 60 * 60 * 1000);

  return {
    certificateNumber: `CERT-${generateRandomString(9)}`,
    laboratory: 'Example Calibration Laboratory Ltd.',
    client: 'XYZ Industrial Client',
    instrument: 'Digital Pressure Gauge P-500',
    serialNumber: `SN${generateRandomString(6)}`,
    calibrationDate: calibrationDate.toISOString().split('T')[0],
    expirationDate: expirationDate.toISOString().split('T')[0],
    standards: [
      {
        name: 'Primary Pressure Standard',
        serialNumber: 'STD001',
        certificate: 'CERT-STD-001'
      },
      {
        name: 'Fluke 8508A Standard Multimeter',
        serialNumber: 'STD002',
        certificate: 'CERT-STD-002'
      }
    ]
  };
};

export const generateIPFSHash = (): string => {
  return `Qm${generateRandomString(44)}`;
};

export const generateTransactionHash = (): string => {
  return `0x${generateRandomString(64).toLowerCase()}`;
};

export const simulateChainlinkLogs = [
  '🔗 Initializing Chainlink Functions...',
  '📡 Connecting to Chainlink network nodes...',
  '🔍 Verifying laboratory credentials...',
  '📋 Validating certificate data...',
  '🏭 Querying accredited laboratories database...',
  '✅ Laboratory verified successfully!',
  '🔐 Generating verification hash...',
  '📝 Creating audit record...',
  '🌐 Sending data to blockchain...',
  '✨ Digital certificate created successfully!'
];