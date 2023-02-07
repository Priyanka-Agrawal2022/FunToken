# Dev Instructions
## Initialization:
- Clone Repository
```shell
git clone <repository-url>
```
### Install packages
- Go to the directory which you have cloned in previous step.
- Open terminal in that directory which contains `package.json` file and then run the below command.
```shell
npm install
```
### Env file setup
- Create a new file named `.env` in root directory and copy the contents of `.env.example` file.
- Then replace those environment variable values with the RPC provider api endpoint and wallet private key values.
- Example setup -
```dotenv
MUMBAI_ENDPOINT=https://polygon-mumbai.g.alchemy.com/v2/XANkWVw-xLIbBGutN0lKsEXxdF8CjYmU
PRIVATE_KEY=b8af158fav6ba1cad5e66b91d73d893188d83b38eb95731fe76068dc64fa8f86
# Above values are only examples
```
## Useful HardHat commands:
- To compile our  smart contracts -
```shell
npx hardhat compile
```
- To run test cases -
```shell
npx hardhat test <relative-path-to-testfile>
//example
npx hardhat test ./test/FunToken.js
```
- To run deploy scripts -
```shell
npx hardhat run <relative-path-to-file-containing-deploy-scripts>
//examples
npx hardhat run scripts/deploy.js
//to run on a speific network
npx hardhat run scripts/deploy.js --network <network-name>
```
- To run a local test chain and to deploy on local test chain -
```shell
//run a local node
npx hardhat node
//deploy our smartcontract on the local node
npx hardhat run scripts/deploy.js --network localhost
```
## Useful Resources:
- [Introduction to Smart Contracts course](https://buildspace.so/p/build-solidity-web3-app)
- [Hardhat Overview](https://hardhat.org/hardhat-runner/docs/getting-started#overview)
- [Metamask Extension](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn)
- [Solidity Practice](https://solidity-by-example.org)
- [Block Explorer Mumbai Polygon Test Network](https://mumbai.polygonscan.com)
- [OpenZeppelin Docs](https://docs.openzeppelin.com/learn/)