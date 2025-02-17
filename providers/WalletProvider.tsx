// providers/WalletProvider.tsx
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { createConfig, WagmiConfig, http } from 'wagmi';
import { sepolia } from '@wagmi/chains';

const chains = [sepolia];

const { connectors } = getDefaultWallets({
  appName: 'NFT Minting App',
  chains,
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID_HERE', // Replace with your actual project ID if using WalletConnect, otherwise, remove this line
});


const sepoliaRpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'YOUR_SEPOLIA_RPC_URL';  // Get your Sepolia RPC URL (e.g., from Infura, Alchemy)


const config = createConfig({
  autoConnect: true,
  connectors,
  chains,
  transports: {
    [sepolia.id]: http(sepoliaRpcUrl),  // Provide the RPC URL here
  },
});

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider chains={chains}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}