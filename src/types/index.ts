export interface CertificateData {
  // Legacy fields for backward compatibility
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
  
  // DCC-specific fields
  certificateId: string;
  schemaVersion: string;
  countryCode: string;
  language: string;
  receiptDate: string | null;
  validFrom: string | null;
  validUntil: string | null;
  issueDate: string;
  labName: string;
  labEmail: string;
  labPhone: string;
  labStreet: string;
  labCity: string;
  labPostalCode: string;
  labCountryCode: string;
  labLocation: string;
  customerName: string;
  customerEmail: string;
  customerStreet: string;
  customerCity: string;
  customerPostalCode: string;
  customerCountryCode: string;
  responsiblePerson: string;
  mainSigner: boolean;
  itemName: string;
  manufacturer: string;
  itemModel: string;
  itemIdentifications: string;
  dccSoftware: string;
  softwareVersion: string;
  softwareDescription: string;
  measurementType: string;
  measurementMethod: string;
  measurementUnit: string;
  measuredValue: string;
  measurementUncertainty: string;
  measurementDeclaration: string;
  externalUrl: string;
  imageUrl: string;
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
  nome: string;
  descricao: string;
  imagem: string;
  arquivo_certificado: string;
  atributos: Array<{
    tipo_caracteristica: string;
    valor: string;
  }>;
  equipamentos_medicao: Array<{
    nome: string;
    identificacoes: Array<{
      tipo: string;
      valor: string;
    }>;
    endereco_onchain?: string;
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