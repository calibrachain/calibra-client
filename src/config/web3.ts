import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  avalancheFuji,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Calibra - Digital Calibration Certificates',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [
    avalancheFuji,
  ],
  ssr: true,
});

export const SUPPORTED_CHAINS = {
  avalancheFuji: avalancheFuji.id,
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
} as const;
