import React from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { avalanche, avalancheFuji } from 'wagmi/chains';
import { CHAIN_CONFIG } from '../config/web3';

export const NetworkIndicator: React.FC = () => {
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();

  if (!chain) {
    return null;
  }

  const isSupported = chain.id === avalanche.id || chain.id === avalancheFuji.id;
  const chainConfig = CHAIN_CONFIG[chain.id as keyof typeof CHAIN_CONFIG];

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
      isSupported 
        ? 'bg-green-100 text-green-800 border border-green-200'
        : 'bg-red-100 text-red-800 border border-red-200'
    }`}>
      <div className={`w-2 h-2 rounded-full mr-2 ${
        isSupported ? 'bg-green-500' : 'bg-red-500'
      }`}></div>
      
      {isSupported ? (
        <span>{chainConfig?.name || chain.name}</span>
      ) : (
        <div className="flex items-center space-x-2">
          <span>Unsupported Network</span>
          {switchChain && (
            <button
              onClick={() => switchChain({ chainId: avalancheFuji.id })}
              className="text-xs underline hover:no-underline"
            >
              Switch to Avalanche
            </button>
          )}
        </div>
      )}
    </div>
  );
};
