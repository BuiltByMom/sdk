import { BigNumber, constants, Signer } from 'ethers';
import { deployNFTPool, getDeployedPools, getSubsetHash } from '../contracts/erc721-pool-factory';
import {
  Address,
  IERC721PoolFactory,
  SdkError,
  SignerOrProvider,
  WrappedTransaction,
} from '../types';
import { Config } from './Config';
import { ContractBase } from './ContractBase';
import { NonfungiblePool } from './NonfungiblePool';

/**
 * Factory used to find or create pools with ERC721 collateral.
 */
export class NonfungiblePoolFactory extends ContractBase implements IERC721PoolFactory {
  constructor(signerOrProvider: SignerOrProvider) {
    super(signerOrProvider);
  }

  /**
   * Creates a new collection pool allowing all tokenIds.
   * @param signer pool creator
   * @param nftAddress address of the ERC721 collateral token
   * @param quoteAddress address of the ERC20 quote token
   * @param interestRate initial interest rate, between 1%-10%, as WAD
   * @returns promise to transaction
   */
  async deployCollectionPool(
    signer: Signer,
    nftAddress: Address,
    quoteAddress: Address,
    interestRate: BigNumber
  ): Promise<WrappedTransaction> {
    return deployNFTPool(signer, nftAddress, [], quoteAddress, interestRate);
  }

  /**
   * Creates a new subset pool whitelisting specific tokenIds.
   * @param signer pool creator
   * @param nftAddress address of the ERC721 collateral token
   * @param subset array of tokenIds to whitelist
   * @param quoteAddress address of the ERC20 quote token
   * @param interestRate initial interest rate, between 1%-10%, as WAD
   * @returns promise to transaction
   */
  async deploySubsetPool(
    signer: Signer,
    nftAddress: Address,
    subset: Array<number>,
    quoteAddress: Address,
    interestRate: BigNumber
  ): Promise<WrappedTransaction> {
    return deployNFTPool(signer, nftAddress, subset, quoteAddress, interestRate);
  }

  /**
   * Returns existing pool for two tokens.
   * @param collateralAddress token address
   * @param subset array of tokenIds for subset pool, empty array for collection pool
   * @param quoteAddress token address
   * @returns {@link NonfungiblePool} modeling desired pool
   */
  async getPool(
    collateralAddress: Address,
    subset: Array<number>,
    quoteAddress: Address
  ): Promise<NonfungiblePool> {
    const poolAddress = await this.getPoolAddress(collateralAddress, subset, quoteAddress);
    if (poolAddress === constants.AddressZero) {
      throw new SdkError('Pool for specified tokens was not found');
    }

    return await this.getPoolByAddress(poolAddress);
  }

  /**
   * Returns existing pool.
   * @param poolAddress address of pool
   * @returns {@link NonfungiblePool} modeling desired pool
   */
  async getPoolByAddress(poolAddress: Address) {
    const newPool = new NonfungiblePool(this.getProvider(), poolAddress, Config.ajnaToken);
    await newPool.initialize();
    return newPool;
  }

  /**
   * Finds address of an existing pool.
   * @param collateralAddress token address
   * @param subset specifies tokenIds whitelisted in pool
   * @param quoteAddress token address
   * @returns address of the existing pool, or zero address if not found
   */
  async getPoolAddress(
    collateralAddress: Address,
    subset: Array<number>,
    quoteAddress: Address
  ): Promise<Address> {
    const provider = this.getProvider();

    const hash = getSubsetHash(subset.map(val => BigNumber.from(val)));
    return await getDeployedPools(provider, collateralAddress, quoteAddress, hash);
  }
}
