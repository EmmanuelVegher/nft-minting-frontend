**NFT Minting Frontend**

**Overview**

This project is a Next.js-based frontend for an NFT minting dApp. It integrates Wagmi and RainbowKit for Ethereum wallet connections, utilizes Tailwind CSS for styling, and interacts with an NFT smart contract deployed on the blockchain.

**Features**

1) Wallet connection using Wagmi and RainbowKit

2) NFT minting functionality

3) NFT gallery to display minted NFTs

4) Tailwind CSS for modern UI design

5) TypeScript support

6) Gas estimation before transactions

7) Responsive design for mobile and desktop

**Project Structure**

nft-minting-frontend/
├── abi/
│   └── NFTMintABI.json       // Smart contract ABI file
├── components/
│   ├── MintWidget.tsx        // Component for minting NFTs
│   ├── NftGallery.tsx        // Component for displaying NFTs
│   ├── WalletConnect.tsx     // Component for wallet connection
│   ├── GasEstimator.tsx      // Component for estimating gas fees
├── pages/
│   ├── _app.tsx              // Custom App wrapper with WalletProvider
│   ├── index.tsx             // Home page with minting and gallery
│   └── about.tsx             // About page for project information
├── providers/
│   └── WalletProvider.tsx    // Wallet connection setup using Wagmi and RainbowKit
├── public/
│   └── fallback-image.png    // Default NFT image
├── styles/
│   └── globals.css           // Tailwind CSS global styles
├── .eslintrc.mjs             // ESLint configuration
├── next.config.ts            // Next.js configuration
├── next-env.d.ts             // Next.js environment types
├── package.json              // Project dependencies and scripts
├── tailwind.config.ts        // Tailwind CSS configuration
└── tsconfig.json             // TypeScript configuration

**Installation**

1) Clone the repository:

git clone https://github.com/EmmanuelVegher/nft-minting-frontend.git
cd nft-minting-frontend

2) Install dependencies:

npm install

3) Build the application for production:

npm run build

4) Start the production server:

npm run start

The app will be available at http://localhost:3000.

Environment Variables

Create a .env.local file in the root directory and add the following:

NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID='Your-Project-ID'
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/"Your-RPC-ID"
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress
NEXT_PUBLIC_CHAIN_ID=1

Replace 0xYourContractAddress with the actual deployed contract address.

**Usage**

1) Connect your Ethereum wallet using the "Connect Wallet" button.

2) Mint an NFT by filling out the required fields and clicking "Mint".

3) View minted NFTs in the NFT Gallery.

4) Check gas fees before minting using the gas estimator.

**Dependencies**

 1) next: React framework for server-side rendering

2) react: UI library

3) wagmi: Wallet integration and Ethereum utilities

4) @rainbow-me/rainbowkit: UI for Ethereum wallet connection

5) tailwindcss: Utility-first CSS framework

6) viem: Ethereum interaction library

7) ethers: Library for interacting with Ethereum smart contracts

**Scripts**

1) npm run dev - Start development server

2) npm run build - Build for production

3) npm run start - Start the production server

4) npm run lint - Run ESLint

**License**

This project is licensed under the MIT License.