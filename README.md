![](https://img.shields.io/badge/Webpack-5-informational?style=flat&logo=Angular&logoColor=white&color=fc3903)
![](https://img.shields.io/badge/Bootstrap-3.4.1-informational?style=flat&color=03cafc)
![](https://img.shields.io/badge/NodeJS-14-informational?style=flat&color=03fc1c)
![](https://img.shields.io/badge/CardanoSerializationLib-7.1.0-informational?style=flat&color=fc03f4)

# Cheff Tweets NFT minter 🌽
Test of concept integration of Cardano wallet and a website. Based on NodeJs and Webpack 5. There are several things to consider in this project, so consider this as a reference, but a useful project for community. 

# Description 💡
The frontend is built using webpack, cardano serialisation library and integrates with Nami Wallet using the exposed api with the browser extension. Check Nami github for reference or the discord channel.

The NodeJS backend calls Cardano-wallet, can be responsible for a simple authentication mechanism validating some users we allow and redirecting responses.

For complete and updated documentation please check our [Github Pages](https://cheffnft.github.io/cardano-vegstore/)

# Configuration ⌛️
First, you will need:

1. Install node, npm install.
3. Have a Twitter developer account if you want to integrate with Twitter authentication server.

## Front end 🖼

Not much needed for development. Just run _npm run dev_

## Node JS backend 📦
You have to create a file named .env containing the following variables:
NODE_ENV=development
IPFS=your ipfs blockfrost api key
BLOCKFROST_KEY=your blockfrost mainnet or testnet api
# you can change to test net
BLOCKFROST=https://cardano-testnet.blockfrost.io 
BEARER=twitter bearer key, obtained on twitter developer portal
API_KEY=twitter developer api key
API_SECRET=twitter developer api secret

For start the backend in development, run _npm start_
