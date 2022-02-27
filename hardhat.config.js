require("@nomiclabs/hardhat-waffle");
require('dotenv').config({ path: '.env' });
require("@nomiclabs/hardhat-etherscan");

module.exports = {
  solidity: "0.8.10",
};

module.exports = {
  solidity: "0.8.10",
  networks: {
    mumbai: {
      url: process.env.ALCHEMY_API_URL,
      accounts: [process.env.PRIVATE_KEY],
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API
  }
};