import { useState, useEffect, useCallback } from 'react';
import { FreighterWallet, FreighterAccount } from '@/lib/stellar/freighter';

export function useAccount() {
  const [account, setAccount] = useState<FreighterAccount | null>(null);
  const [loading, setLoading] = useState(true);

  const connect = useCallback(async () => {
    setLoading(true);
    try {
      const acc = await FreighterWallet.connect();
      setAccount(acc);
      return acc;
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
  }, []);

  useEffect(() => {
    // Auto-check connection on mount
    connect();
  }, [connect]);

  return {
    account,
    loading,
    connect,
    disconnect,
    isConnected: !!account,
  };
}