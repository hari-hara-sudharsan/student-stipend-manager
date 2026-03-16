import { isConnected, getUserInfo, signTransaction, signAuthEntry } from '@stellar/freighter-api';
import { Transaction, xdr } from '@stellar/stellar-sdk';

export interface FreighterAccount {
  publicKey: string;
  displayName: string;
  network: string;
}

export class FreighterWallet {
  static async connect(): Promise<FreighterAccount | null> {
    try {
      if (!await isConnected()) {
        return null;
      }
      
      const userInfo = await getUserInfo();
      return {
        publicKey: userInfo.publicKey,
        displayName: userInfo.displayName || userInfo.publicKey.slice(0, 6) + '...',
        network: userInfo.network || 'testnet',
      };
    } catch (error) {
      console.error('Freighter connection error:', error);
      return null;
    }
  }

  static async signTx(tx: Transaction): Promise<string> {
    const signed = await signTransaction(tx.toXDR(), { network: 'testnet' });
    return signed.signedTransactionXdr;
  }

  static async signAuthEntry(authEntry: string): Promise<string> {
    const signed = await signAuthEntry(authEntry, { network: 'testnet' });
    return signed.signedAuthEntry;
  }
}