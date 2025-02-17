// providers/WalletProvider.tsx
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { createConfig, WagmiConfig, http } from 'wagmi';
import { sepolia } from '@wagmi/chains';

// Ensure `chains` is a tuple by using `as const`
const chains = [sepolia] as const;

const { connectors } = getDefaultWallets({
  appName: 'NFT Minting App',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID_HERE',
});

const sepoliaRpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'YOUR_SEPOLIA_RPC_URL';

const config = createConfig({
  connectors,
  chains,
  transports: {
    [sepolia.id]: http(sepoliaRpcUrl),
  },
});

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
