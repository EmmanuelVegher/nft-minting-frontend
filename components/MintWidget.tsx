"use client";
import { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'wagmi/chains';
import contractABI from '../abi/NFTMintABI.json';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid'; // Ensure uuidv4 is imported correctly
import { UserRejectedRequestError } from 'viem'; // Import UserRejectedRequestError

const CONTRACT_ADDRESS = '0x743f49311a82fe72eb474c44e78da2a6e0ae951c';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.org';

// Create a publicClient for read operations
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URL),
});

const MintWidget = () => {
  const { address, connector, isConnected } = useAccount();
  // Get the wallet client (for write operations)
  const { data: walletClient } = useWalletClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState('');

  const [mintSuccessful, setMintSuccessful] = useState(false);
  const [mintedNFT, setMintedNFT] = useState<any>(null);
  const [showMintForm, setShowMintForm] = useState(false); // State to control mint form visibility
  const [nftGallery, setNftGallery] = useState<any[]>([]); // State for NFT Gallery
  const [showRejectDialog, setShowRejectDialog] = useState(false); // State for reject dialog


  const generateTokenId = async (): Promise<number> => {
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
        });
      } catch (error) {
        console.error('Error checking token ID:', error);
        exists = false;
        break; // Exit loop on error to avoid infinite loop if contract call fails repeatedly
      }
      if (!exists) {
        return newId;
      }
    }
    throw new Error("Unable to generate a unique token ID");
  };

  const handleMint = async () => {
    if (!address || !connector) {
      setTxStatus('Please connect your wallet.');
      return;
    }
    if (!walletClient) {
      setTxStatus('Wallet client not available.');
      return;
    }


    if (!name || !description || !logoUrl) {  // Input validation
      setTxStatus('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setTxStatus('');
    setMintSuccessful(false); // Reset success state
    setShowRejectDialog(false); // Ensure dialog is closed on new mint attempt

    try {
      const tokenId = await generateTokenId();
      if (!tokenId || tokenId === null) {
        console.error("Invalid tokenId:", tokenId);
        return;
      }


      console.log('Generated Token ID:', tokenId); // Print the tokenId before insertion

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


      console.log('Response:', response);

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData?.message || 'Failed to store NFT data in backend';
        throw new Error(errorMessage);
      }

      const metadataUrl = `${BACKEND_URL}/api/nft/${tokenId}`;
      const tx = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: 'mint',
        args: [tokenId, metadataUrl],
      });

      // After successful mint
      setMintSuccessful(true);
      setMintedNFT({
        name,
        description,
        imageUrl: logoUrl,
        tokenId,
      });

      setName(''); // Clear input fields
      setDescription('');
      setLogoUrl('');
      setTxStatus('NFT Minted Successfully!'); // Update success message
      setShowMintForm(false); // Hide mint form after successful mint

      // Refetch NFT Gallery to update the list after minting
      fetchNFTGallery();


    } catch (error: any) {
      console.error("Mint Error:", error);

      if (error instanceof UserRejectedRequestError) {
        setShowRejectDialog(true); // Show reject dialog if user denied tx
        setTxStatus(''); // Clear txStatus for reject error to avoid displaying in paragraph
      }
      else {
        // Improved error handling for other errors
        let errorMessage = 'An unknown error occurred.';
        if (error.message) {
          errorMessage = error.message;
        } else if (error.data?.message) { // Check for data.message from RPC errors
          errorMessage = error.data.message;
        }
        setTxStatus('Error minting NFT: ' + errorMessage); // Set txStatus for other errors
      }
    } finally {
      setLoading(false);
    }
  };


  const fetchNFTGallery = async () => {
    if (!address) {
      console.log("Wallet address not connected, cannot fetch NFT Gallery.");
      return; // Exit if no wallet address
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/nft/gallery/${address}`);
      if (!response.ok) {
        const message = `Failed to fetch NFT gallery: ${response.status} ${response.statusText}`;
        console.error(message);
        setTxStatus(message); // Optionally show error to user
        return;
      }
      const responseData = await response.json();

      if (responseData.success) {
        setNftGallery(responseData.data);
      } else {
        console.error("Failed to fetch NFT gallery from backend:", responseData.message);
        setTxStatus(`Failed to fetch NFT gallery: ${responseData.message}`); //Optional user error message
      }

    } catch (error: any) {
      console.error("Error fetching NFT gallery:", error);
      setTxStatus(`Error fetching NFT gallery: ${error.message || 'Unknown error'}`); //Optional user error message
    }
  };
  
  useEffect(() => {
    if (isConnected && address) {
      fetchNFTGallery(); // Fetch gallery when connected and address is available
    } else if (!isConnected) {
      setNftGallery([]); // Clear gallery when disconnected
    }
  }, [isConnected, address]); // Dependencies on isConnected and address


  return (
    <div className="bg-gray-900 p-8 rounded-lg shadow-lg min-w-[400px]"> {/* Adjusted styling */}
      <h1 className="text-5xl font-bold mb-6 text-white"> {/* Adjusted styling */}
        Discover & Collect Extraordinary NFTs
      </h1>
      <p className="text-gray-400 mb-6"> {/* Added description */}
        Enter the world of digital art and collectibles. Explore unique NFTs created by artists
        worldwide.
      </p>

      <div className="flex justify-center space-x-4 mb-6"> {/* Buttons container */}
        <button
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-2 px-6 rounded"
          onClick={() => setShowMintForm(true)} // Show mint form on click
        >
          Start Creating
        </button>
        <button
          className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded"
          onClick={() => { /* Add Watch Demo functionality here */ console.log("Watch Demo clicked"); }}
        >
          Watch Demo
        </button>
      </div>

      {!isConnected && !showMintForm && <ConnectButton />} {/* Conditionally show connect button */}

      {isConnected && showMintForm && !mintSuccessful && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4 text-white">Mint Your NFT</h3> {/* Added title */}
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
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-2 px-4 rounded w-full mt-4" // updated button style
            onClick={handleMint}
            disabled={loading}
          >
            {loading ? 'Minting...' : 'Mint NFT'}
          </button>
        </div>
      )}


      {mintSuccessful && (
        <div className="bg-gray-800 p-6 rounded-lg mt-6"> {/* Success message container */}
          <div className="flex items-center justify-center mb-5"> {/* Checkmark icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-green-500">
              <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 12.88a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.134a.75.75 0 011.04-.208z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-xl font-bold text-center text-white mb-6">NFT Minted Successfully!</p>

          <div className="rounded-2xl overflow-hidden bg-[#21212A]">
            <Image src={mintedNFT.imageUrl} alt={mintedNFT.name} width={500} height={300} className="w-full h-auto object-cover" />
            <div className="p-4">
              <p className="text-sm text-gray-400 mb-1">Creator</p>
              <p className="text-white font-bold text-lg mb-3">Anonymous</p> {/* Replace with actual creator if available */}
              <p className="text-sm text-gray-400 mb-1">NFT Name</p>
              <p className="text-white font-bold text-lg mb-3">{mintedNFT.name} #{String(mintedNFT.tokenId).padStart(3, '0')}</p>
              <p className="text-sm text-gray-400 mb-1">Description</p>
              <p className="text-white text-sm mb-4">{mintedNFT.description}</p>
              <p className="text-sm text-gray-400 mb-1">NFT ID</p>
              <p className="text-white text-sm font-mono"># {String(mintedNFT.tokenId)}</p> {/* Display tokenId as NFT ID */}
            </div>
          </div>

          <div className="flex space-x-2 mt-6">
            <button
              className="flex-1 bg-[#21212A] hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg"
              onClick={() => { /* Implement share functionality */ console.log("Share clicked"); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 inline-block mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 000 3.182m5.107-3.182a2.25 2.25 0 010 3.182m-4.769-1.621a2.25 2.25 0 00-.713-.158m0 0a2.25 2.25 0 01-.713-.158m6.99 1.457a2.25 2.25 0 01.712-.158m0 0a2.25 2.25 0 00.713-.158m-1.02-1.51c.351-.75.938-1.31 1.697-1.658m-3.176 .152c-1.743 1.222-2.824 3.232-2.824 5.567 0 2.335 1.081 4.344 2.824 5.567.612.429 1.02 1.51 1.02 2.076a.75.75 0 01-.222.53l-.958.958a.75.75 0 01-1.06 0l-.958-.958a.75.75 0 01-.222-.53c0-.566.408-1.647 1.02-2.076C6.573 16.655 5.5 14.645 5.5 12.31 5.5 9.975 6.573 7.965 8.316 6.743a1.75 1.75 0 012.122-1.592m-4.09 4.09a2.5 2.5 0 10-3.536-3.536L15.49 14.51a2.5 2.5 0 103.536 3.536L6.31 6.31z" />
              </svg>
              Share
            </button>
            <button
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-lg"
              onClick={() => setMintSuccessful(false)}
            >
              Mint Another
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 inline-block ml-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>

            </button>
          </div>
        </div>
      )}

      {txStatus && !showRejectDialog && <p className="mt-4 text-red-500">{txStatus}</p>} {/* Only show txStatus for non-reject errors */}

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-900 bg-opacity-70 flex justify-center items-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4">Transaction Rejected</h3>
            <p className="text-gray-300 mb-4">You rejected the transaction signature request. Please try again if you wish to mint your NFT.</p>
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