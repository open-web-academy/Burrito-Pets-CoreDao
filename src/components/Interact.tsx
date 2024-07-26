import { useMemo } from 'react';
import { ItemBackground, ItemContainer, ItemHeader, ItemTitle, ItemImage, ItemBodySelect, ItemBodyPlay, ItemMintButton, ItemPetsSection, ItemPet, ItemPetAction, ItemPetImg, SquareButton } from "../style/InteractPageStyle";
import React, { useCallback, useEffect, useState } from "react";
import { ethers } from 'ethers'
import NFTCollection from '../contract/NFTCollection.json'

const contractAddress = '0xAeb73A9a0814d3307B181564122fc9f3929c4Dca'
const abi = NFTCollection.abi

export default function Interact() {
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [inputTokenId, setInputTokenId] = useState<any>(0);
  const [isBusy, setIsBusy] = useState(false);
  const [isPlay, setIsPlay] = useState(false);
  const [error, setError] = useState("");
  const [pet, setPet] = useState<any>(null);
  const [currentActivity, setCurrentActivity] = useState<any>(null);
  const [currentImg, setCurrentImg] = useState<any>(null);

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

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

  // We make the conversion of information from the NFT
  const _castData = (data: any) => {
    console.log(data);
    return {
      tokenId: data[0],
      image: data[1],
      name: data[2],
      happiness: data[3].toNumber(),
      hunger: data[4].toNumber(),
      sleep: data[5].toNumber(),
      currentActivity: data[6],
      isHungry: data[7],
      isSleepy: data[8],
      isBored: data[9],
    };
  };

  // Method to get NFT information
  const getNft = async () => {
    try {
      console.log("tokenId: " + inputTokenId)
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const nftContract = new ethers.Contract(
          contractAddress,
          abi,
          signer
        )

        console.log('Read from contract')
        const res = await nftContract.getTokenInfoById(inputTokenId)

        if (!res[1]) {
          setError("Burrito's ID doesn't exist or You don't own the Burrito");
        }
        if (res[1]) {
          const petInfo = [res].map(_castData);

          setPet(petInfo[0]);
          setCurrentActivity(petInfo[0].currentActivity);
          setCurrentImg(_getCurrentImg(petInfo[0]));
          setIsBusy(false);
          setError("");

        }
      } else {
        console.log('Ethereum object does not exist')
      }
    } catch (err) {
      setError("Burrito's ID doesn't exist or You don't own the Burrito");
      console.log(err)
    }
  };

  // Methods to obtain the NFT image depending on its status
  const _getCurrentImg = (petInfo: any) => {
    if (petInfo.isHungry) {
      return _getIsHungryImg(petInfo.image);
    } else if (petInfo.isSleepy) {
      return _getIsSleepyImg(petInfo.image);
    } else if (petInfo.isBored) {
      return _getIsBoredImg(petInfo.image);
    } else if (!petInfo.isHungry && !petInfo.isSleepy && !petInfo.isBored) {
      return _getIdleImg(petInfo.image);
    }
  };

  const _getIdleImg = (img: any) => {
    switch (img) {
      case "https://pin.ski/3Jjp95g":
        return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Fuego-Idle.gif";
      case "https://pin.ski/3NwRR57":
        return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Planta-Idle.gif";
      case "https://pin.ski/3JfJ1X6":
        return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Agua-Idle.gif";
    }
  };

  const _getPlayImg = (img: any) => {
    switch (img) {
      case "https://pin.ski/3Jjp95g":
        return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Play.gif";
      case "https://pin.ski/3NwRR57":
        return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Play.gif";
      case "https://pin.ski/3JfJ1X6":
        return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Play.gif";
    }
  };

  const _getEatImg = (img: any) => {
    switch (img) {
      case "https://pin.ski/3Jjp95g":
        return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Fuego-Eat.gif";
      case "https://pin.ski/3NwRR57":
        return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Planta-Eat.gif";
      case "https://pin.ski/3JfJ1X6":
        return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Agua-Eat.gif";
    }
  };

  const _getSleepImg = (img: any) => {
    switch (img) {
      case "https://pin.ski/3Jjp95g":
        return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Fuego-Sleep.gif";
      case "https://pin.ski/3NwRR57":
        return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Planta-Sleep.gif";
      case "https://pin.ski/3JfJ1X6":
        return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Agua-Sleep.gif";
    }
  };

  const _getIsBoredImg = (img: any) => {
    switch (img) {
      case "https://pin.ski/3Jjp95g":
        return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Fuego-Bored.gif";
      case "https://pin.ski/3NwRR57":
        return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Planta-Bored.gif";
      case "https://pin.ski/3JfJ1X6":
        return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Agua-Bored.gif";
    }
  };

  const _getIsHungryImg = (img: any) => {
    switch (img) {
      case "https://pin.ski/3Jjp95g":
        return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Fuego-Hungry.gif";
      case "https://pin.ski/3NwRR57":
        return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Planta-Hungry.gif";
      case "https://pin.ski/3JfJ1X6":
        return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Agua-Hungry.gif";
    }
  };

  const _getIsSleepyImg = (img: any) => {
    switch (img) {
      case "https://pin.ski/3Jjp95g":
        return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Fuego-Sleepy.gif";
      case "https://pin.ski/3NwRR57":
        return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Planta-Sleepy.gif";
      case "https://pin.ski/3JfJ1X6":
        return "https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/Burrito-Agua-Sleepy.gif";
    }
  };

  // Method to play
  const play = async () => {
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

        const tx = await nftContract.play(inputTokenId)

        setCurrentImg(_getPlayImg(pet.image));
        setIsBusy(true);

        await tx.wait()

        getNft();

      } else {
        console.log('Ethereum object does not exist')
      }
    } catch (err) {
      console.log(err)
    }
  }


  // Method to eat
  const eat = async () => {
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

        const tx = await nftContract.eat(inputTokenId)

        setCurrentImg(_getEatImg(pet.image));
        setIsBusy(true);

        await tx.wait()

        getNft();

      } else {
        console.log('Ethereum object does not exist')
      }
    } catch (err) {
      console.log(err)
    }
  };

  // Method to sleep
  const sleep = async () => {
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

        const tx = await nftContract.doze(inputTokenId)

        setCurrentImg(_getSleepImg(pet.image));
        setIsBusy(true);

        await tx.wait()

        getNft();

      } else {
        console.log('Ethereum object does not exist')
      }
    } catch (err) {
      console.log(err)
    }
  };

  // Method to back menu
  const back = () => {
    setInputTokenId(null);
    setPet(null);
  };

  // Method to select random game
  const getGame = () => {
    return Math.floor(Math.random() * 2);
  };


  useEffect(() => {
    checkWalletIsConnected();
  }, []);

  return (
    <div style={{ marginBottom: "40px", marginTop: "40px" }}>
      <ItemBackground>
        <ItemContainer>
          <ItemHeader>
            <ItemTitle className="row">
              <div className="col-4" style={{ "textAlign": "left" }}>
                <ItemImage src="https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/icon.png"></ItemImage>
              </div>
              <div
                className="col-4"
                style={{
                  "textShadow":
                    "black 1px 0px 0px, black 0px 1px 0px, black -1px 0px 0px, black 0px -1px 0px",
                }}
              >
                {pet && pet.name}
              </div>
              <div className="col-4" style={{ "textAlign": "right" }}>
                {currentAccount ? (
                  pet && (
                    <ItemMintButton
                      onClick={async () => {
                        back();
                      }}
                    >
                      Back
                    </ItemMintButton>
                  )
                ) : null}
              </div>
            </ItemTitle>
          </ItemHeader>
          {currentAccount ? (
            !pet ? (
              <ItemBodySelect>
                <div className="m-5">
                  <div style={{ "display": "flex", "justifyContent": "center" }}>
                    <img
                      src="https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/find.png"
                      style={{
                        height: "230px",
                        background: "#ffe5bc",
                        "borderRadius": "10px",
                      }}
                    ></img>
                  </div>
                  <br />
                  <div className="">
                    <div className="row justify-content-center">
                      <div className="col-12" style={{ textAlign: "center" }}>
                        <input
                          style={{ background: "white", color: "black" }}
                          placeholder="Token Id"
                          onChange={(e) =>
                            setInputTokenId(e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <br />
                    <div style={{ "textAlign": "center" }}>
                      <ItemMintButton
                        onClick={async () => {
                          getNft();
                        }}
                      >
                        Get NFT
                      </ItemMintButton>
                    </div>
                    <div style={{ "textAlign": "center", color: "white" }}>{error}</div>
                  </div>
                </div>
              </ItemBodySelect>
            ) : (
              <div
                style={{
                  background: "rgb(242, 167, 115)",
                  "borderRadius": "20px",
                }}
              >
                <ItemBodyPlay>
                  <div
                    className="row"
                    style={{
                      "textAlign": "center",
                      background: "rgb(242, 167, 115)",
                      "marginInline": "-10px",
                      "borderRadius": "1px 1px 0px 0px",
                    }}
                  >
                    <div
                      className="col-4"
                      style={{
                        color: "black",
                        display: "flex",
                        "justifyContent": "center",
                        "alignItems": "center",
                      }}
                    >
                      <img
                        style={{ height: "50px", "marginRight": "10px" }}
                        src="https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/happy.png"
                      ></img>
                      <label style={{ "fontWeight": "900" }}>
                        {pet && pet.happiness}
                      </label>
                    </div>
                    <div
                      className="col-4"
                      style={{
                        color: "black",
                        display: "flex",
                        "justifyContent": "center",
                        "alignItems": "center",
                      }}
                    >
                      <img
                        style={{ height: "50px", "marginRight": "10px" }}
                        src="https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/eat.png"
                      ></img>
                      <label style={{ "fontWeight": "900" }}>
                        {pet && pet.hunger}
                      </label>
                    </div>
                    <div
                      className="col-4"
                      style={{
                        color: "black",
                        display: "flex",
                        "justifyContent": "center",
                        "alignItems": "center",
                      }}
                    >
                      <img
                        style={{ height: "50px", "marginRight": "10px" }}
                        src="https://raw.githubusercontent.com/yaairnaavaa/Burrito-Virtual-Pet/main/sleep.png"
                      ></img>
                      <label style={{ "fontWeight": "900" }}>
                        {pet && pet.sleep}
                      </label>
                    </div>
                  </div>
                  <ItemPetsSection>
                    <ItemPet>
                      <div>
                        {!isPlay ? (
                          <ItemPetImg src={currentImg} />
                        ) : getGame() == 0 ? (
                          <></>
                        ) : (
                          <></>
                        )}
                      </div>
                    </ItemPet>
                  </ItemPetsSection>
                </ItemBodyPlay>
                <div
                  style={{
                    "textAlign": "center",
                    "marginInline": "5px",
                    "marginTop": "7px",
                    "paddingBottom": "7px",
                    height: "68.33px",
                  }}
                >
                  {!isBusy ? (
                    pet && pet.isHungry ? (
                      <div className="row">
                        <div className="col-4"></div>
                        <div className="col-4">
                          <ItemPetAction
                            onClick={async () => {
                              eat();
                            }}
                          >
                            <label
                              style={{
                                color: "white",
                                "fontWeight": "900",
                                cursor: "pointer",
                              }}
                            >
                              Eat
                            </label>
                          </ItemPetAction>
                        </div>
                        <div className="col-4"></div>
                      </div>
                    ) : pet && pet.isSleepy ? (
                      <div className="row">
                        <div className="col-4"></div>
                        <div className="col-4"></div>
                        <div className="col-4">
                          <ItemPetAction
                            onClick={async () => {
                              sleep();
                            }}
                          >
                            <label
                              style={{
                                color: "white",
                                "fontWeight": "900",
                                cursor: "pointer",
                              }}
                            >
                              Sleep
                            </label>
                          </ItemPetAction>
                        </div>
                      </div>
                    ) : pet && pet.isBored ? (
                      <div className="row">
                        <div className="col-4">
                          <ItemPetAction
                            onClick={async () => {
                              play();
                            }}
                          >
                            <label
                              style={{
                                color: "white",
                                "fontWeight": "900",
                                cursor: "pointer",
                              }}
                            >
                              Play
                            </label>
                          </ItemPetAction>
                        </div>
                        <div className="col-4"></div>
                        <div className="col-4"></div>
                      </div>
                    ) : (
                      <div className="row">
                        <div className="col-4">
                          <ItemPetAction
                            onClick={async () => {
                              play();
                            }}
                          >
                            <label
                              style={{
                                color: "white",
                                "fontWeight": "900",
                                cursor: "pointer",
                              }}
                            >
                              Play
                            </label>
                          </ItemPetAction>
                        </div>
                        <div className="col-4">
                          <ItemPetAction
                            onClick={async () => {
                              eat();
                            }}
                          >
                            <label
                              style={{
                                color: "white",
                                "fontWeight": "900",
                                cursor: "pointer",
                              }}
                            >
                              Eat
                            </label>
                          </ItemPetAction>
                        </div>
                        <div className="col-4">
                          <ItemPetAction
                            onClick={async () => {
                              sleep();
                            }}
                          >
                            <label
                              style={{
                                color: "white",
                                "fontWeight": "900",
                                cursor: "pointer",
                              }}
                            >
                              Sleep
                            </label>
                          </ItemPetAction>
                        </div>
                      </div>
                    )
                  ) : null}
                </div>
              </div>
            )
          ) : (
            <ItemBodySelect>
              <br />
              <div style={{ "textAlign": "center", color: "white" }}>
                <span>Please login to Interact</span>
              </div>
            </ItemBodySelect>
          )}
        </ItemContainer>
      </ItemBackground>
    </div>
  );
}