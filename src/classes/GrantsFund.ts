import { delegateVote } from '../contracts/grants-fund';
import { Address, IGrantsFund, SignerOrProvider } from '../types';
import { ContractBase } from './ContractBase';
import { Signer } from 'ethers';

/**
 * Class used to iteract with grants fund contract.
 */
export class GrantsFund extends ContractBase implements IGrantsFund {
  constructor(signerOrProvider: SignerOrProvider) {
    super(signerOrProvider);
  }

  /**
   * creates a new pool
   * @param signer pool creator
   * @param collateralAddress address of the ERC20 collateral token
   * @param quoteAddress address of the ERC20 quote token
   * @param interestRate initial interest rate, between 1%-10%, as WAD
   * @returns transaction
   */
  async delegateVote(
    signer: Signer,
    delegateToAddress: Address,
  ) {
    return await delegateVote(signer, delegateToAddress);
  }

}
