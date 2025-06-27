import { useCallback, useState } from 'react';

export interface TransactionStatus {
  hash?: string;
  status: 'idle' | 'pending' | 'success' | 'error';
  error?: string;
  timestamp?: number;
}

export interface UseTransactionManagerReturn {
  // Current transaction state
  currentTransaction: TransactionStatus;
  
  // Transaction history
  transactions: TransactionStatus[];
  
  // Functions
  startTransaction: () => void;
  updateTransaction: (updates: Partial<TransactionStatus>) => void;
  completeTransaction: (hash: string) => void;
  failTransaction: (error: string) => void;
  clearCurrentTransaction: () => void;
  clearAllTransactions: () => void;
  
  // Computed state
  isTransactionPending: boolean;
  hasSuccessfulTransaction: boolean;
  lastSuccessfulTransaction: TransactionStatus | null;
}

export function useTransactionManager(): UseTransactionManagerReturn {
  const [currentTransaction, setCurrentTransaction] = useState<TransactionStatus>({
    status: 'idle'
  });
  
  const [transactions, setTransactions] = useState<TransactionStatus[]>([]);

  const startTransaction = useCallback(() => {
    const newTransaction: TransactionStatus = {
      status: 'pending',
      timestamp: Date.now()
    };
    
    setCurrentTransaction(newTransaction);
    console.log('🚀 Transaction started');
  }, []);

  const updateTransaction = useCallback((updates: Partial<TransactionStatus>) => {
    setCurrentTransaction(prev => ({
      ...prev,
      ...updates,
      timestamp: prev.timestamp || Date.now()
    }));
  }, []);

  const completeTransaction = useCallback((hash: string) => {
    const completedTransaction: TransactionStatus = {
      ...currentTransaction,
      hash,
      status: 'success',
      timestamp: currentTransaction.timestamp || Date.now()
    };
    
    setCurrentTransaction(completedTransaction);
    setTransactions(prev => [completedTransaction, ...prev]);
    
    console.log('✅ Transaction completed:', hash);
  }, [currentTransaction]);

  const failTransaction = useCallback((error: string) => {
    const failedTransaction: TransactionStatus = {
      ...currentTransaction,
      status: 'error',
      error,
      timestamp: currentTransaction.timestamp || Date.now()
    };
    
    setCurrentTransaction(failedTransaction);
    setTransactions(prev => [failedTransaction, ...prev]);
    
    console.log('❌ Transaction failed:', error);
  }, [currentTransaction]);

  const clearCurrentTransaction = useCallback(() => {
    setCurrentTransaction({ status: 'idle' });
  }, []);

  const clearAllTransactions = useCallback(() => {
    setTransactions([]);
    setCurrentTransaction({ status: 'idle' });
  }, []);

  // Computed state
  const isTransactionPending = currentTransaction.status === 'pending';
  const hasSuccessfulTransaction = transactions.some(tx => tx.status === 'success');
  const lastSuccessfulTransaction = transactions.find(tx => tx.status === 'success') || null;

  return {
    currentTransaction,
    transactions,
    startTransaction,
    updateTransaction,
    completeTransaction,
    failTransaction,
    clearCurrentTransaction,
    clearAllTransactions,
    isTransactionPending,
    hasSuccessfulTransaction,
    lastSuccessfulTransaction,
  };
}
