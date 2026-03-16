import { useCallback } from 'react';
import { Contract, SorobanRpc, xdr } from '@stellar/stellar-sdk';
import { FreighterWallet } from '@/lib/stellar/freighter';
import { getSorobanClient, getNetworkPassphrase } from '@/lib/stellar/soroban';

const VESTING_CONTRACT_ID = import.meta.env.VITE_VESTING_CONTRACT_ID;

export interface ClaimResult {
  success: boolean;
  amount?: i128;
  txHash?: string;
  error?: string;
}

export function useVestingContract() {
  const getContract = useCallback(() => {
    if (!VESTING_CONTRACT_ID) {
      throw new Error('Vesting contract ID not configured');
    }
    return new Contract(VESTING_CONTRACT_ID);
  }, []);

  const claimVested = useCallback(
    async (studentPublicKey: string, vestingId: string): Promise<ClaimResult> => {
      try {
        const server = getSorobanClient();
        const contract = getContract();
        const networkPassphrase = getNetworkPassphrase();

        // Build the claim operation
        const claimOp = contract.call(
          "claim_vested",
          xdr.ScVal.scvAddress(xdr.ScAddress.scAddressTypeAccount(
            xdr.PublicKey.publicKeyTypeEd25519(
              Buffer.from(studentPublicKey, 'hex') // Simplified - use proper decoding
            )
          )),
          xdr.ScVal.scvBytes(Buffer.from(vestingId, 'hex'))
        );

        // Prepare transaction
        const sourceAccount = await server.getAccount(studentPublicKey);
        const tx = new SorobanRpc.TransactionBuilder(sourceAccount, {
          fee: "10000",
          networkPassphrase,
        })
          .addOperation(claimOp)
          .setTimeout(30)
          .build();

        // Simulate to get auth entries
        const simulated = await server.simulateTransaction(tx);
        if (simulated.error) {
          return { success: false, error: simulated.error };
        }

        // Sign with Freighter
        const signedXdr = await FreighterWallet.signTx(tx);
        const signedTx = SorobanRpc.TransactionBuilder.fromXDR(signedXdr, networkPassphrase);

        // Submit
        const sendResponse = await server.sendTransaction(signedTx as any);
        
        // Poll for result (simplified for demo)
        let txResponse = await server.getTransaction(sendResponse.hash);
        while (txResponse.status === 'NOT_FOUND') {
          await new Promise(resolve => setTimeout(resolve, 1000));
          txResponse = await server.getTransaction(sendResponse.hash);
        }

        if (txResponse.status === 'SUCCESS') {
          // Parse result value (simplified)
          const resultValue = txResponse.returnValue?.i128?.lo || 0;
          return {
            success: true,
            amount: BigInt(resultValue) as unknown as i128,
            txHash: sendResponse.hash,
          };
        }

        return { success: false, error: 'Transaction failed' };
      } catch (err: any) {
        console.error('Claim error:', err);
        return { success: false, error: err.message || 'Unknown error' };
      }
    },
    [getContract]
  );

  const getAvailableAmount = useCallback(
    async (vestingId: string): Promise<i128> => {
      // Simplified mock for Week 1 - replace with actual Soroban read in Week 2
      // This simulates the contract read without full Soroban setup
      return new Promise((resolve) => {
        // Mock: return random available amount for demo
        const mockAmount = Math.floor(Math.random() * 500) * 1e7; // 0-500 USDC in stroops
        setTimeout(() => resolve(mockAmount as unknown as i128), 500);
      });
    },
    []
  );

  return {
    claimVested,
    getAvailableAmount,
    loading: false, // Add real loading state in Week 2
  };
}