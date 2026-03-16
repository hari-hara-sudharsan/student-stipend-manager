import React from 'react';
import { useAccount } from '@/hooks/useAccount';
import { Wallet, LogOut, CheckCircle } from 'lucide-react';

export function ConnectWallet() {
  const { account, loading, connect, disconnect, isConnected } = useAccount();

  if (loading) {
    return (
      <button disabled className="px-4 py-2 bg-gray-300 rounded-lg flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent" />
        Connecting...
      </button>
    );
  }

  if (isConnected && account) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
          <CheckCircle className="w-4 h-4" />
          <span className="font-mono text-sm">{account.displayName}</span>
        </div>
        <button
          onClick={disconnect}
          className="p-2 text-gray-500 hover:text-red-600 transition-colors"
          title="Disconnect wallet"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                 flex items-center gap-2 transition-colors font-medium"
    >
      <Wallet className="w-4 h-4" />
      Connect Freighter
    </button>
  );
}