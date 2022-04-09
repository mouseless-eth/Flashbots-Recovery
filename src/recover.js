import { ethers } from 'ethers';
import { FlashbotsBundleProvider } from '@flashbots/ethers-provider-bundle';
import 'dotenv/config';

const addresses = {
  'gelatoToken': '0x15b7c0c907e4C6b9AdaAaabC300C08991D6CEA05',
  'claimContract': '0x5898D2aE0745c8d09762Bac50fd9F34A2a95A563'
};

const CHAIN_ID = 1;
const provider = new ethers.providers.JsonRpcProvider(`https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`);

const compromised_wallet = new ethers.Wallet(process.env.COMPROMISED_WALLET, provider)
const new_wallet = new ethers.Wallet(process.env.NEW_WALLET, provider)

console.log(`compomised wallet : ${compromised_wallet.address}`)
console.log(`new wallet : ${new_wallet.address}`)

recover();

async function recover() {
  const flashbotsProvider = await FlashbotsBundleProvider.create(provider, ethers.Wallet.createRandom())
  provider.on('block', async (blockNumber) => {
    console.log(blockNumber)

      const bundle = [
        // transaction to fund hacked wallet (from new wallet)
        {
          transaction: {
            chainId: CHAIN_ID,
            to:compromised_wallet.address,
            value: ethers.utils.parseEther('0.2'),
            type: 2,
            gasLimit: 21000,
            maxFeePerGas: ethers.utils.parseUnits('120', 'gwei'),
            maxPriorityFeePerGas: ethers.utils.parseUnits('110', 'gwei'),
          },
          signer: new_wallet 
        },

        // transaction to claim ICO tokens
        {
          transaction: {
            chainId: CHAIN_ID,
            to: addresses.claimContract,
            data: '0x704fc04e000000000000000000000000bc79c7139c87df965f0f4c24747f326d1864c5af',
            type: 2,
            gasLimit: 91170,
            maxFeePerGas: ethers.utils.parseUnits('120', 'gwei'),
            maxPriorityFeePerGas: ethers.utils.parseUnits('110', 'gwei'),
          },
          signer: compromised_wallet
        },

        // transaction to withdraw
        {
          transaction: {
            chainId: CHAIN_ID,
            to: addresses.gelatoToken,
            data: '0xa9059cbb000000000000000000000000acf6418cefd7254f5e34b2b2e9a8f081e0e150d1000000000000000000000000000000000000000000000845e16a00dd60f00000',
            type: 2,
            gasLimit: 78000,
            maxFeePerGas: ethers.utils.parseUnits('120', 'gwei'),
            maxPriorityFeePerGas: ethers.utils.parseUnits('110', 'gwei'),
          },
          signer: compromised_wallet
        },

        // transfer all unused ETH out of compromised wallet
        {
          transaction: {
            chainId: CHAIN_ID,
            to: new_wallet.address,
            value: new_wallet.getBalance() - ethers.utils.parseEther('0.00252'),
            type: 2,
            gasLimit: 21000,
            maxFeePerGas: ethers.utils.parseUnits('120', 'gwei'),
            maxPriorityFeePerGas: ethers.utils.parseUnits('110', 'gwei'),
          },
          signer: compromised_wallet
        },
      ]

      const flashbotsTransactionResponse = await flashbotsProvider.sendBundle(
        bundle,
        blockNumber + 1,
      );
    
    // in event of error produce error msg
    if ('error' in flashbotsTransactionResponse) {
      console.warn(flashbotsTransactionResponse.error.message)
      return
    }

    // simulate transaction
    console.log(await flashbotsTransactionResponse.simulate())
  })
}
