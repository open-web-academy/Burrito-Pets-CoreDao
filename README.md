# Burrito Pets dApp on Core
Discover Burrito Pets, an exciting blockchain game that brings the nostalgia of Tamagotchis to the CORE network! In Burrito Pets, you can mint and collect adorable Burritos as NFTs and enjoy a unique interactive experience.

## What can you do in Burrito Pets?

* Mint Burritos: Start your adventure by mining and collecting Burrito NFTs, each with its own unique traits and personality.
* Interact: Take care of your Burritos by playing with them, feeding them, and making sure they get enough rest to keep them happy and healthy.

## Software Prerequisites
* [Git](https://git-scm.com/) v2.44.0
* [Node.js](https://nodejs.org/en) v20.11.1
* [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) v10.2.4
* [Hardhat](https://hardhat.org/hardhat-runner/docs/getting-started#installation) v10.2.4
* [MetaMask Web Wallet Extension](https://metamask.io/download/)

## Setting up the development environment

1. Install dependencies

```bash
npm install
```

2. Install and configure MetaMask Chrome Extension to use with Core Testnet. Refer [here](https://docs.coredao.org/docs/Dev-Guide/core-testnet-wallet-config) for a detailed guide.

3. Create a secret.json file in the src/contract folder and store the private key of your MetaMask wallet in it. Refer [here](https://metamask.zendesk.com/hc/en-us/articles/360015290032-How-to-reveal-your-Secret-Recovery-Phrase) for details on how to get MetaMask account's private key.

```json
{"PrivateKey":"you private key, do not leak this file, do keep it absolutely safe"}
```

:::caution
Do not forget to add this file to the `.gitignore` file in the root folder of your project so that you don't accidentally check your private keys/secret phrases into a public repository. Make sure you keep this file in an absolutely safe place!
:::

4. Copy the following into your `hardhat.config.js` file in src/contract

```js
/**
 * @type import('hardhat/config').HardhatUserConfig
 */


require('@nomiclabs/hardhat-ethers');
require("@nomiclabs/hardhat-waffle");


const { PrivateKey } = require('./secret.json');


module.exports = {
   defaultNetwork: 'testnet',


   networks: {
      hardhat: {
      },
      testnet: {
         url: 'https://rpc.test.btcs.network',
         accounts: [PrivateKey],
         chainId: 1115,
      }
   },
   solidity: {
      compilers: [
        {
           version: '0.8.24',
           settings: {
            evmVersion: 'paris',
            optimizer: {
                 enabled: true,
                 runs: 200,
              },
           },
        },
      ],
   },
   paths: {
      sources: './contracts',
      cache: './cache',
      artifacts: './artifacts',
   },
   mocha: {
      timeout: 20000,
   },
};
```

## Writing Smart Contract

1. Inside the src/contract/contracts folder is the NFTCollection.sol file which will contain the smart contract code to be used for this Burrito Pets game.

```javascript
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "hardhat/console.sol";

contract NFTCollection is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 private nonce = 0;

    enum Activity {
        Idle,
        Playing,
        Eating,
        Sleeping
    }

    struct Pet {
        address owner;
        string image;
        string name;
        uint256 happiness;
        uint256 hunger;
        uint256 sleep;
        Activity currentActivity;
        uint256 lastMeal;
        uint256 lastSleep;
        uint256 lastPlay;
    }

    struct PetInfo {
        uint256 tokenId;
        string image;
        string name;
        uint256 happiness;
        uint256 hunger;
        uint256 sleep;
        string activity;
        bool isHungry;
        bool isSleepy;
        bool isBored;
    }

    struct TokenURI {
        string tokenURI;
        string image;
    }

    mapping(uint256 => Pet) private _pets;

    constructor() ERC721("Burrito Battle Virtual Pet", "BBVP") {}

    function mintPet(string memory petName) external returns (uint256) {
        _tokenIds.increment();
        uint256 newPetId = _tokenIds.current();
        _safeMint(msg.sender, newPetId);

        TokenURI memory tokenURI = generateTokenURI(petName);
        uint256 currentTime = block.timestamp;

        _pets[newPetId] = Pet(
            msg.sender,
            tokenURI.image,
            petName,
            50,
            0,
            0,
            Activity.Idle,
            currentTime,
            currentTime,
            currentTime
        );

        _setTokenURI(newPetId, tokenURI.tokenURI);

        return newPetId;
    }

    function play(uint256 tokenId) external {
        require(_hasToken(tokenId), "Pet does not exist");
        require(
            ownerOf(tokenId) == msg.sender,
            "You are not the owner of the token"
        );

        Pet storage pet = _pets[tokenId];
        require(pet.currentActivity == Activity.Idle, "Pet is busy");

        uint256 currentTime = block.timestamp;
        
        if ((currentTime - pet.lastSleep) > 16 hours) {
            pet.happiness -= 10;
            pet.sleep += 10;
        }
        require((currentTime - pet.lastSleep) < 16 hours, "Pet is tired");

        //pet.currentActivity = Activity.Playing;
        pet.lastPlay = block.timestamp;
        pet.happiness == 50 ? 50 : pet.happiness += 10;
        pet.hunger == 50 ? 50 : pet.hunger += 10;

    }

    function eat(uint256 tokenId) external {
        require(_hasToken(tokenId), "Pet does not exist");
        require(
            ownerOf(tokenId) == msg.sender,
            "You are not the owner of the token"
        );

        Pet storage pet = _pets[tokenId];
        require(pet.currentActivity == Activity.Idle, "Pet is busy");
        //pet.currentActivity = Activity.Eating;
        pet.lastMeal = block.timestamp;
        pet.hunger == 0 ? 0 : pet.hunger -= 10;
        pet.happiness == 50 ? 50 : pet.happiness += 10;
        pet.sleep == 50 ? 50 : pet.sleep += 10;
    }

    function doze(uint256 tokenId) external {
        require(_hasToken(tokenId), "Pet does not exist");
        require(
            ownerOf(tokenId) == msg.sender,
            "You are not the owner of the token"
        );

        Pet storage pet = _pets[tokenId];
        require(pet.currentActivity == Activity.Idle, "Pet is busy");

        uint256 currentTime = block.timestamp;
        if ((currentTime - pet.lastMeal) > 6 hours) {
            pet.happiness -= 10;
            pet.hunger += 10;
        }
        require((currentTime - pet.lastMeal) < 6 hours, "Pet is hungry");

        //pet.currentActivity = Activity.Sleeping;
        pet.lastSleep = block.timestamp;
        pet.sleep == 0 ? 0 : pet.sleep -= 10;
        pet.happiness == 0 ? 0 : pet.happiness -= 10;
    }

    function getMintedTokens() external view returns (uint256) {
        return _tokenIds._value;
    }

    function checkStatus(uint256 petId)
        internal
        view
        returns (
            string memory,
            string memory,
            uint256,
            uint256,
            uint256,
            string memory,
            bool,
            bool,
            bool
        )
    {
        require(_hasToken(petId), "Pet does not exist");
        Pet storage pet = _pets[petId];
        string memory activity = getActivityString(pet.currentActivity);

        uint256 currentTime = block.timestamp;

        bool isHungry = (currentTime - pet.lastMeal) > 6 hours || pet.hunger == 50;
        bool isSleepy = (currentTime - pet.lastSleep) > 16 hours || pet.sleep == 50;
        bool isBored = (currentTime - pet.lastPlay) > 3 hours || pet.happiness <= 20;

        return (
            pet.image,
            pet.name,
            pet.happiness,
            pet.hunger,
            pet.sleep,
            activity,
            isHungry,
            isSleepy,
            isBored
        );
    }

    function getTokenInfoById(uint256 tokenId)
        external
        view
        returns (PetInfo memory)
    {
        require(
            ownerOf(tokenId) == msg.sender,
            "You are not the owner of the token"
        );

        (
            string memory image,
            string memory name,
            uint256 happiness,
            uint256 hunger,
            uint256 sleep,
            string memory activity,
            bool isHungry,
            bool isSleepy,
            bool isBored
        ) = checkStatus(tokenId);

        return
            convertToPetInfo(
                tokenId,
                image,
                name,
                happiness,
                hunger,
                sleep,
                activity,
                isHungry,
                isSleepy,
                isBored
            );
    }

    function convertToPetInfo(
        uint256 tokenId,
        string memory image,
        string memory name,
        uint256 happiness,
        uint256 hunger,
        uint256 sleep,
        string memory activity,
        bool isHungry,
        bool isSleepy,
        bool isBored
    ) private pure returns (PetInfo memory) {
        return
            PetInfo({
                tokenId: tokenId,
                image: image,
                name: name,
                happiness: happiness,
                hunger: hunger,
                sleep: sleep,
                activity: activity,
                isHungry: isHungry,
                isSleepy: isSleepy,
                isBored: isBored
            });
    }

    function generateTokenURI(string memory petName)
        private
        returns (TokenURI memory)
    {
        uint256 randomImageIndex = random() % 3; // 3 different images

        string[3] memory images = [
            "https://pin.ski/3Jjp95g",
            "https://pin.ski/3NwRR57",
            "https://pin.ski/3JfJ1X6"
        ];

        string memory json = string(
            abi.encodePacked(
                '{"name": "',
                petName,
                '", "description": "A virtual pet NFT", "image": "',
                images[randomImageIndex],
                '", "attributes": [{"trait_type": "Happiness", "value": "',
                toString(_pets[_tokenIds.current()].happiness),
                '"}, {"trait_type": "Hunger", "value": "',
                toString(_pets[_tokenIds.current()].hunger),
                '"}, {"trait_type": "Activity", "value": "',
                getActivityString(_pets[_tokenIds.current()].currentActivity),
                '"}]}'
            )
        );

        string memory token = string(
            abi.encodePacked(
                "data:application/json;base64,",
                bytes(Base64.encode(bytes(json)))
            )
        );

        TokenURI memory tokenURI = TokenURI(
            token,
            string(images[randomImageIndex])
        );

        return tokenURI;
    }

    function random() private returns (uint256) {
        nonce++;
        return
            uint256(
                keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce))
            );
    }

    function getActivityString(Activity activity)
        private
        pure
        returns (string memory)
    {
        if (activity == Activity.Playing) {
            return "Playing";
        } else if (activity == Activity.Eating) {
            return "Eating";
        } else if (activity == Activity.Sleeping) {
            return "Sleeping";
        } else {
            return "Idle";
        }
    }

    function toString(uint256 value) private pure returns (string memory) {
        // Inspired by OraclizeAPI's implementation - MIT license
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }


    function _hasToken(uint256 tokenId) internal view returns (bool) {
        try this.ownerOf(tokenId) returns (address) {
            return true;
        } catch {
            return false;
        }
    }
}
```

## Compiling Smart Contract

1. To compile the `NFTCollection` smart contract defined in the `NFTCollection.sol`, from the src/contract directory run the following command

```bash
npx hardhat compile
```

## Deploy and Interact with Smart Contract

1. Before deploying your smart contract on the Core Chain, it is best adviced to first run a series of tests making sure that the smart contract is working as desired. Refer to the detailed guide [here](https://docs.coredao.org/docs/Dev-Guide/hardhat#contract-testing) for more details.

2. Create a `scripts` folder in the src/contract directory of your project. Inside this folder, create a file `deploy.js`; paste the following script into it.

```javascript
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploy contract with the account:", deployer.address);

  const NFTCollection = await ethers.getContractFactory("NFTCollection");

  const nftCollection = await NFTCollection.deploy();

  console.log("Contract Address:", nftCollection.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

```
3. Make sure your MetaMask wallet has tCORE test tokens for the Core Testnet. Refer [here](https://docs.coredao.org/docs/Dev-Guide/core-faucet) for details on how to get tCORE tokens from Core Faucet. 

4. Run the following command from the root directory of your project, to deploy your smart contract on the Core Chain.

```bash
npx hardhat run scripts/deploy.js
```

## Setting up Frontend

1. Install all the dependencies, i.e., node modules.

```bash
npm install
```

2. To test if things are working fine, run the application by using the following command. This will serve applciation with hot reload feature at [http://localhost:5173](http://localhost:5173/)

```bash
npm run dev
```