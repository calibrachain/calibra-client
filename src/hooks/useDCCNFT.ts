import { BrowserProvider, Contract, JsonRpcProvider } from 'ethers';
import { useCallback, useState } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { DCCNFTABI, DCCNFTAddresses, type NFTInfo } from '../contracts/DCCNFT';

export interface UseDCCNFTReturn {
  // State
  isLoading: boolean;
  error: string | null;
  nfts: NFTInfo[];
  
  // Functions
  getUserNFTs: () => Promise<NFTInfo[]>;
  getLatestNFT: () => Promise<NFTInfo | null>;
  clearError: () => void;
}

export function useDCCNFT(): UseDCCNFTReturn {
  const account = useAccount();
  const walletClientQuery = useWalletClient();
  const publicClient = usePublicClient();
  
  // Safe destructuring with fallbacks
  const address = account?.address;
  const chainId = account?.chainId;
  const walletClient = walletClientQuery?.data;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nfts, setNfts] = useState<NFTInfo[]>([]);

  const getContract = useCallback(async () => {
    if (!chainId) {
      throw new Error('No chain ID available');
    }

    const contractAddress = DCCNFTAddresses[chainId as keyof typeof DCCNFTAddresses];
    if (!contractAddress) {
      throw new Error(`DCCNFT not deployed on chain ${chainId}`);
    }

    let provider: BrowserProvider | JsonRpcProvider;

    try {
      // Try to use wallet client first if available
      if (walletClient?.transport) {
        provider = new BrowserProvider(walletClient.transport as any);
      } else if (publicClient?.transport) {
        // Fall back to public client  
        const transport = publicClient.transport as any;
        if (transport.url) {
          provider = new JsonRpcProvider(transport.url);
        } else {
          throw new Error('No transport URL available');
        }
      } else {
        // Fall back to RPC URL for the chain
        const rpcUrl = chainId === 43113 
          ? 'https://api.avax-test.network/ext/bc/C/rpc'
          : 'https://api.avax.network/ext/bc/C/rpc';
        provider = new JsonRpcProvider(rpcUrl);
      }
    } catch (providerError) {
      console.error('Error creating provider:', providerError);
      // Last resort: use RPC URL
      const rpcUrl = chainId === 43113 
        ? 'https://api.avax-test.network/ext/bc/C/rpc'
        : 'https://api.avax.network/ext/bc/C/rpc';
      provider = new JsonRpcProvider(rpcUrl);
    }
    
    return new Contract(contractAddress, DCCNFTABI, provider);
  }, [walletClient, publicClient, chainId]);

  const generateSnowtraceUrl = useCallback((tokenId: string): string => {
    if (!chainId) return '';
    
    const contractAddress = DCCNFTAddresses[chainId as keyof typeof DCCNFTAddresses];
    if (!contractAddress) return '';
    
    if (chainId === 43113) { // Fuji testnet
      return `https://testnet.snowtrace.io/nft/${contractAddress}/${tokenId}?chainid=43113&type=erc721`;
    } else if (chainId === 43114) { // Mainnet
      return `https://snowtrace.io/nft/${contractAddress}/${tokenId}?chainid=43114&type=erc721`;
    }
    return '';
  }, [chainId]);

  // Direct contract scanning - check tokens 0 to 50
  const fetchNFTsViaContract = useCallback(async (): Promise<NFTInfo[]> => {
    if (!address) {
      throw new Error('Address not available');
    }

    console.log('🔍 Scanning contract directly for NFTs (0-50)...');
    
    try {
      const contract = await getContract();
      const nftInfos: NFTInfo[] = [];
      const userTokenIds: number[] = [];
      
      // Check tokens 0 to 50
      for (let tokenId = 0; tokenId <= 50; tokenId++) {
        try {
          const owner = await contract.ownerOf(tokenId);
          if (owner.toLowerCase() === address.toLowerCase()) {
            userTokenIds.push(tokenId);
            console.log(`✅ User owns token ID: ${tokenId}`);
          }
        } catch (err) {
          // Token might not exist or other error, skip
          continue;
        }
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      console.log(`� User owns token IDs: [${userTokenIds.join(', ')}]`);
      
      // Get token details for all owned tokens
      for (const tokenId of userTokenIds) {
        try {
          const tokenURI = await contract.tokenURI(tokenId);
          
          nftInfos.push({
            tokenId: tokenId.toString(),
            tokenURI,
            snowtraceUrl: generateSnowtraceUrl(tokenId.toString())
          });
        } catch (err) {
          console.warn(`⚠️ Error getting tokenURI for ${tokenId}:`, err);
        }
      }
      
      // Sort by token ID descending (newest first)
      nftInfos.sort((a, b) => parseInt(b.tokenId) - parseInt(a.tokenId));
      
      console.log(`✅ Found ${nftInfos.length} NFTs via direct scanning`);
      if (nftInfos.length > 0) {
        console.log(`🎯 Latest NFT: Token ID ${nftInfos[0].tokenId}`);
      }
      
      return nftInfos;
    } catch (contractError) {
      console.warn('⚠️ Direct contract scanning failed:', contractError);
      throw contractError;
    }
  }, [address, getContract, generateSnowtraceUrl]);

  const getUserNFTs = useCallback(async (): Promise<NFTInfo[]> => {
    if (!address || !chainId) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Use direct contract scanning only
      const nftList = await fetchNFTsViaContract();
      setNfts(nftList);
      return nftList;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ NFT fetching failed:', error);
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [address, chainId, fetchNFTsViaContract]);

  const getLatestNFT = useCallback(async (): Promise<NFTInfo | null> => {
    try {
      const userNFTs = await getUserNFTs();
      if (userNFTs.length === 0) {
        return null;
      }
      
      // Return the NFT with the highest token ID (most recent)
      return userNFTs[0]; // Already sorted by token ID desc
    } catch (error) {
      console.error('Error getting latest NFT:', error);
      return null;
    }
  }, [getUserNFTs]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    nfts,
    getUserNFTs,
    getLatestNFT,
    clearError
  };
}
