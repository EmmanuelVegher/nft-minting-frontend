// pages/index.tsx
import type { NextPage } from 'next';
import MintWidget from '../components/MintWidget';
import NftGallery from '../components/NftGallery';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Home: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">NFT Minting App</h1>
        <ConnectButton />
      </header>
      <main className="container mx-auto px-4">
        <section className="my-8">
          <MintWidget />
        </section>
        <section className="my-8">
          <NftGallery />
        </section>
      </main>
    </div>
  );
};

export default Home;
