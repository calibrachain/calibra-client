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

// DCC Schema Types (based on PTB Digital Calibration Certificate)
export interface DCCData {
  schemaVersion: string;
  administrativeData: {
    coreData: {
      countryCodeISO3166_1: string;
      uniqueIdentifier: string;
      beginPerformanceDate: string;
      endPerformanceDate: string;
    };
    calibrationLaboratory: {
      contact: {
        name: string;
        email?: string;
        location?: {
          city?: string;
          countryCode?: string;
          street?: string;
        };
      };
    };
    customer: {
      name: string;
      email?: string;
      location?: {
        city?: string;
        countryCode?: string;
      };
    };
    items: {
      item: Array<{
        name: string;
        manufacturer: {
          name: string;
        };
        model?: string;
        identifications: Array<{
          issuer: string;
          value: string;
          description?: string;
        }>;
      }>;
    };
  };
  measurementResults: {
    measurementResult: Array<{
      measuringEquipments?: {
        measuringEquipment: Array<{
          name: string;
          manufacturer?: {
            name: string;
          };
          model?: string;
          identifications?: Array<{
            issuer: string;
            value: string;
          }>;
          certificate?: {
            reference: string;
            referenceID: string;
          };
        }>;
      };
      results: {
        result: Array<{
          name: string;
          description?: string;
          data: object; // Complex type with quantities, text, etc.
        }>;
      };
    }>;
  };
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