// _app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { WalletProvider } from '../providers/WalletProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Import React Query components

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}> {/* QueryClientProvider at the top level */}
      <WalletProvider> {/* Then your WalletProvider */}
        <Component {...pageProps} />
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default MyApp;


// // _app.tsx
// import { AppProps } from 'next/app';
// import { WagmiProvider, configureChains, createConfig, mainnet } from 'wagmi';
// import { publicProvider } from 'wagmi/providers/public';
// import { InjectedConnector } from '@wagmi/connectors'; // Correct import
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';




// const { chains, provider, webSocketProvider } = configureChains(
//     [mainnet],
//     [publicProvider()],
// )


// const client = createConfig({
//     autoConnect: true,
//     connectors: [
//         new InjectedConnector({
//             chains,
//             options: { shimDisconnect: true },
//         }),
//     ],
//     provider,
//     webSocketProvider,

// })


// const queryClient = new QueryClient({})

// function MyApp({ Component, pageProps }: AppProps) {
//     return (
//         <WagmiProvider client={client}> {/* WagmiProvider MUST be above the QueryClientProvider */}
//           <QueryClientProvider client={queryClient}>
//             <Component {...pageProps} />
//           </QueryClientProvider>
//         </WagmiProvider>
//     );
// }

// export default MyApp;