import { getPoolInfoUtilsContract, indexToPrice, priceToIndex } from '../contracts/pool-info-utils';
import { PoolInfoUtils, SignerOrProvider } from '../types';
import { BigNumber } from 'ethers';

/**
 * Utilities which can be applied to any pool.
 */
class PoolUtils {
  provider: SignerOrProvider;
  contract: PoolInfoUtils;

  constructor(provider: SignerOrProvider) {
    this.provider = provider;
    this.contract = getPoolInfoUtilsContract(this.provider);
  }

  setup = (signer: SignerOrProvider) => {
    this.contract = getPoolInfoUtilsContract(signer);
  };

  priceToIndex = async (price: BigNumber) => {
    return await priceToIndex(this.contract, price);
  };

  indexToPrice = async (index: number) => {
    return await indexToPrice(this.contract, index);
  };
}

export { PoolUtils };
