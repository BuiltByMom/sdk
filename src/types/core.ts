import {
  BigNumber,
  providers,
  Signer,
  ContractTransaction,
  ContractReceipt,
  Overrides,
} from 'ethers';

export type Provider = providers.Provider;

export type SignerOrProvider = Signer | Provider;

export type Address = string;

export type TransactionOverrides = Overrides & {
  to?: string;
  from?: string;
  value?: string;
  gasLimit?: number;
  gasPrice?: string;
  nonce?: string;
};

export interface WrappedTransaction {
  verify(): Promise<BigNumber>;
  submit(confirmations?: number): Promise<ContractReceipt>;
  submitResponse(): Promise<ContractTransaction>;
  verifyAndSubmit(confirmations?: number): Promise<ContractReceipt>;
  verifyAndSubmitResponse(): Promise<ContractTransaction>;
}

export interface CallData {
  methodName: string;
  args?: Array<any>;
  [propName: string]: any;
}

export enum TokenContract {
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
}

export enum PoolContracts {
  ERC20Pool = 'ERC20Pool',
  ERC721Pool = 'ERC721Pool',
  ERC20PoolFactory = 'ERC20PoolFactory',
  ERC721PoolFactory = 'ERC721PoolFactory',
}

export enum ManagerContracts {
  PositionManager = 'PositionManager',
  RewardsManager = 'RewardsManager',
}

export interface ContractFunction {
  [key: string]: any;
}
