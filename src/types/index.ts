export interface CertificateData {
  certificateNumber: string;
  laboratory: string;
  client: string;
  instrument: string;
  serialNumber: string;
  calibrationDate: string;
  expirationDate: string;
  standards: Array<{
    name: string;
    serialNumber: string;
    certificate: string;
  }>;
}

export interface MetadataJSON {
  name: string;
  description: string;
  image: string;
  certificate_file: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  measuring_equipments: Array<{
    name: string;
    identifications: Array<{
      type: string;
      value: string;
    }>;
    onchain_address?: string;
  }>;
}

export interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
}

export interface IPFSUploadResult {
  fileHash: string;
  metadataHash: string;
  gatewayUrl: string;
}

export interface ProcessingStep {
  message: string;
  completed: boolean;
}