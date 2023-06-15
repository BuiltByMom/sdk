import ERC20PoolABI from '../abis/ERC20Pool.json';
import {
  Address,
  CallData,
  ERC20Pool,
  ERC20Pool__factory,
  SignerOrProvider,
  TransactionOverrides,
} from '../types';
import { createTransaction } from '../utils/transactions';
import { BigNumber, Signer } from 'ethers';
import { Contract as ContractMulti } from 'ethcall';
import { TOKEN_POOL } from '../types/type-chain';
import { getErc20Contract } from './erc20';

export const getErc20PoolContract = (poolAddress: Address, provider: SignerOrProvider) => {
  return ERC20Pool__factory.connect(poolAddress, provider);
};

export const getErc20PoolInterface = () => {
  return ERC20Pool__factory.createInterface();
};

export const getErc20PoolContractMulti = (poolAddress: Address) => {
  return new ContractMulti(poolAddress, ERC20PoolABI);
};

export async function collateralScale(contract: ERC20Pool) {
  return await contract.collateralScale();
}

export async function drawDebt(
  contract: ERC20Pool,
  borrowerAddress: Address,
  amountToBorrow: BigNumber,
  limitIndex: number,
  collateralToPledge: BigNumber,
  overrides?: TransactionOverrides
) {
  return await createTransaction(
    contract,
    {
      methodName: 'drawDebt',
      args: [borrowerAddress, amountToBorrow, limitIndex, collateralToPledge],
    },
    overrides
  );
}

export async function repayDebt(
  contract: ERC20Pool,
  borrowerAddress: Address,
  maxQuoteTokenAmountToRepay: BigNumber,
  collateralAmountToPull: BigNumber,
  collateralReceiver: Address,
  limitIndex: number,
  overrides?: TransactionOverrides
) {
  return await createTransaction(
    contract,
    {
      methodName: 'repayDebt',
      args: [
        borrowerAddress,
        maxQuoteTokenAmountToRepay,
        collateralAmountToPull,
        collateralReceiver,
        limitIndex,
      ],
    },
    overrides
  );
}

export async function addCollateral(
  contract: ERC20Pool,
  amountToAdd: BigNumber,
  bucketIndex: number,
  expiry?: number,
  overrides?: TransactionOverrides
) {
  return await createTransaction(
    contract,
    { methodName: 'addCollateral', args: [amountToAdd, bucketIndex, expiry] },
    overrides
  );
}

export async function removeCollateral(
  contract: ERC20Pool,
  bucketIndex: number,
  maxAmount: BigNumber,
  overrides?: TransactionOverrides
) {
  return await createTransaction(
    contract,
    { methodName: 'removeCollateral', args: [maxAmount, bucketIndex] },
    overrides
  );
}

export async function approve(
  signer: Signer,
  poolAddress: Address,
  tokenAddress: Address,
  allowance: BigNumber,
  overrides?: TransactionOverrides
) {
  const erc20 = getErc20Contract(tokenAddress, signer);

  return await createTransaction(
    erc20,
    { methodName: 'approve', args: [poolAddress, allowance] },
    overrides
  );
}

export async function take(
  contract: ERC20Pool,
  borrowerAddress: Address,
  maxAmount: BigNumber,
  callee: Address,
  callData?: CallData,
  overrides?: TransactionOverrides
) {
  const erc20Pool = getErc20PoolContract(contract.address, contract.provider);
  const encodedCallData = callData
    ? erc20Pool.interface.encodeFunctionData('take', callData.args as any)
    : [];

  return await createTransaction(
    contract,
    { methodName: 'take', args: [borrowerAddress, maxAmount, callee, encodedCallData] },
    overrides
  );
}
