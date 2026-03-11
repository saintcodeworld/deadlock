# Slasher Betting Game

A web-based "Slasher" betting game where a killer (Ghostface) moves through a 2D top-down house map. Users bet on rooms to survive. Built on Solana with pump.fun integration.

## Features

- **10-Room Interactive House Map**: Clean architectural blueprint-style floor plan
- **Animated Ghostface Killer**: Moves randomly between rooms with smooth animations
- **Solana Wallet Integration**: Connect with Phantom or Solflare wallets
- **Real-time Betting**: Place bets on rooms and track the leaderboard
- **Dev Buy Trigger**: Automated pump.fun buy when killer hits target room

## Tech Stack

- **Frontend**: Next.js 14 with React 18
- **Styling**: Tailwind CSS with custom blueprint theme
- **Animations**: Framer Motion
- **Blockchain**: Solana Web3.js + Wallet Adapter
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Solana wallet (Phantom/Solflare)

### Installation

1. Clone the repository and navigate to the project:
```bash
cd "slasher game"
```

2. Install dependencies:
```bash
npm install
```

3. Create your environment file:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_PUMP_FUN_TOKEN_ADDRESS=your_token_address_here
DEV_PRIVATE_KEY=your_base58_private_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
slasher game/
├── src/
│   ├── app/
│   │   ├── globals.css      # Global styles + blueprint theme
│   │   ├── layout.tsx       # Root layout with wallet provider
│   │   └── page.tsx         # Main game page
│   ├── components/
│   │   ├── BettingSidebar.tsx    # Betting UI + leaderboard
│   │   ├── GameHeader.tsx        # Header with wallet connect
│   │   ├── HouseMap.tsx          # Main SVG house map
│   │   ├── Killer.tsx            # Animated Ghostface sprite
│   │   ├── Room.tsx              # Individual room component
│   │   └── WalletContextProvider.tsx  # Solana wallet setup
│   └── context/
│       └── GameContext.tsx       # Game state management
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## How to Play

1. **Connect Wallet**: Click "Select Wallet" and connect your Phantom or Solflare wallet
2. **Select a Room**: Click on any room in the blueprint map
3. **Place a Bet**: Enter your bet amount in SOL and click "Place Bet"
4. **Watch the Killer**: Ghostface moves randomly between rooms
5. **Round End**: When the timer hits zero, the killer strikes the target room
6. **Dev Buy**: If the target room has the most bets, a pump.fun buy is triggered

## Customization

### Changing Room Layout
Edit the `initialRooms` array in `src/context/GameContext.tsx` to modify room positions and sizes.

### Adjusting Round Duration
Change `roundTimeRemaining` initial value in `GameContext.tsx` (default: 300 seconds = 5 minutes).

### Styling
Modify the blueprint colors in `tailwind.config.ts`:
```ts
colors: {
  blueprint: {
    bg: '#1a2744',      // Background
    line: '#4a9eff',    // Primary lines
    accent: '#00d4ff',  // Accent color
    dark: '#0f1a2e',    // Dark variant
  },
}
```

## Backend Integration (Coming Soon)

The backend Express server for automated pump.fun swaps will include:
- Round management API
- Automated dev buy execution
- Transaction signing with dev wallet
- pump.fun bonding curve integration

## Security Notes

- **Never commit your `.env` file** with real private keys
- The dev wallet private key should only be used on a secure server
- Consider using a hardware wallet or HSM for production

## License

MIT
