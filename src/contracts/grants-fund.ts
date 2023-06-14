import grantsFundAbi from '../abis/GrantFund.json';
import { Config } from '../classes/Config';
import { Address, SignerOrProvider } from '../types';
import checksumAddress from '../utils/checksum-address';
import { createTransaction } from '../utils/transactions';
import { Contract, Signer, ethers } from 'ethers';

export const getGrantsFundContract = (provider: SignerOrProvider) => {
  return new ethers.Contract(
    checksumAddress(Config.grantsFund),
    grantsFundAbi,
    provider
  );
};

export async function delegateVote(
  signer: Signer,
  delegateToAddress: Address,
) {
  const contractInstance: Contract = getGrantsFundContract(signer);
  // this will fail since this method doesn't exist on the ABI
  return await createTransaction(
    contractInstance,
    { methodName: 'delegateVote', args: [delegateToAddress] }
  );
}