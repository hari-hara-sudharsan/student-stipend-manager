import React, { useState } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { useVestingContract } from '@/hooks/useVestingContract';
import { ExplorerLink } from '@/components/shared/ExplorerLink';
import { Loader2, Check, AlertCircle } from 'lucide-react';

interface ClaimVestingProps {
  vestingId: string; // hex string of BytesN<32>
  onClaimSuccess?: (txHash: string) => void;
}

export function ClaimVesting({ vestingId, onClaimSuccess }: ClaimVestingProps) {
  const { account } = useAccount();
  const { claimVested, getAvailableAmount, loading } = useVestingContract();
  
  const [available, setAvailable] = useState<i128 | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch available amount on mount
  React.useEffect(() => {
    if (vestingId) {
      getAvailableAmount(vestingId)
        .then(setAvailable)
        .catch(err => console.error('Failed to fetch available:', err));
    }
  }, [vestingId, getAvailableAmount]);

  const handleClaim = async () => {
    if (!account || !vestingId) return;
    
    setClaiming(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await claimVested(account.publicKey, vestingId);
      
      if (result.success) {
        setSuccess(`Claimed ${formatStroops(result.amount)} USDC`);
        onClaimSuccess?.(result.txHash);
        // Refresh available amount
        const newAvailable = await getAvailableAmount(vestingId);
        setAvailable(newAvailable);
      } else {
        setError(result.error || 'Claim failed');
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error');
    } finally {
      setClaiming(false);
    }
  };

  const formatStroops = (stroops: i128) => {
    return (Number(stroops) / 1e7).toFixed(2);
  };

  if (!account) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
        <AlertCircle className="w-5 h-5 inline mr-2" />
        Please connect your Freighter wallet to claim funds.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Available Balance Card */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Available to Claim</h4>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-blue-900">
            {available !== null ? formatStroops(available) : '...'}
          </span>
          <span className="text-blue-700">USDC</span>
        </div>
        <p className="text-xs text-blue-600 mt-1">
          Released weekly from your stipend schedule
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleClaim}
          disabled={claiming || loading || !available || available <= 0}
          className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 
                     disabled:cursor-not-allowed text-white rounded-lg font-medium 
                     flex items-center justify-center gap-2 transition-colors"
        >
          {claiming ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Claim Funds
            </>
          )}
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
          <Check className="w-4 h-4 inline mr-2" />
          {success}
          {success && <ExplorerLink txHash={success} className="ml-2 underline" />}
        </div>
      )}

      {/* Vesting ID for debugging */}
      <details className="text-xs text-gray-500">
        <summary className="cursor-pointer">Vesting ID (debug)</summary>
        <code className="block mt-1 p-2 bg-gray-100 rounded font-mono break-all">
          {vestingId}
        </code>
      </details>
    </div>
  );
}