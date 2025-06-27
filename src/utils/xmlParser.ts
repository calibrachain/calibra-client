import { parseString } from 'xml2js';
import { CertificateData } from '../types';

interface DCCXMLData {
  'dcc:digitalCalibrationCertificate': {
    $: {
      schemaVersion: string;
    };
    'dcc:administrativeData': [{
      'dcc:coreData': [{
        'dcc:countryCodeISO3166_1': [string];
        'dcc:usedLangCodeISO639_1': [string];
        'dcc:mandatoryLangCodeISO639_1': [string];
        'dcc:uniqueIdentifier': [string];
        'dcc:receiptDate'?: [string];
        'dcc:beginPerformanceDate': [string];
        'dcc:endPerformanceDate': [string];
      }];
      'dcc:items': [{
        'dcc:item': [{
          'dcc:name': [{
            'dcc:content': [{
              _: string;
              $: { lang: string };
            }];
          }];
          'dcc:manufacturer'?: [{
            'dcc:name': [{
              'dcc:content': [{
                _: string;
                $: { lang: string };
              }];
            }];
          }];
          'dcc:model'?: [string];
          'dcc:identifications'?: [{
            'dcc:identification': [{
              'dcc:issuer': [string];
              'dcc:value': [string];
              'dcc:name': [{
                'dcc:content': [{
                  _: string;
                  $: { lang: string };
                }];
              }];
            }];
          }];
        }];
      }];
      'dcc:calibrationLaboratory': [{
        'dcc:contact': [{
          'dcc:name': [{
            'dcc:content': [{
              _: string;
              $: { lang: string };
            }];
          }];
          'dcc:eMail'?: [string];
          'dcc:phone'?: [string];
          'dcc:location'?: [{
            'dcc:city': [string];
            'dcc:countryCode': [string];
            'dcc:postCode': [string];
            'dcc:street': [string];
          }];
        }];
      }];
      'dcc:customer': [{
        'dcc:name': [{
          'dcc:content': [{
            _: string;
            $: { lang: string };
          }];
        }];
        'dcc:eMail'?: [string];
        'dcc:location'?: [{
          'dcc:city': [string];
          'dcc:countryCode': [string];
          'dcc:postCode': [string];
          'dcc:street': [string];
        }];
      }];
      'dcc:respPersons': [{
        'dcc:respPerson': [{
          'dcc:person': [{
            'dcc:name': [{
              'dcc:content': [{
                _: string;
                $: { lang: string };
              }];
            }];
          }];
          'dcc:mainSigner': [string];
        }];
      }];
      'dcc:dccSoftware': [{
        'dcc:software': [{
          'dcc:name': [{
            'dcc:content': [{
              _: string;
              $: { lang: string };
            }];
          }];
          'dcc:release': [string];
          'dcc:description'?: [{
            'dcc:content': [{
              _: string;
              $: { lang: string };
            }];
          }];
        }];
      }];
    }];
    'dcc:measurementResults': [{
      'dcc:measurementResult': [{
        'dcc:name': [{
          'dcc:content': [{
            _: string;
            $: { lang: string };
          }];
        }];
        'dcc:usedMethods': [{
          'dcc:usedMethod': [{
            'dcc:name': [{
              'dcc:content': [{
                _: string;
                $: { lang: string };
              }];
            }];
          }];
        }];
        'dcc:measuringEquipments'?: [{
          'dcc:measuringEquipment': [{
            'dcc:name': [{
              'dcc:content': [{
                _: string;
                $: { lang: string };
              }];
            }];
            'dcc:manufacturer'?: [{
              'dcc:name': [{
                'dcc:content': [{
                  _: string;
                  $: { lang: string };
                }];
              }];
            }];
            'dcc:model'?: [string];
            'dcc:identifications'?: [{
              'dcc:identification': [{
                'dcc:issuer': [string];
                'dcc:value': [string];
                'dcc:name': [{
                  'dcc:content': [{
                    _: string;
                    $: { lang: string };
                  }];
                }];
              }];
            }];
            'dcc:certificate'?: [{
              'dcc:referenceID': [string];
              'dcc:reference': [string];
            }];
          }];
        }];
        'dcc:measurementMetaData'?: [{
          'dcc:metaData': [{
            'dcc:declaration': [{
              'dcc:content': [{
                _: string;
                $: { lang: string };
              }];
            }];
          }];
        }];
        'dcc:data': [{
          'dcc:quantity': [{
            'dcc:name': [{
              'dcc:content': [{
                _: string;
                $: { lang: string };
              }];
            }];
            'dcc:unit': Record<string, unknown>[];
          }];
          'dcc:list': [{
            'dcc:datum': [{
              'dcc:measured': [{
                'si:real': [string];
              }];
              'dcc:uncertainty': [{
                'si:real': [string];
              }];
            }];
          }];
        }];
      }];
    }];
  };
}

export const parseXMLFile = (xmlContent: string): Promise<CertificateData> => {
  return new Promise((resolve, reject) => {
    parseString(xmlContent, { 
      explicitArray: true,
      mergeAttrs: false,
      explicitChildren: false,
      preserveChildrenOrder: false
    }, (err, result: DCCXMLData) => {
      if (err) {
        reject(new Error(`XML parsing error: ${err.message}`));
        return;
      }

      try {
        const dcc = result['dcc:digitalCalibrationCertificate'];
        if (!dcc) {
          reject(new Error('Invalid DCC XML: Missing digitalCalibrationCertificate root element'));
          return;
        }

        const adminData = dcc['dcc:administrativeData']?.[0];
        if (!adminData) {
          reject(new Error('Invalid DCC XML: Missing administrativeData'));
          return;
        }

        const coreData = adminData['dcc:coreData']?.[0];
        const items = adminData['dcc:items']?.[0];
        const lab = adminData['dcc:calibrationLaboratory']?.[0];
        const customer = adminData['dcc:customer']?.[0];
        const respPersons = adminData['dcc:respPersons']?.[0];
        const software = adminData['dcc:dccSoftware']?.[0];
        const measurements = dcc['dcc:measurementResults']?.[0];

        if (!coreData || !items || !lab || !customer) {
          reject(new Error('Invalid DCC XML: Missing required elements'));
          return;
        }

        // Extract core data
        const certificateId = coreData['dcc:uniqueIdentifier']?.[0] || 'N/A';
        const countryCode = coreData['dcc:countryCodeISO3166_1']?.[0] || 'N/A';
        const language = coreData['dcc:usedLangCodeISO639_1']?.[0] || 'en';
        const receiptDate = coreData['dcc:receiptDate']?.[0] || null;
        const beginDate = coreData['dcc:beginPerformanceDate']?.[0] || null;
        const endDate = coreData['dcc:endPerformanceDate']?.[0] || null;

        // Extract item data
        const item = items['dcc:item']?.[0];
        const itemName = item?.['dcc:name']?.[0]?.['dcc:content']?.[0]?._ || 'N/A';
        const manufacturer = item?.['dcc:manufacturer']?.[0]?.['dcc:name']?.[0]?.['dcc:content']?.[0]?._ || 'N/A';
        const model = item?.['dcc:model']?.[0] || 'N/A';
        const serialNumber = item?.['dcc:identifications']?.[0]?.['dcc:identification']?.[0]?.['dcc:value']?.[0] || 'N/A';

        // Extract laboratory data
        const labContact = lab['dcc:contact']?.[0];
        const labName = labContact?.['dcc:name']?.[0]?.['dcc:content']?.[0]?._ || 'N/A';
        const labEmail = labContact?.['dcc:eMail']?.[0] || '';
        const labPhone = labContact?.['dcc:phone']?.[0] || '';
        const labLocation = labContact?.['dcc:location']?.[0];
        const labStreet = labLocation?.['dcc:street']?.[0] || '';
        const labCity = labLocation?.['dcc:city']?.[0] || '';
        const labPostalCode = labLocation?.['dcc:postCode']?.[0] || '';
        const labCountryCode = labLocation?.['dcc:countryCode']?.[0] || '';

        // Extract customer data
        const customerName = customer['dcc:name']?.[0]?.['dcc:content']?.[0]?._ || 'N/A';
        const customerEmail = customer['dcc:eMail']?.[0] || '';
        const customerLocation = customer['dcc:location']?.[0];
        const customerStreet = customerLocation?.['dcc:street']?.[0] || '';
        const customerCity = customerLocation?.['dcc:city']?.[0] || '';
        const customerPostalCode = customerLocation?.['dcc:postCode']?.[0] || '';
        const customerCountryCode = customerLocation?.['dcc:countryCode']?.[0] || '';

        // Extract responsible person
        const respPerson = respPersons?.['dcc:respPerson']?.[0];
        const responsiblePerson = respPerson?.['dcc:person']?.[0]?.['dcc:name']?.[0]?.['dcc:content']?.[0]?._ || 'N/A';
        const mainSigner = respPerson?.['dcc:mainSigner']?.[0] || 'false';

        // Extract software data
        const softwareInfo = software?.['dcc:software']?.[0];
        const softwareName = softwareInfo?.['dcc:name']?.[0]?.['dcc:content']?.[0]?._ || 'N/A';
        const softwareVersion = softwareInfo?.['dcc:release']?.[0] || 'N/A';
        const softwareDescription = softwareInfo?.['dcc:description']?.[0]?.['dcc:content']?.[0]?._ || '';

        // Extract measurement data
        const measurementResult = measurements?.['dcc:measurementResult']?.[0];
        const measurementType = measurementResult?.['dcc:name']?.[0]?.['dcc:content']?.[0]?._ || 'N/A';
        const measurementMethod = measurementResult?.['dcc:usedMethods']?.[0]?.['dcc:usedMethod']?.[0]?.['dcc:name']?.[0]?.['dcc:content']?.[0]?._ || 'N/A';
        const measurementDeclaration = measurementResult?.['dcc:measurementMetaData']?.[0]?.['dcc:metaData']?.[0]?.['dcc:declaration']?.[0]?.['dcc:content']?.[0]?._ || '';
        
        const measurementData = measurementResult?.['dcc:data']?.[0];
        const measurementUnit = measurementData?.['dcc:quantity']?.[0]?.['dcc:unit']?.[0] ? Object.keys(measurementData['dcc:quantity'][0]['dcc:unit'][0])[0]?.replace('si:', '') || 'N/A' : 'N/A';
        const measurementValue = measurementData?.['dcc:list']?.[0]?.['dcc:datum']?.[0]?.['dcc:measured']?.[0]?.['si:real']?.[0] || 'N/A';
        const measurementUncertainty = measurementData?.['dcc:list']?.[0]?.['dcc:datum']?.[0]?.['dcc:uncertainty']?.[0]?.['si:real']?.[0] || 'N/A';

        // Extract measuring equipment data
        const measuringEquipments = measurementResult?.['dcc:measuringEquipments']?.[0]?.['dcc:measuringEquipment'] || [];
        const standards = measuringEquipments.map(equipment => {
          const equipmentName = equipment?.['dcc:name']?.[0]?.['dcc:content']?.[0]?._ || 'N/A';
          const equipmentModel = equipment?.['dcc:model']?.[0] || 'N/A';
          const equipmentSerial = equipment?.['dcc:identifications']?.[0]?.['dcc:identification']?.[0]?.['dcc:value']?.[0] || 'N/A';
          const certificateRef = equipment?.['dcc:certificate']?.[0];
          const referenceID = certificateRef?.['dcc:referenceID']?.[0] || 'N/A';
          const onchainReference = certificateRef?.['dcc:reference']?.[0]?.replace(/"/g, '') || ''; // Remove quotes
          
          return {
            name: `${equipmentName} ${equipmentModel}`,
            serialNumber: equipmentSerial,
            certificate: referenceID,
            onchainAddress: onchainReference
          };
        });

        // If no measuring equipment found, create default entry
        if (standards.length === 0) {
          standards.push({
            name: 'DCC Standard',
            serialNumber: 'N/A',
            certificate: certificateId,
            onchainAddress: ''
          });
        }

        const certificateData: CertificateData = {
          // Legacy fields for backward compatibility
          certificateNumber: certificateId,
          laboratory: labName,
          client: customerName,
          instrument: itemName,
          serialNumber: serialNumber,
          calibrationDate: beginDate || '',
          expirationDate: endDate || '',
          standards: standards,
          
          // DCC-specific fields
          certificateId,
          schemaVersion: dcc.$.schemaVersion || '2.4.0',
          countryCode,
          language,
          receiptDate,
          validFrom: beginDate,
          validUntil: endDate,
          issueDate: beginDate || new Date().toISOString().split('T')[0], // Use begin date from XML
          labName,
          labEmail,
          labPhone,
          labStreet,
          labCity,
          labPostalCode,
          labCountryCode,
          labLocation: `${labCity}, ${labCountryCode}`,
          customerName,
          customerEmail,
          customerStreet,
          customerCity,
          customerPostalCode,
          customerCountryCode,
          responsiblePerson,
          mainSigner: mainSigner === 'true',
          itemName,
          manufacturer,
          itemModel: model,
          itemIdentifications: serialNumber, // Using serial number as main identification
          dccSoftware: softwareName,
          softwareVersion,
          softwareDescription,
          measurementType,
          measurementMethod,
          measurementUnit,
          measuredValue: measurementValue,
          measurementUncertainty,
          measurementDeclaration,
          externalUrl: 'https://calibra.vercel.app',
          imageUrl: 'https://calibra.vercel.app/image.png'
        };

        resolve(certificateData);
      } catch (error) {
        reject(new Error(`Error processing DCC XML: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });
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