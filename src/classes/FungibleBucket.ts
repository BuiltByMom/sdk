import { Signer, constants } from 'ethers';
import { Bucket } from './Bucket';
import { Pool } from './Pool';

import { CallData, SdkError, SignerOrProvider } from '../types';
import { wmul } from '../utils/numeric';

/**
 * Models a price bucket in a pool with ERC-20 collateral.
 */
export class FungibleBucket extends Bucket {
  /**
   * @param provider JSON-RPC endpoint.
   * @param pool     Pool to which this bucket belongs.
   * @param index    Price bucket index.
   */
  constructor(provider: SignerOrProvider, pool: Pool, index: number) {
    super(provider, pool, index);
  }

  /**
   * Withdraw all available liquidity from the given bucket using multicall transaction (first quote token, then - collateral if LP is left).
   * @param signer address to redeem LP
   * @returns promise to transaction
   */
  async withdrawLiquidity(signer: Signer) {
    // get bucket details
    const bucketStatus = await this.getStatus();
    // determine lender's LP balance
    const signerAddress = await signer.getAddress();
    const [lpBalance] = await this.poolContract.lenderInfo(this.index, signerAddress);
    // multiply by exchange rate to estimate amount of quote token they can withdraw
    const estimatedDepositWithdrawal = wmul(lpBalance, bucketStatus.exchangeRate);

    // if lender has nothing to redeem, exit
    if (lpBalance.eq(constants.Zero)) {
      throw new SdkError(`${signerAddress} has no LP in bucket ${this.index}`);
    }

    // if there is any quote token in the bucket, redeem LP for deposit first
    const callData: Array<CallData> = [];
    if (lpBalance && bucketStatus.deposit.gt(0)) {
      callData.push({
        methodName: 'removeQuoteToken',
        args: [constants.MaxUint256, this.index],
      });
    }

    // CAUTION: This estimate may cause revert because we cannot predict exchange rate for an
    // arbitrary future block where the TX will be processed.
    const withdrawCollateral =
      (bucketStatus.deposit.eq(0) || estimatedDepositWithdrawal.gt(bucketStatus.deposit)) &&
      bucketStatus.collateral.gt(0);
    if (withdrawCollateral) {
      callData.push({
        methodName: 'removeCollateral',
        args: [constants.MaxUint256, this.index],
      });
    }

    return this.multicall(signer, callData);
  }
}
