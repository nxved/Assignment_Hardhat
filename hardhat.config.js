require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
        //   details: {
        //   yul: true,
        //   yulDetails: {
        //     stackAllocation: true,
        //     optimizerSteps: "dhfoDgvulfnTUtnIf"
        //   }
        // }
      },
   //   viaIR: true,
    },
  },
  networks: {
    bscTestnet: {
      url: "https://wispy-hardworking-bird.bsc-testnet.discover.quiknode.pro/0df9bf19e62e2b2484b16bb51064df32dfca24ac/",
      accounts: [process.env.KEY],
    },
    bsc: {
      url: "https://bsc-dataseed1.binance.org",
      accounts: [process.env.KEY],
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.KEY],
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.KEY],
    },
    velasMainnet: {
      url: "https://evmexplorer.velas.com/rpc",
      accounts: [process.env.KEY],
    },
    velasTestnet: {
      url: "https://evmexplorer.testnet.velas.com/rpc",
      accounts: [process.env.KEY],
    },
    polygonMumbai: {
      url: "https://still-aged-spring.matic-testnet.discover.quiknode.pro/77682de06006d7bd05393030568727847824a95e/",
      accounts: [process.env.KEY],
    },
  },
  etherscan: {
    apiKey: {
      goerli: process.env.ETHER_SCAN_TESTNET_API,
      bscTestnet: process.env.BSC_SCAN_TESTNET_API,
      bsc: process.env.BSC_SCAN_TESTNET_API,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
    }
  },
};
