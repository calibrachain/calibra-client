import { BrowserProvider, Contract } from 'ethers';
import { useCallback, useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { DCCRegistryABI, DCCRegistryAddresses, type CertificateRequest } from '../contracts/DCCRegistry';

export interface UseDCCRegistryReturn {
  // State
  isLoading: boolean;
  error: string | null;
  lastRequestId: string | null;
  
  // Functions
  sendCertificateRequest: (request: CertificateRequest) => Promise<string | null>;
  clearError: () => void;
}

export function useDCCRegistry(): UseDCCRegistryReturn {
  const { address, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequestId, setLastRequestId] = useState<string | null>(null);

  const getContract = useCallback(async () => {
    if (!walletClient || !chainId) {
      throw new Error('Wallet not connected');
    }

    const contractAddress = DCCRegistryAddresses[chainId as keyof typeof DCCRegistryAddresses];
    if (!contractAddress) {
      throw new Error(`DCCRegistry not deployed on chain ${chainId}`);
    }

    // Convert wagmi wallet client to ethers provider
    const provider = new BrowserProvider(walletClient.transport as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    const signer = await provider.getSigner();
    
    return new Contract(contractAddress, DCCRegistryABI, signer);
  }, [walletClient, chainId]);

  const sendCertificateRequest = useCallback(async (request: CertificateRequest): Promise<string | null> => {
    if (!address) {
      setError('Wallet not connected');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = await getContract();

      // Prepare arguments for Chainlink Functions
      const args = [
        request.labIdentifier,           // Laboratory identifier for verification
        request.labDetails.name,         // Laboratory name
        request.labDetails.email,        // Laboratory email
        request.labDetails.location,     // Laboratory location
        request.labDetails.countryCode,  // Laboratory country code
        request.clienteAddress,          // Client address
        request.tokenURI                 // Token URI (IPFS metadata)
      ];

      // Additional bytes arguments (if needed in the future)
      const bytesArgs: string[] = [];

      console.log('🔗 Sending certificate request to DCCRegistry...');
      console.log('Contract Address:', await contract.getAddress());
      console.log('Args:', args);
      console.log('Args Length:', args.length);
      console.log('BytesArgs:', bytesArgs);
      console.log('Wallet Address:', address);
      console.log('Chain ID:', chainId);

      // First, let's check if the contract has the required functions
      console.log('🔍 Checking contract owner...');
      try {
        const owner = await contract.owner();
        console.log('Contract Owner:', owner);
        console.log('Is caller owner?', owner.toLowerCase() === address.toLowerCase());
      } catch (ownerError) {
        console.log('❌ Error checking owner:', ownerError);
      }

      // Try to estimate gas first to see if the transaction would succeed
      console.log('⛽ Estimating gas...');
      try {
        const gasEstimate = await contract.sendRequest.estimateGas(args, bytesArgs);
        console.log('Gas Estimate:', gasEstimate.toString());
      } catch (gasError) {
        console.error('❌ Gas estimation failed:', gasError);
        throw new Error(`Transaction would fail: ${gasError instanceof Error ? gasError.message : 'Unknown gas error'}`);
      }

      // Call the sendRequest function
      console.log('📝 Sending transaction...');
      const tx = await contract.sendRequest(args, bytesArgs);
      
      console.log('📤 Transaction sent:', tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      console.log('✅ Transaction confirmed:', receipt.hash);

      // Extract request ID from events
      const requestSentEvent = receipt.logs.find((log: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'FunctionsRequestSent';
        } catch {
          return false;
        }
      });

      let requestId: string | null = null;
      if (requestSentEvent) {
        const parsed = contract.interface.parseLog(requestSentEvent);
        requestId = parsed?.args[0] || null;
        setLastRequestId(requestId);
        console.log('🆔 Request ID:', requestId);
      }

      return requestId;

    } catch (err) {
      console.error('❌ Certificate request failed:', err);
      
      let errorMessage = 'Unknown error occurred';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Check for specific contract errors
        if (errorMessage.includes('execution reverted')) {
          errorMessage = 'Smart contract rejected the transaction. This could be because:\n' +
                        '• You are not the contract owner\n' +
                        '• The contract is not properly configured\n' +
                        '• Invalid parameters were provided\n' +
                        '• The contract is paused or has restrictions';
        } else if (errorMessage.includes('user rejected')) {
          errorMessage = 'Transaction was rejected by user';
        } else if (errorMessage.includes('insufficient funds')) {
          errorMessage = 'Insufficient AVAX balance to pay for transaction fees';
        } else if (errorMessage.includes('nonce too low')) {
          errorMessage = 'Transaction nonce error. Please try again.';
        }
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [address, getContract]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    lastRequestId,
    sendCertificateRequest,
    clearError,
  };
}
