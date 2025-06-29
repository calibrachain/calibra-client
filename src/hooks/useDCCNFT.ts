import { BrowserProvider, Contract, EventLog, JsonRpcProvider } from 'ethers';
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

  // Method 1: Infura NFT API
  const fetchNFTsViaInfura = useCallback(async (): Promise<NFTInfo[]> => {
    if (!address || !chainId) {
      throw new Error('Address or chain ID not available');
    }

    console.log('🔍 Fetching NFTs via Infura API...');
    
    try {
      const contractAddress = DCCNFTAddresses[chainId as keyof typeof DCCNFTAddresses];
      if (!contractAddress) {
        throw new Error(`DCCNFT not deployed on chain ${chainId}`);
      }

      // Infura NFT API endpoint
      const infuraApiKey = 'b28a7c9373494f7b97bb6ea7b04413de';
      const network = chainId === 43113 ? 'avalanche-fuji' : 'avalanche-mainnet';
      
      // Get NFTs owned by user for specific contract
      const url = `https://nft.api.infura.io/networks/${network}/accounts/${address}/assets/nfts`;
      
      console.log('📡 Calling Infura API:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`${infuraApiKey}:`)}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Infura API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Infura API Response:', data);

      const nftInfos: NFTInfo[] = [];

      // Filter for our specific contract
      if (data.assets && Array.isArray(data.assets)) {
        for (const asset of data.assets) {
          if (asset.contract?.toLowerCase() === contractAddress.toLowerCase()) {
            nftInfos.push({
              tokenId: asset.tokenId,
              tokenURI: asset.metadata?.tokenUri || asset.tokenUri || '',
              snowtraceUrl: generateSnowtraceUrl(asset.tokenId)
            });
          }
        }
      }

      // Sort by token ID descending (newest first)
      nftInfos.sort((a, b) => parseInt(b.tokenId) - parseInt(a.tokenId));
      
      console.log(`✅ Found ${nftInfos.length} NFTs via Infura API`);
      return nftInfos;
    } catch (infuraError) {
      console.warn('⚠️ Infura API failed:', infuraError);
      throw infuraError;
    }
  }, [address, chainId, generateSnowtraceUrl]);

  // Fallback: Event scanning approach
  const fetchNFTsViaEvents = useCallback(async (): Promise<NFTInfo[]> => {
    if (!address) {
      throw new Error('Address not available');
    }

    console.log('🔍 Scanning events for NFTs...');
    
    try {
      const contract = await getContract();
      
      // Get Transfer events where 'to' is the user's address
      const transferFilter = contract.filters.Transfer(null, address, null);
      const transferEvents = await contract.queryFilter(transferFilter, -1000); // Reduced to 1k blocks
      
      console.log(`📄 Found ${transferEvents.length} Transfer events`);
      
      const nftInfos: NFTInfo[] = [];
      
      for (const event of transferEvents) {
        if (event instanceof EventLog && event.args) {
          const tokenId = event.args[2].toString();
          
          try {
            // Check if user still owns this token
            const currentOwner = await contract.ownerOf(tokenId);
            if (currentOwner.toLowerCase() === address.toLowerCase()) {
              const tokenURI = await contract.tokenURI(tokenId);
              
              nftInfos.push({
                tokenId,
                tokenURI,
                snowtraceUrl: generateSnowtraceUrl(tokenId)
              });
            }
          } catch (err) {
            console.warn(`⚠️ Error processing token ${tokenId}:`, err);
          }
        }
      }
      
      // Sort by token ID descending (newest first)
      nftInfos.sort((a, b) => parseInt(b.tokenId) - parseInt(a.tokenId));
      
      console.log(`✅ Found ${nftInfos.length} NFTs via events`);
      return nftInfos;
    } catch (eventError) {
      console.warn('⚠️ Event scanning failed:', eventError);
      throw eventError;
    }
  }, [address, getContract, generateSnowtraceUrl]);

  // Last resort: Direct contract scanning (optimized)
  const fetchNFTsViaContract = useCallback(async (): Promise<NFTInfo[]> => {
    if (!address) {
      throw new Error('Address not available');
    }

    console.log('🔍 Scanning contract directly for NFTs...');
    
    try {
      const contract = await getContract();
      const nftInfos: NFTInfo[] = [];
      
      // Check only recent token IDs (most likely to exist and be user's)
      const recentTokenIds = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      
      for (const tokenId of recentTokenIds) {
        try {
          const owner = await contract.ownerOf(tokenId);
          if (owner.toLowerCase() === address.toLowerCase()) {
            const tokenURI = await contract.tokenURI(tokenId);
            
            nftInfos.push({
              tokenId: tokenId.toString(),
              tokenURI,
              snowtraceUrl: generateSnowtraceUrl(tokenId.toString())
            });
          }
        } catch (err) {
          // Token might not exist, skip
          continue;
        }
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Sort by token ID descending (newest first)
      nftInfos.sort((a, b) => parseInt(b.tokenId) - parseInt(a.tokenId));
      
      console.log(`✅ Found ${nftInfos.length} NFTs via optimized direct scanning`);
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
    
    let nftList: NFTInfo[] = [];
    
    try {
      // Strategy 1: Try Infura NFT API first (most efficient)
      try {
        nftList = await fetchNFTsViaInfura();
        if (nftList.length > 0) {
          setNfts(nftList);
          return nftList;
        }
        console.log('📡 Infura API returned no NFTs, trying event scanning...');
      } catch (infuraError) {
        console.log('📡 Infura API failed, trying event scanning...');
      }
      
      // Strategy 2: Try event scanning
      try {
        nftList = await fetchNFTsViaEvents();
        if (nftList.length > 0) {
          setNfts(nftList);
          return nftList;
        }
        console.log('📄 Event scanning returned no NFTs, trying direct contract scanning...');
      } catch (eventError) {
        console.log('📄 Event scanning failed, trying direct contract scanning...');
      }
      
      // Strategy 3: Try direct contract scanning (last resort)
      nftList = await fetchNFTsViaContract();
      setNfts(nftList);
      return nftList;
      
    } catch (finalError) {
      const errorMessage = finalError instanceof Error ? finalError.message : 'Unknown error occurred';
      console.error('❌ All NFT fetching strategies failed:', finalError);
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [address, chainId, fetchNFTsViaInfura, fetchNFTsViaEvents, fetchNFTsViaContract]);

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
