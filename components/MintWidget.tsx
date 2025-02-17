"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'wagmi/chains';
import contractABI from '../abi/NFTMintABI.json';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import { UserRejectedRequestError } from 'viem';

const CONTRACT_ADDRESS = '0x743f49311a82fe72eb474c44e78da2a6e0ae951c';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.org';

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URL),
});

interface NFT {
  name: string;
  description: string;
  imageUrl: string;
  tokenId: number;
}

const MintWidget = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState('');
  const [mintSuccessful, setMintSuccessful] = useState(false);
  const [mintedNFT, setMintedNFT] = useState<NFT | null>(null);
  const [showMintForm, setShowMintForm] = useState(false);
 // const [setNftGallery] = useState<NFT[]>([]);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const generateTokenId = useCallback(async (): Promise<number> => {
    let newId: number;
    let exists = true;

    while (exists) {
      newId = Math.floor(Math.random() * 1000000);
      try {
        exists = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: contractABI,
          functionName: 'checkId',
          args: [newId],
        }) as boolean;

      } catch (error) {
        console.error('Error checking token ID:', error);
        return 0; // Or throw an error, as appropriate
      }
      if (!exists) {
        return newId;
      }
    }
    throw new Error("Unable to generate a unique token ID");
  }, []);


  const handleMint = async () => {
    if (!address || !walletClient) {
      setTxStatus('Please connect your wallet.');
      return;
    }

    if (!name || !description || !logoUrl) {
      setTxStatus('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setTxStatus('');
    setMintSuccessful(false);
    setShowRejectDialog(false);

    try {
      const tokenId = await generateTokenId();
      if (tokenId === 0) { // Explicitly check for 0, the error case
          console.error("Invalid tokenId:", tokenId);
          setTxStatus("Failed to generate a unique token ID."); // User-friendly error
          return;
      }

      const response = await fetch(`${BACKEND_URL}/api/nft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nftId: tokenId,
          name,
          description,
          logoUrl,
          userWalletAddress: address,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData?.message || 'Failed to store NFT data in backend';
        throw new Error(errorMessage); // Throw to be caught below
      }

      const metadataUrl = `${BACKEND_URL}/api/nft/${tokenId}`;
      await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: 'mint',
        args: [tokenId, metadataUrl],
      });

      setMintSuccessful(true);
      setMintedNFT({
        name,
        description,
        imageUrl: logoUrl,
        tokenId,
      });

      setName('');
      setDescription('');
      setLogoUrl('');
      setTxStatus('NFT Minted Successfully!');
      setShowMintForm(false);
      await fetchNFTGallery(); // Await the gallery fetch
    } catch (error: unknown) {
      console.error("Mint Error:", error);
      if (error instanceof UserRejectedRequestError) {
        setShowRejectDialog(true);
        setTxStatus(''); // Clear status for the dialog
      } else if (error instanceof Error) {
        setTxStatus('Error minting NFT: ' + error.message);
      } else {
        setTxStatus('Error minting NFT: An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchNFTGallery = useCallback(async () => {
    if (!address) {
      console.log("Wallet address not connected, cannot fetch NFT Gallery.");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/nft/gallery/${address}`);
      if (!response.ok) {
        const message = `Failed to fetch NFT gallery: ${response.status} ${response.statusText}`;
        console.error(message);
        setTxStatus(message);
        return;
      }
      const responseData = await response.json();

      if (responseData.success) {
       // setNftGallery(responseData.data);
        console.log("Error fetching NFT gallery:", responseData.data);
      } else {
        console.error("Failed to fetch NFT gallery from backend:", responseData.message);
        setTxStatus(`Failed to fetch NFT gallery: ${responseData.message}`);
      }
    } catch (error: unknown) {
      console.error("Error fetching NFT gallery:", error);
      if (error instanceof Error) {
        setTxStatus(`Error fetching NFT gallery: ${error.message}`);
      } else {
        setTxStatus('Error fetching NFT gallery: Unknown error');
      }
    }
  }, [address]);

  useEffect(() => {
    if (isConnected && address) {
      fetchNFTGallery();
    } else if (!isConnected) {
     // setNftGallery([]);
     console.log("Error fetching NFT gallery:");
    }
  }, [isConnected, address, fetchNFTGallery]);

  return (
    <div className="bg-gray-900 p-8 rounded-lg shadow-lg min-w-[400px]">
      <h1 className="text-5xl font-bold mb-6 text-white">
        Discover & Collect Extraordinary NFTs
      </h1>
      <p className="text-gray-400 mb-6">
        Enter the world of digital art and collectibles. Explore unique NFTs created by artists worldwide.
      </p>

      <div className="flex justify-center space-x-4 mb-6">
        <button
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-2 px-6 rounded"
          onClick={() => setShowMintForm(true)}
        >
          Start Creating
        </button>
        <button
          className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded"
          onClick={() => console.log("Watch Demo clicked")}
        >
          Watch Demo
        </button>
      </div>

      {!isConnected && !showMintForm && <ConnectButton />}

      {isConnected && showMintForm && !mintSuccessful && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4 text-white">Mint Your NFT</h3>
          <input
            type="text"
            placeholder="NFT Name"
            className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            placeholder="NFT Description"
            className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          <input
            type="text"
            placeholder="NFT Logo URL"
            className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
          />
          <button
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-2 px-4 rounded w-full mt-4"
            onClick={handleMint}
            disabled={loading}
          >
            {loading ? 'Minting...' : 'Mint NFT'}
          </button>
        </div>
      )}

      {mintSuccessful && mintedNFT && (
        <div className="bg-gray-800 p-6 rounded-lg mt-6">
          <div className="flex items-center justify-center mb-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-10 h-10 text-green-500"
            >
              <path
                fillRule="evenodd"
                d="M19.916 4.626a.75.75 0 01.208 1.04l-9 12.88a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.134a.75.75 0 011.04-.208z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-xl font-bold text-center text-white mb-6">
            NFT Minted Successfully!
          </p>

          <div className="rounded-2xl overflow-hidden bg-[#21212A]">
            <Image
              src={mintedNFT.imageUrl}
              alt={mintedNFT.name}
              width={500}
              height={300}
              className="w-full h-auto object-cover"
            />
            <div className="p-4">
              <p className="text-sm text-gray-400 mb-1">Creator</p>
              <p className="text-white font-bold text-lg mb-3">Anonymous</p>
              <p className="text-sm text-gray-400 mb-1">NFT Name</p>
              <p className="text-white font-bold text-lg mb-3">
                {mintedNFT.name} #{String(mintedNFT.tokenId).padStart(3, '0')}
              </p>
              <p className="text-sm text-gray-400 mb-1">Description</p>
              <p className="text-white text-sm mb-4">{mintedNFT.description}</p>
              <p className="text-sm text-gray-400 mb-1">NFT ID</p>
              <p className="text-white text-sm font-mono"># {String(mintedNFT.tokenId)}</p>
            </div>
          </div>

          <div className="flex space-x-2 mt-6">
            <button
              className="flex-1 bg-[#21212A] hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg"
              onClick={() => console.log("Share clicked")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5 inline-block mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.217 10.907a2.25 2.25 0 000 3.182m5.107-3.182a2.25 2.25 0 010 3.182m-4.769-1.621a2.25 2.25 0 00-.713-.158m0 0a2.25 2.25 0 01-.713-.158m6.99 1.457a2.25 2.25 0 01.712-.158m0 0a2.25 2.25 0 00.713-.158m-1.02-1.51c.351-.75.938-1.31 1.697-1.658m-3.176 .152c-1.743 1.222-2.824 3.232-2.824 5.567 0 2.335 1.081 4.344 2.824 5.567.612.429 1.02 1.51 1.02 2.076a.75.75 0 01-.222.53l-.958.958a.75.75 0 01-1.06 0l-.958-.958a.75.75 0 01-.222-.53c0-.566.408-1.647 1.02-2.076C6.573 16.655 5.5 14.645 5.5 12.31 5.5 9.975 6.573 7.965 8.316 6.743a1.75 1.75 0 012.122-1.592m-4.09 4.09a2.5 2.5 0 10-3.536-3.536L15.49 14.51a2.5 2.5 0 103.536 3.536L6.31 6.31z"
                />
              </svg>
              Share
            </button>
            <button
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-lg"
              onClick={() => setMintSuccessful(false)}
            >
              Mint Another
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5 inline-block ml-2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {txStatus && !showRejectDialog && <p className="mt-4 text-red-500">{txStatus}</p>}

      {showRejectDialog && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-900 bg-opacity-70 flex justify-center items-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4">Transaction Rejected</h3>
            <p className="text-gray-300 mb-4">
              You rejected the transaction signature request. Please try again if you wish to mint your NFT.
            </p>
            <div className="flex justify-end">
              <button
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                onClick={() => setShowRejectDialog(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
};

export default MintWidget;