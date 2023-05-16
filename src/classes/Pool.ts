import { Contract as ContractMulti, Provider as ProviderMulti } from 'ethcall';
import { BigNumber, Contract, Signer, constants } from 'ethers';
import { MAX_FENWICK_INDEX } from '../constants';
import { multicall } from '../contracts/common';
import { getErc20Contract } from '../contracts/erc20';
import { approve } from '../contracts/erc20-pool';
import {
  addQuoteToken,
  debtInfo,
  depositIndex,
  kick,
  kickWithDeposit,
  moveQuoteToken,
  removeQuoteToken,
} from '../contracts/pool';
import {
  getPoolInfoUtilsContract,
  getPoolInfoUtilsContractMulti,
  poolPricesInfo,
} from '../contracts/pool-info-utils';
import { Address, CallData, PoolInfoUtils, Provider, SignerOrProvider } from '../types';
import { toWad } from '../utils/numeric';
import { priceToIndex } from '../utils/pricing';
import { getExpiry } from '../utils/time';
import { ClaimableReserveAuction } from './ClaimableReserveAuction';
import { Bucket } from './Bucket';
import { PoolUtils } from './PoolUtils';
import { SdkError } from './types';

export interface DebtInfo {
  /** total unaccrued debt in pool at the current block height */
  pendingDebt: BigNumber;
  /** debt accrued by pool as of the last pool interaction */
  accruedDebt: BigNumber;
  /** debt under liquidation */
  debtInAuction: BigNumber;
}

export interface LoansInfo {
  /** lender with the least-collateralized loan */
  maxBorrower: Address;
  /** highest threshold price (HTP) */
  maxThresholdPrice: BigNumber;
  /** number of loans in the pool */
  noOfLoans: number;
}

export interface PriceInfo {
  /** price of the highest price bucket with deposit */
  hpb: BigNumber;
  /** fenwick index of the HPB */
  hpbIndex: number;
  /** highest threshold price */
  htp: BigNumber;
  /** fenwick index of the HTP */
  htpIndex: number;
  /** lowest utilized price */
  lup: BigNumber;
  /** fenwick index of the LUP */
  lupIndex: number;
}

export interface Stats {
  /** amount of liquidity in the pool (including utilized liquidity) */
  poolSize: BigNumber;
  /** pending amount of debt in the pool */
  debt: BigNumber;
  /** amount of debt under liquidation */
  liquidationDebt: BigNumber;
  /** number of loans in the pool */
  loansCount: number;
  /** minimum amount of debt a borrower can draw */
  minDebtAmount: BigNumber;
  /** collateralization ratio expressed as percentage */
  collateralization: BigNumber;
  /** meaningful actual utilization of the pool (MAU) */
  actualUtilization: BigNumber;
  /** pool target utilization (TU), related to inverse of collateralization */
  targetUtilization: BigNumber;
  /** the amount of excess quote tokens */
  reserves: BigNumber;
  /** denominated in quote token, or `0` if no reserves can be auctioned */
  claimableReserves: BigNumber;
  /** amount of claimable reserves which has not yet been taken */
  claimableReservesRemaining: BigNumber;
  /** current price at which `1` quote token may be purchased, denominated in `Ajna` */
  reserveAuctionPrice: BigNumber;
}

/**
 * Abstract baseclass used for pools, regardless of collateral type.
 */
export abstract class Pool {
  provider: SignerOrProvider;
  contract: Contract;
  contractMulti: ContractMulti;
  poolInfoContractUtils: PoolInfoUtils;
  contractUtilsMulti: ContractMulti;
  poolAddress: Address;
  collateralAddress: Address;
  collateralSymbol: string | undefined;
  quoteAddress: Address;
  quoteSymbol: string | undefined;
  ajnaAddress: Address;
  name: string;
  poolUtils: PoolUtils;
  ethcallProvider: ProviderMulti;

  constructor(
    provider: SignerOrProvider,
    poolAddress: string,
    collateralAddress: string,
    quoteAddress: string,
    ajnaAddress: string,
    contract: Contract,
    contractMulti: ContractMulti
  ) {
    this.provider = provider;
    this.poolAddress = poolAddress;
    this.poolInfoContractUtils = getPoolInfoUtilsContract(provider);
    this.contractUtilsMulti = getPoolInfoUtilsContractMulti();
    this.poolUtils = new PoolUtils(provider as Provider);
    this.quoteAddress = quoteAddress;
    this.collateralAddress = collateralAddress;
    this.ajnaAddress = ajnaAddress;
    this.name = 'pool';
    this.ethcallProvider = {} as ProviderMulti;
    this.contract = contract;
    this.contractMulti = contractMulti;
  }

  async initialize() {
    this.ethcallProvider = new ProviderMulti();
    await this.ethcallProvider.init(this.provider as Provider);
    const quoteToken = getErc20Contract(this.quoteAddress, this.provider);
    this.quoteSymbol = (await quoteToken.symbol()).replace(/"+/g, '');
  }

  /**
   * approve this pool to manage Ajna token
   * @param signer pool user
   * @param allowance approval amount (or MaxUint256)
   * @returns transaction
   */
  async ajnaApprove(signer: Signer, allowance: BigNumber) {
    return await approve(signer, this.poolAddress, this.ajnaAddress, allowance);
  }

  /**
   * approve this pool to manage quote token
   * @param signer pool user
   * @param allowance approval amount (or MaxUint256)
   * @returns transaction
   */
  async quoteApprove(signer: Signer, allowance: BigNumber) {
    return await approve(signer, this.poolAddress, this.quoteAddress, allowance);
  }

  /**
   * deposits quote token into a bucket
   * @param signer lender
   * @param bucketIndex identifies the price bucket
   * @param amount amount to deposit
   * @param ttlSeconds revert if not processed in this amount of block time
   * @returns transaction
   */
  async addQuoteToken(signer: Signer, bucketIndex: number, amount: BigNumber, ttlSeconds?: number) {
    const contractPoolWithSigner = this.contract.connect(signer);

    return await addQuoteToken(
      contractPoolWithSigner,
      amount,
      bucketIndex,
      await getExpiry(this.provider, ttlSeconds)
    );
  }

  /**
   * moves quote token between buckets
   * @param signer lender
   * @param fromIndex price bucket from which quote token should be withdrawn
   * @param toIndex price bucket to which quote token should be deposited
   * @param maxAmountToMove optionally limits amount to move
   * @param ttlSeconds revert if not processed in this amount of time
   * @returns transaction
   */
  async moveQuoteToken(
    signer: Signer,
    fromIndex: number,
    toIndex: number,
    maxAmountToMove = constants.MaxUint256,
    ttlSeconds?: number
  ) {
    const contractPoolWithSigner = this.contract.connect(signer);

    return await moveQuoteToken(
      contractPoolWithSigner,
      maxAmountToMove,
      fromIndex,
      toIndex,
      await getExpiry(this.provider, ttlSeconds)
    );
  }

  /**
   * removes quote token from a bucket
   * @param signer lender
   * @param bucketIndex identifies the price bucket
   * @param maxAmount optionally limits amount to remove
   * @returns transaction
   */
  async removeQuoteToken(signer: Signer, bucketIndex: number, maxAmount = constants.MaxUint256) {
    const contractPoolWithSigner = this.contract.connect(signer);

    return await removeQuoteToken(contractPoolWithSigner, maxAmount, bucketIndex);
  }

  /**
   * retrieves pool reference prices
   * @returns {@link PriceInfo}
   */
  async getPrices(): Promise<PriceInfo> {
    const [hpb, hpbIndex, htp, htpIndex, lup, lupIndex] = await poolPricesInfo(
      this.poolInfoContractUtils,
      this.poolAddress
    );

    return {
      hpb,
      hpbIndex: +hpbIndex,
      htp,
      htpIndex: +htpIndex,
      lup,
      lupIndex: +lupIndex,
    };
  }

  /**
   * retrieves pool statistics
   * @returns {@link Stats}
   */
  async getStats(): Promise<Stats> {
    const poolLoansInfoCall = this.contractUtilsMulti.poolLoansInfo(this.poolAddress);
    const poolUtilizationInfoCall = this.contractUtilsMulti.poolUtilizationInfo(this.poolAddress);
    const poolReservesInfo = this.contractUtilsMulti.poolReservesInfo(this.poolAddress);
    const data: string[] = await this.ethcallProvider.all([
      poolLoansInfoCall,
      poolUtilizationInfoCall,
      poolReservesInfo,
    ]);

    const [poolSize, loansCount] = data[0];
    const [minDebtAmount, collateralization, actualUtilization, targetUtilization] = data[1];
    const [reserves, claimableReserves, claimableReservesRemaining, auctionPrice] = data[2];

    const [debt, , liquidationDebt] = await debtInfo(this.contract);

    return {
      poolSize: BigNumber.from(poolSize),
      debt,
      liquidationDebt,
      loansCount: +loansCount,
      minDebtAmount: BigNumber.from(minDebtAmount),
      collateralization: BigNumber.from(collateralization),
      actualUtilization: BigNumber.from(actualUtilization),
      targetUtilization: BigNumber.from(targetUtilization),
      reserves: BigNumber.from(reserves),
      claimableReserves: BigNumber.from(claimableReserves),
      claimableReservesRemaining: BigNumber.from(claimableReservesRemaining),
      reserveAuctionPrice: BigNumber.from(auctionPrice),
    };
  }

  /**
   * measuring from highest price bucket with liquidity, determines index at which all liquidity in
   * the book has been utilized by specified debt; useful for estimating LUP
   * @param debtAmount pool debt to be applied to liquidity
   * @returns fenwick index
   */
  async depositIndex(debtAmount: BigNumber) {
    return await depositIndex(this.contract, debtAmount);
  }

  /**
   * enables signer to bundle transactions together atomically in a single request
   * @param signer consumer initiating transactions
   * @param callData array of transactions to sign and submit
   * @returns transaction
   */
  async multicall(signer: Signer, callData: Array<CallData>) {
    const contractPoolWithSigner = this.contract.connect(signer);

    return await multicall(contractPoolWithSigner, callData);
  }

  /**
   * @param bucketIndex fenwick index of the desired bucket
   * @returns {@link Bucket} modeling bucket at specified index
   */
  async getBucketByIndex(bucketIndex: number) {
    const bucket = new Bucket(this.provider, this, bucketIndex);
    return bucket;
  }

  /**
   * @param price price within range supported by Ajna
   * @returns {@link Bucket} modeling bucket at nearest to specified price
   */
  async getBucketByPrice(price: BigNumber) {
    const bucketIndex = priceToIndex(price);
    // priceToIndex should throw upon invalid price
    const bucket = new Bucket(this.provider, this, bucketIndex);
    return bucket;
  }

  /**
   * @param minPrice lowest desired price
   * @param maxPrice highest desired price
   * @returns array of {@link Bucket}s between specified prices
   */
  getBucketsByPriceRange(minPrice: BigNumber, maxPrice: BigNumber) {
    if (minPrice.gt(maxPrice)) throw new SdkError('maxPrice must exceed minPrice');

    const buckets = new Array<Bucket>();
    for (let index = priceToIndex(maxPrice); index <= priceToIndex(minPrice); index++) {
      buckets.push(new Bucket(this.provider, this, index));
    }

    return buckets;
  }

  async kickWithDeposit(signer: Signer, index: number, limitIndex: number = MAX_FENWICK_INDEX) {
    const contractPoolWithSigner = this.contract.connect(signer);

    return await kickWithDeposit(contractPoolWithSigner, index, limitIndex);
  }

  async kick(signer: Signer, borrowerAddress: Address, limitIndex: number = MAX_FENWICK_INDEX) {
    const contractPoolWithSigner = this.contract.connect(signer);

    return await kick(contractPoolWithSigner, borrowerAddress, limitIndex);
  }

  async isKickable(borrowerAddress: Address) {
    const poolPricesInfoCall = this.contractUtilsMulti.poolPricesInfo(this.poolAddress);
    const borrowerInfoCall = this.contractUtilsMulti.borrowerInfo(
      this.poolAddress,
      borrowerAddress
    );

    const response: BigNumber[][] = await this.ethcallProvider.all([
      poolPricesInfoCall,
      borrowerInfoCall,
    ]);

    const [, , , , lup] = response[0];
    const [debt, collateral] = response[1];
    const tp = collateral.gt(0) ? debt.div(collateral) : BigNumber.from(0);

    return lup.lte(toWad(tp));
  }

  /**
   * returns `Claimable Reserve Auction` (`CRA`) wrapper object
   * @returns CRA wrapper object
   */
  async getClaimableReserveAuction() {
    // const date = Date.now();
    // TODO: add timestamp of creation
    return new ClaimableReserveAuction(
      this.provider,
      this.contract,
      this.poolInfoContractUtils,
      this.poolAddress
    );
  }
}
