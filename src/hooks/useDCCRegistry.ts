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
    const provider = new BrowserProvider(walletClient.transport as any);
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
        request.accreditationNumber,// Accreditation number for laboratory verification
        request.tokenURI            // Token URI (IPFS metadata)
      ];

      console.log('🔗 Sending certificate request to DCCRegistry...');
      console.log('Args:', args);
      console.log('Token URI:', request.tokenURI);
      console.log('Accreditation Number:', request.accreditationNumber);

      // Call the verifyAndMint function
      const tx = await contract.verifyAndMint(args);
      
      console.log('📤 Transaction sent:', tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      console.log('✅ Transaction confirmed:', receipt.hash);

      // Extract request ID from events for internal tracking
      const requestSentEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'FunctionsRequestSent';
        } catch {
          return false;
        }
      });

      if (requestSentEvent) {
        const parsed = contract.interface.parseLog(requestSentEvent);
        const requestId = parsed?.args[0] || null;
        setLastRequestId(requestId);
        console.log('🆔 Request ID:', requestId);
      }

      // Return the transaction hash, not the request ID
      return tx.hash;

    } catch (err) {
      console.error('❌ Certificate request failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
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
