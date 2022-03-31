# Gelato Recovery

Creating a flashbots bundle to recover Gelato ICO tokens from a **compromised wallet**.

### The Problem
**compromised wallet** has had it's private key leaked with bots watching for incoming transactions to steal tokens as soon as they are deposited. To claim the ICO airdrop the compromised wallet needs to be seeded with ETH to pay for the gas fees to claim. 

The solution is to send transactions to seed + claim + withdraw all in the **same block** so that the bots won't be able to steal ETH as soon as it is deposited. We can do this using the [ethers-provider-flashbots-bundle](https://www.npmjs.com/package/@flashbots/ethers-provider-bundle) package.

## Transactions 
1. Send funds from `new_wallet` to `compromised_wallet` to cover gas for claiming + transfering
2. Claim Gelato ICO tokens from `compromised_wallet` 
3. Transfer claimed Gelato tokens from `compromised_wallet` to `new_wallet`
4. Transfer all unused ETH from `compromised_wallet` to `new_wallet`
