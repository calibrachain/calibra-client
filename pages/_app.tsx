import type { AppProps } from 'next/app';
import '../src/index.css';
import { Web3Provider } from '../src/providers/Web3Provider';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Web3Provider>
      <Component {...pageProps} />
    </Web3Provider>
  );
}
