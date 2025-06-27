import { CheckCircle, Clock, ExternalLink, XCircle } from 'lucide-react';
import React from 'react';
import { TransactionStatus } from '../hooks/useTransactionManager';

interface TransactionStatusDisplayProps {
  transaction: TransactionStatus;
  chainId?: number;
  className?: string;
}

const TransactionStatusDisplay: React.FC<TransactionStatusDisplayProps> = ({
  transaction,
  chainId = 43114, // Default to Avalanche C-Chain
  className = ''
}) => {
  const getExplorerUrl = (hash: string, chainId: number) => {
    switch (chainId) {
      case 43114: // Avalanche C-Chain
        return `https://snowtrace.io/tx/${hash}`;
      case 43113: // Avalanche Fuji Testnet
        return `https://testnet.snowtrace.io/tx/${hash}`;
      default:
        return `https://snowtrace.io/tx/${hash}`;
    }
  };

  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (transaction.status) {
      case 'pending':
        return 'Transaction Pending...';
      case 'success':
        return 'Transaction Successful';
      case 'error':
        return 'Transaction Failed';
      default:
        return 'Ready';
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (transaction.status === 'idle') {
    return null;
  }

  return (
    <div className={`rounded-lg p-4 border ${getStatusColor()} ${className}`}>
      <div className="flex items-center space-x-3">
        {getStatusIcon()}
        <div className="flex-1">
          <p className="font-medium">{getStatusText()}</p>
          {transaction.error && (
            <p className="text-sm mt-1 text-red-600">{transaction.error}</p>
          )}
          {transaction.hash && (
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-sm font-mono break-all">
                {transaction.hash.slice(0, 10)}...{transaction.hash.slice(-8)}
              </span>
              <a
                href={getExplorerUrl(transaction.hash, chainId)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm">View on Explorer</span>
              </a>
            </div>
          )}
          {transaction.timestamp && (
            <p className="text-xs text-gray-500 mt-1">
              {new Date(transaction.timestamp).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionStatusDisplay;
