import { useMemo } from 'react';
import { ItemBackground, ItemContainer, ItemHeader, ItemTitle, ItemImage, ItemBody, ItemMintNumber, ItemMintButton } from "../style/MintPageStyle";
import React, { useCallback, useEffect, useState } from "react";
import { ethers } from 'ethers'
import NFTCollection from '../contractABI/NFTCollection.json'

const contractAddress = '0xAeb73A9a0814d3307B181564122fc9f3929c4Dca'
const abi = NFTCollection.abi

export default function Mint() {

  const [mintedBurritos, setMintedBurritos] = useState();
  const [burritoName, setBurritoName] = useState("");
  const [minting, setMinting] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    console.log(ethereum);

    if (!ethereum) {
      console.log('Make sure you have Metamask installed!');
      return;
    } else {
      console.log("Wallet exists! We're ready to go!");
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log('Found an authorized account: ', account);
      setCurrentAccount(account);
    } else {
      console.log('No authorized account found');
    }
  };

  const getMintedBurritos = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const nftContract = new ethers.Contract(
          contractAddress,
          abi,
          signer
        );

        console.log('Read from contract')
        const res = await nftContract.getMintedTokens()
        setMintedBurritos(res.toString());
      } else {
        console.log('Ethereum object does not exist')
      }
    } catch (err) {
      console.log(err)
    }
  }

  const mint = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const nftContract = new ethers.Contract(
          contractAddress,
          abi,
          signer
        )

        console.log('Write to contract')
        const tx = await nftContract.mintPet(burritoName)
        setMinting(true);

        console.log('Wait for the transaction to be confirmed')
        await tx.wait()

        setMinting(false);

        getMintedBurritos();
        setBurritoName("");

        console.log(
          `Transaction confirmed: https://scan.test.btcs.network/tx/${tx.hash}`
        )
      } else {
        console.log('Ethereum object does not exist')
      }
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    checkWalletIsConnected();
    getMintedBurritos();
  }, []);

  return (
    <div>
      <ItemBackground>
        <ItemContainer>
          <ItemHeader>
            <ItemTitle>
              <ItemImage src="https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/d2c54b3423f07d0e9e22bf8aa105b12cf7973922/icon.png"></ItemImage>
              <label
                style={{
                  "textShadow":
                    "1px 0px 0px black, 0px 1px 0px black, -1px 0px 0px black, 0px -1px 0px black",
                }}
              >
                Burrito Virtual Pets
              </label>
            </ItemTitle>
          </ItemHeader>
          <ItemBody>
            {currentAccount ? (
              <div className="container text-center">
                <div>
                  <ItemMintNumber>
                    Last Burrito Id: {mintedBurritos ? mintedBurritos : 0}
                  </ItemMintNumber>
                </div>
                <br />
                {!minting ? (
                  <div>
                    <div>
                      <input
                        style={{ background: "white" }}
                        placeholder="Burrito name"
                        value={burritoName}
                        onChange={(e) =>
                          setBurritoName(e.target.value)
                        }
                      />
                    </div>
                    <br />
                    <div>
                      <ItemMintButton
                        onClick={async () => {
                          mint();
                        }}
                      >
                        Mint Burrito
                      </ItemMintButton>
                      <br /> <br />
                      <div>
                        <a
                          href="interact"
                          style={{ color: "black" }}
                        >
                          Go to Play
                        </a>
                      </div>
                      <br />
                      <div>
                        <label style={{ color: "black", "fontWeight": "500" }}>
                          {" "}
                          Burrito’s contract to add your NFTs to wallet
                          0xAc9221060455f60dfFF8bf8C4f601E500AC095D7
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "grid", justifyContent: "center" }}>
                    <img
                      src="https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/d2c54b3423f07d0e9e22bf8aa105b12cf7973922/loading.gif"
                      style={{
                        height: "169px",
                        background: "rgb(255, 229, 188)",
                        "borderRadius": "10px",
                      }}
                    ></img>
                    <br />
                    <label style={{ "fontSize": "20px", "fontWeight": "400" }}>
                      Minting...
                    </label>
                  </div>
                )}
                <br />
              </div>
            ) : (
              <div style={{ "textAlign": "center" }}>
                <span>Please login to Mint Pet</span>
              </div>
            )}
          </ItemBody>
        </ItemContainer>
      </ItemBackground>
    </div>
  );
}
