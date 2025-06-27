// DCCRegistry Contract ABI and Types
export const DCCRegistryABI = [
  {
    "type": "constructor",
    "inputs": [
      { "name": "_router", "type": "address", "internalType": "address" },
      { "name": "_owner", "type": "address", "internalType": "address" },
      { "name": "_donId", "type": "bytes32", "internalType": "bytes32" },
      { "name": "_subscriptionId", "type": "uint64", "internalType": "uint64" }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setNftContract",
    "inputs": [
      { "name": "_nftContract", "type": "address", "internalType": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setSourceCode",
    "inputs": [
      { "name": "_sourceCode", "type": "string", "internalType": "string" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "sendRequest",
    "inputs": [
      { "name": "_args", "type": "string[]", "internalType": "string[]" },
      { "name": "_bytesArgs", "type": "bytes[]", "internalType": "bytes[]" }
    ],
    "outputs": [
      { "name": "requestId_", "type": "bytes32", "internalType": "bytes32" }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "address", "internalType": "address" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "FunctionsRequestSent",
    "inputs": [
      { "name": "requestId", "type": "bytes32", "indexed": false, "internalType": "bytes32" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Response",
    "inputs": [
      { "name": "requestId", "type": "bytes32", "indexed": false, "internalType": "bytes32" },
      { "name": "returnedValue", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "RequestFailed",
    "inputs": [
      { "name": "requestId", "type": "bytes32", "indexed": false, "internalType": "bytes32" },
      { "name": "err", "type": "bytes", "indexed": false, "internalType": "bytes" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "LaboratoryInactive",
    "inputs": [
      { "name": "requestId", "type": "bytes32", "indexed": false, "internalType": "bytes32" },
      { "name": "err", "type": "bytes", "indexed": false, "internalType": "bytes" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MintingFailed",
    "inputs": [
      { "name": "requestId", "type": "bytes32", "indexed": false, "internalType": "bytes32" }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "UnexpectedRequestID",
    "inputs": [
      { "name": "requestId", "type": "bytes32", "internalType": "bytes32" }
    ]
  },
  {
    "type": "error",
    "name": "RequestAlreadyFulfilled",
    "inputs": [
      { "name": "requestId", "type": "bytes32", "internalType": "bytes32" }
    ]
  }
] as const;

// Contract addresses for different networks
export const DCCRegistryAddresses = {
  // Avalanche Fuji Testnet
  43113: "0xf134b34ed7542Fc028cA35Cd861153A003EbE4Eb"
} as const;

// Types
export interface RequestInfo {
  requestTime: bigint;
  returnedValue: bigint;
  target: string;
  isFulfilled: boolean;
}

export interface DCCRegistryRequest {
  args: string[];
  bytesArgs: string[];
}

export interface CertificateRequest {
  clienteAddress: string;
  tokenURI: string;
  labIdentifier: string;
  labDetails: {
    name: string;
    email: string;
    location: string;
    countryCode: string;
  };
}
