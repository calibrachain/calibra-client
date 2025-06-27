import React from 'react';
import { useAccount } from 'wagmi';
import { DCCRegistryAddresses } from '../contracts/DCCRegistry';

interface ContractConfigProps {
  onContractConfigured?: () => void;
}

const ContractConfig: React.FC<ContractConfigProps> = () => {
  const { chainId } = useAccount();

  const getContractAddress = () => {
    if (!chainId) return null;
    return DCCRegistryAddresses[chainId as keyof typeof DCCRegistryAddresses];
  };

  const isContractDeployed = () => {
    const address = getContractAddress();
    return address && address !== "0x0000000000000000000000000000000000000000";
  };

  const getChainName = () => {
    switch (chainId) {
      case 43114:
        return 'Avalanche C-Chain';
      case 43113:
        return 'Avalanche Fuji Testnet';
      default:
        return 'Unknown Network';
    }
  };

  if (!chainId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="font-medium text-yellow-800">
            Please connect your wallet to check contract status
          </span>
        </div>
      </div>
    );
  }

  if (!isContractDeployed()) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-center">
          <div className="text-red-600 text-2xl mb-3">⚠️</div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Contract Not Deployed
          </h3>
          <p className="text-red-700 mb-4">
            DCCRegistry contract is not deployed on {getChainName()}
          </p>
          <div className="bg-red-100 border border-red-200 rounded p-3 mb-4">
            <p className="text-sm text-red-800">
              <strong>Current Address:</strong> {getContractAddress()}
            </p>
            <p className="text-sm text-red-800">
              <strong>Network:</strong> {getChainName()} (Chain ID: {chainId})
            </p>
          </div>
          <p className="text-sm text-red-600">
            Please deploy the DCCRegistry contract and update the address in the configuration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center space-x-3">
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <div className="flex-1">
          <span className="font-medium text-green-800">
            ✅ DCCRegistry deployed on {getChainName()}
          </span>
          <p className="text-sm text-green-600 mt-1 font-mono">
            {getContractAddress()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContractConfig;
