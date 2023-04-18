/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from 'ethers';
import type { Provider } from '@ethersproject/providers';
import type { PoolInfoUtils, PoolInfoUtilsInterface } from '../PoolInfoUtils';

const _abi = [
  {
    type: 'error',
    name: 'BucketIndexOutOfBounds',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BucketPriceOutOfBounds',
    inputs: [],
  },
  {
    type: 'error',
    name: 'PRBMathSD59x18__CeilOverflow',
    inputs: [
      {
        type: 'int256',
        name: 'x',
      },
    ],
  },
  {
    type: 'error',
    name: 'PRBMathSD59x18__DivInputTooSmall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'PRBMathSD59x18__DivOverflow',
    inputs: [
      {
        type: 'uint256',
        name: 'rAbs',
      },
    ],
  },
  {
    type: 'error',
    name: 'PRBMathSD59x18__Exp2InputTooBig',
    inputs: [
      {
        type: 'int256',
        name: 'x',
      },
    ],
  },
  {
    type: 'error',
    name: 'PRBMathSD59x18__FromIntOverflow',
    inputs: [
      {
        type: 'int256',
        name: 'x',
      },
    ],
  },
  {
    type: 'error',
    name: 'PRBMathSD59x18__FromIntUnderflow',
    inputs: [
      {
        type: 'int256',
        name: 'x',
      },
    ],
  },
  {
    type: 'error',
    name: 'PRBMathSD59x18__LogInputTooSmall',
    inputs: [
      {
        type: 'int256',
        name: 'x',
      },
    ],
  },
  {
    type: 'error',
    name: 'PRBMathSD59x18__MulInputTooSmall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'PRBMathSD59x18__MulOverflow',
    inputs: [
      {
        type: 'uint256',
        name: 'rAbs',
      },
    ],
  },
  {
    type: 'error',
    name: 'PRBMath__MulDivFixedPointOverflow',
    inputs: [
      {
        type: 'uint256',
        name: 'prod1',
      },
    ],
  },
  {
    type: 'error',
    name: 'PRBMath__MulDivOverflow',
    inputs: [
      {
        type: 'uint256',
        name: 'prod1',
      },
      {
        type: 'uint256',
        name: 'denominator',
      },
    ],
  },
  {
    type: 'function',
    name: 'borrowFeeRate',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [
      {
        type: 'address',
        name: 'ajnaPool_',
      },
    ],
    outputs: [
      {
        type: 'uint256',
      },
    ],
  },
  {
    type: 'function',
    name: 'borrowerInfo',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [
      {
        type: 'address',
        name: 'ajnaPool_',
      },
      {
        type: 'address',
        name: 'borrower_',
      },
    ],
    outputs: [
      {
        type: 'uint256',
        name: 'debt_',
      },
      {
        type: 'uint256',
        name: 'collateral_',
      },
      {
        type: 'uint256',
        name: 't0Np_',
      },
    ],
  },
  {
    type: 'function',
    name: 'bucketInfo',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [
      {
        type: 'address',
        name: 'ajnaPool_',
      },
      {
        type: 'uint256',
        name: 'index_',
      },
    ],
    outputs: [
      {
        type: 'uint256',
        name: 'price_',
      },
      {
        type: 'uint256',
        name: 'quoteTokens_',
      },
      {
        type: 'uint256',
        name: 'collateral_',
      },
      {
        type: 'uint256',
        name: 'bucketLPs_',
      },
      {
        type: 'uint256',
        name: 'scale_',
      },
      {
        type: 'uint256',
        name: 'exchangeRate_',
      },
    ],
  },
  {
    type: 'function',
    name: 'hpb',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [
      {
        type: 'address',
        name: 'ajnaPool_',
      },
    ],
    outputs: [
      {
        type: 'uint256',
      },
    ],
  },
  {
    type: 'function',
    name: 'hpbIndex',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [
      {
        type: 'address',
        name: 'ajnaPool_',
      },
    ],
    outputs: [
      {
        type: 'uint256',
      },
    ],
  },
  {
    type: 'function',
    name: 'htp',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [
      {
        type: 'address',
        name: 'ajnaPool_',
      },
    ],
    outputs: [
      {
        type: 'uint256',
      },
    ],
  },
  {
    type: 'function',
    name: 'indexToPrice',
    constant: true,
    stateMutability: 'pure',
    payable: false,
    inputs: [
      {
        type: 'uint256',
        name: 'index_',
      },
    ],
    outputs: [
      {
        type: 'uint256',
      },
    ],
  },
  {
    type: 'function',
    name: 'lenderInterestMargin',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [
      {
        type: 'address',
        name: 'ajnaPool_',
      },
    ],
    outputs: [
      {
        type: 'uint256',
        name: 'lenderInterestMargin_',
      },
    ],
  },
  {
    type: 'function',
    name: 'lpsToCollateral',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [
      {
        type: 'address',
        name: 'ajnaPool_',
      },
      {
        type: 'uint256',
        name: 'lps_',
      },
      {
        type: 'uint256',
        name: 'index_',
      },
    ],
    outputs: [
      {
        type: 'uint256',
        name: 'collateralAmount_',
      },
    ],
  },
  {
    type: 'function',
    name: 'lpsToQuoteTokens',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [
      {
        type: 'address',
        name: 'ajnaPool_',
      },
      {
        type: 'uint256',
        name: 'lps_',
      },
      {
        type: 'uint256',
        name: 'index_',
      },
    ],
    outputs: [
      {
        type: 'uint256',
        name: 'quoteAmount_',
      },
    ],
  },
  {
    type: 'function',
    name: 'lup',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [
      {
        type: 'address',
        name: 'ajnaPool_',
      },
    ],
    outputs: [
      {
        type: 'uint256',
      },
    ],
  },
  {
    type: 'function',
    name: 'lupIndex',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [
      {
        type: 'address',
        name: 'ajnaPool_',
      },
    ],
    outputs: [
      {
        type: 'uint256',
      },
    ],
  },
  {
    type: 'function',
    name: 'momp',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [
      {
        type: 'address',
        name: 'ajnaPool_',
      },
    ],
    outputs: [
      {
        type: 'uint256',
      },
    ],
  },
  {
    type: 'function',
    name: 'poolLoansInfo',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [
      {
        type: 'address',
        name: 'ajnaPool_',
      },
    ],
    outputs: [
      {
        type: 'uint256',
        name: 'poolSize_',
      },
      {
        type: 'uint256',
        name: 'loansCount_',
      },
      {
        type: 'address',
        name: 'maxBorrower_',
      },
      {
        type: 'uint256',
        name: 'pendingInflator_',
      },
      {
        type: 'uint256',
        name: 'pendingInterestFactor_',
      },
    ],
  },
  {
    type: 'function',
    name: 'poolPricesInfo',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [
      {
        type: 'address',
        name: 'ajnaPool_',
      },
    ],
    outputs: [
      {
        type: 'uint256',
        name: 'hpb_',
      },
      {
        type: 'uint256',
        name: 'hpbIndex_',
      },
      {
        type: 'uint256',
        name: 'htp_',
      },
      {
        type: 'uint256',
        name: 'htpIndex_',
      },
      {
        type: 'uint256',
        name: 'lup_',
      },
      {
        type: 'uint256',
        name: 'lupIndex_',
      },
    ],
  },
  {
    type: 'function',
    name: 'poolReservesInfo',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [
      {
        type: 'address',
        name: 'ajnaPool_',
      },
    ],
    outputs: [
      {
        type: 'uint256',
        name: 'reserves_',
      },
      {
        type: 'uint256',
        name: 'claimableReserves_',
      },
      {
        type: 'uint256',
        name: 'claimableReservesRemaining_',
      },
      {
        type: 'uint256',
        name: 'auctionPrice_',
      },
      {
        type: 'uint256',
        name: 'timeRemaining_',
      },
    ],
  },
  {
    type: 'function',
    name: 'poolUtilizationInfo',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [
      {
        type: 'address',
        name: 'ajnaPool_',
      },
    ],
    outputs: [
      {
        type: 'uint256',
        name: 'poolMinDebtAmount_',
      },
      {
        type: 'uint256',
        name: 'poolCollateralization_',
      },
      {
        type: 'uint256',
        name: 'poolActualUtilization_',
      },
      {
        type: 'uint256',
        name: 'poolTargetUtilization_',
      },
    ],
  },
  {
    type: 'function',
    name: 'priceToIndex',
    constant: true,
    stateMutability: 'pure',
    payable: false,
    inputs: [
      {
        type: 'uint256',
        name: 'price_',
      },
    ],
    outputs: [
      {
        type: 'uint256',
      },
    ],
  },
  {
    type: 'function',
    name: 'unutilizedDepositFeeRate',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [
      {
        type: 'address',
        name: 'ajnaPool_',
      },
    ],
    outputs: [
      {
        type: 'uint256',
      },
    ],
  },
] as const;

export class PoolInfoUtils__factory {
  static readonly abi = _abi;
  static createInterface(): PoolInfoUtilsInterface {
    return new utils.Interface(_abi) as PoolInfoUtilsInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): PoolInfoUtils {
    return new Contract(address, _abi, signerOrProvider) as PoolInfoUtils;
  }
}