/* eslint-disable jsx-a11y/iframe-has-title */
import './App.css';
import React from 'react';
import { useEffect, useState } from "react";
import './App.css';
import { ethers } from "ethers";
import abi from './utils/Domains.json';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import polygonLogo from './assets/polygonlogo.JPG';
import { networks } from './utils/networks';


//constants
const tld = '.tacos';
const contractAddress = '0xc0B4Cb13525EBca61E97f0ac6124BA37F98EA7B3';
const polyscanLink = `https://mumbai.polygonscan.com/address/${contractAddress}`
const contractABI = abi.abi;

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [network, setNetwork] = useState("");
  const [domain, setDomain] = useState('');
  const [isMintingDomain, setIsMintingDomain] = useState(false);
  const [mints, setMints] = useState([]);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have Metamask installed!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
        let chainId = await ethereum.request({ method: 'eth_chainId' });
        console.log("Connected to chain " + chainId);
        // const mumbaiChainId = "0x13881"; // Hex code of the chainId of the Polygon Mumbai test network
        // if (chainId === mumbaiChainId) {
        //   setNetwork("PolygonMumbai")
        // }
        setNetwork(networks[chainId]);
        //get account 
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log('Found an authorized account:', account);
          setCurrentAccount(account);
          toast.success("🌮 Wallet is Connected", {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        } else {
          console.log('No authorized account found');
        }
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  //HANDLERS
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Please download MetaMask to use this dapp");
        return;
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const mintDomain = async () => {
    setIsMintingDomain(true);
    if (!domain) {
      toast.error("Yo! You gotta enter a domain to mint", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setIsMintingDomain(false);
      return;
    }
    if (domain.length < 3 && domain) {
      toast.error("Your domain must be at least 3 characters long", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setIsMintingDomain(false);
      return;
    }
    if (domain.length > 10 && domain) {
      toast.error("Your domain must be less than 10 characters long", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setIsMintingDomain(false);
      return;
    }
    const price = domain.length === 3 ? '0.3' : domain.length === 4 ? '0.2' : '0.1';
    console.log("Minting domain", domain, "with price", price);
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        let txn = await contract.register(domain, { value: ethers.utils.parseEther(price) });
        toast.info(`Minting ${domain}${tld} for ${price} MATIC...`, {
          position: "top-right",
          autoClose: 6050,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        let receipt = await txn.wait();
        console.log(receipt);
        if (receipt.status === 1) {
          toast.success(`Domain minted! You now own ${domain}${tld}`, {
            position: "top-right",
            autoClose: 6050,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
        // Call fetchMints after 2 seconds
        setTimeout(() => {
          fetchMints();
        }, 2000);

        setIsMintingDomain(false);
        setDomain('');
      }
    } catch (error) {
      console.log(error);
      setIsMintingDomain(false);
      if (error.code === -32603) {
        toast.error("Try adding more test MATIC to your account using the facuet", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    }
  }

  const fetchMints = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const domainContract = new ethers.Contract(contractAddress, contractABI, signer);

        const allDomainNames = await domainContract.getAllNames();
        const mintRecord = await Promise.all(allDomainNames.map(async (name) => {
          const owner = await domainContract.domains(name);
          return {
            id: allDomainNames.indexOf(name),
            name,
            owner,
          }
        }));

        console.log("MINTS FETCHED ", mintRecord);
        setMints(mintRecord);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const switchNetwork = async () => {
    if (window.ethereum) {
      try {
        // Try to switch to the Mumbai testnet
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13881' }], // Check networks.js for hexadecimal network ids
        });
      } catch (error) {
        // This error code means that the chain we want has not been added to MetaMask
        // In this case we ask the user to add it to their MetaMask
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x13881',
                  chainName: 'Polygon Mumbai Testnet',
                  rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
                  nativeCurrency: {
                    name: "Mumbai Matic",
                    symbol: "MATIC",
                    decimals: 18
                  },
                  blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
                },
              ],
            });
          } catch (error) {
            console.log(error);
          }
        }
        console.log(error);
      }
    } else {
      // If window.ethereum is not found then MetaMask is not installed
      alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
    }
  }

  //RENDER METHODS
  const renderDancingTaco = () => {
    return (
      <div>
        <iframe src="https://giphy.com/embed/b5WqMx1eiFv6U" width="480" height="480" frameBorder="0"></iframe><p></p>
      </div>
    )
  }
  const renderConnectWalletButtonOrMumbaiOnlyWarning = () => {
    if (!currentAccount) {
      return (
        <button onClick={connectWallet} className="cta-button connect-wallet-button">
          Connect Wallet
        </button>
      )
    }

    if (currentAccount && network !== "Polygon Mumbai Testnet") {
      return (
        <div className="mumbai-only">
          <p>Hold up! This dapp only works on the Polygon Mumbai Testnet. Please switch networks in your connected wallet or by clicking below.</p>
          <button className='cta-button mint-button' onClick={switchNetwork}>Click here to switch</button>
        </div>
      )
    }
  };

  const renderInputForm = () => {
    if (currentAccount && network === "Polygon Mumbai Testnet") {
      return (
        <div className="form-container">
          <div className="first-row">
            <input
              type="text"
              value={domain}
              placeholder='domain'
              onChange={e => setDomain(e.target.value)}
            />
            <p className='tld'> {tld} </p>
          </div>

          <button className='cta-button mint-button' disabled={isMintingDomain} onClick={mintDomain} id={isMintingDomain ? 'accomodate-for-loader' : ''}>
            {isMintingDomain ? 'Minting...' : 'Mint'}
            {renderLoader()}
          </button>
        </div>
      );
    }
  }

  const renderTestMaticMessage = () => {
    if (currentAccount && network === "Polygon Mumbai Testnet" && !isMintingDomain) {
      return (
        <p className="test-matic"> If you need test MATIC, try using <a href="https://faucet.polygon.technology/">this faucet</a>.</p>
      )
    }
  }

  const renderMints = () => {
    if (currentAccount && mints.length > 0) {
      return (
        <div className="mint-container">
          <p className="subtitle"> Recently Minted 🌮's</p>
          <div className="mint-list">
            {mints.map((mint, index) => {
              return (
                <div className="mint-item" key={index}>
                  <a className="link" href={`https://testnets.opensea.io/assets/mumbai/${contractAddress}/${mint.id}`} target="_blank" rel="noopener noreferrer">
                    <p className="underlined">{mint.name}{tld}</p>
                  </a>
                  <p> {mint.record} </p>
                </div>)
            })}
          </div>
        </div>);
    }
  };

  const renderLoader = () => {
    if (isMintingDomain) {
      return (
        <div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
      )
    }
  }

  // USE EFFECTS
  useEffect(() => {
    checkIfWalletIsConnected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //listen for chain changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      })

      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      })
    }
  })
  // This will run any time currentAccount or network are changed
  useEffect(() => {
    if (network === 'Polygon Mumbai Testnet') {
      fetchMints();
    }
  }, [currentAccount, network]);

  return (
    <div className="App">
      <div className="header-container">
        <header>
          <p className="title">Los Tacos Name Service 🌮</p>
        </header>
        <div className='wallet'>
          {network.includes("Polygon") ? <img alt="Network logo" className="logo" src={polygonLogo} /> : ""}
          {currentAccount ? <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> : <p> Not connected </p>}
        </div>
      </div>
      <div className="container">
        <div>
          {renderDancingTaco()}
          {renderConnectWalletButtonOrMumbaiOnlyWarning()}
          {renderInputForm()}
          {renderTestMaticMessage()}
          {renderMints()}
        </div>
        <div className='contract'>
          <a href={polyscanLink}>Contract</a>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;

