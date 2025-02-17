// components/NftGallery.tsx
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

interface NFTData {
  nftId: number;
  name: string;
  description: string;
  logoUrl: string;
  userWalletAddress: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

const NftGallery = () => {
  const { address } = useAccount();
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address) return;
      setLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/api/nft/gallery/${address}`);
        const data = await res.json();
        if (data.success) {
          setNfts(data.data);
        }
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [address]);

  if (!address) {
    return <p className="text-center">Please connect your wallet to view your NFTs.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your NFT Gallery</h2>
      {loading ? (
        <p>Loading NFTs...</p>
      ) : nfts.length === 0 ? (
        <p>No NFTs found, please mint your first one using the widget above.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {nfts.map((nft) => (
            <div key={nft.nftId} className="bg-gray-800 p-4 rounded-lg shadow-lg">
              <img
                src={nft.logoUrl}
                alt={nft.name}
                className="w-full h-48 object-cover rounded mb-4"
                onError={(e) => {
                  e.currentTarget.src = '/fallback-image.png';
                }}
              />
              <h3 className="text-lg font-bold">{nft.name}</h3>
              <p>{nft.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NftGallery;
