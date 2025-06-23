import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  avalanche,
  avalancheFuji,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Calibra - Digital Calibration Certificates',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [
    avalancheFuji,
    avalanche,
  ],
  ssr: true,
});

export const SUPPORTED_CHAINS = {
  avalancheFuji: avalancheFuji.id,
  avalanche: avalanche.id,
} as const;

export type SupportedChainId = typeof SUPPORTED_CHAINS[keyof typeof SUPPORTED_CHAINS];

// Chain-specific configurations
export const CHAIN_CONFIG = {
  [avalancheFuji.id]: {
    name: 'Avalanche Fuji Testnet',
    symbol: 'AVAX',
    explorer: 'https://testnet.snowtrace.io',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
  },
  [avalanche.id]: {
    name: 'Avalanche',
    symbol: 'AVAX',
    explorer: 'https://snowtrace.io',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
  },
} as const;
