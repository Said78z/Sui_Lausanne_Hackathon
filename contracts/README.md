# LémanFlow Smart Contracts

This directory contains the Move smart contracts for the LémanFlow hackathon platform built on Sui blockchain.

## Contracts Overview

### 1. Passport Contract (`passports.move`)

-   **Purpose**: Soulbound NFT (SBT) representing event participation
-   **Features**: Non-transferable tokens proving attendance/participation
-   **Key Functions**: `mint_passport()`, `get_passport_info()`

### 2. CheckIn Contract (`checkin.move`)

-   **Purpose**: Mission validation and QR code verification
-   **Features**: Mission completion tracking, QR signature verification
-   **Key Functions**: `create_mission()`, `validate_checkin()`, `claim_attestation()`

### 3. Grant Pool Contract (`grant_pool.move`)

-   **Purpose**: Automated micro-grants distribution
-   **Features**: Pool management, automatic reward distribution
-   **Key Functions**: `init_pool()`, `distribute_grants()`, `claim_reward()`

## Project Structure

```
contracts/
├── Move.toml              # Package configuration
├── sources/               # Smart contract source files
│   ├── passports.move     # Passport SBT contract
│   ├── checkin.move       # Mission validation contract
│   └── grant_pool.move    # Grants distribution contract
├── tests/                 # Test files
├── scripts/               # Build and deployment scripts
│   ├── build.sh          # Build contracts
│   ├── test.sh           # Run tests
│   └── deploy.sh         # Deploy to network
└── README.md             # This file
```

## Quick Start

### Prerequisites

-   [Sui CLI](https://docs.sui.io/build/install) installed
-   Sui wallet configured

### Build Contracts

```bash
cd contracts
./scripts/build.sh
```

### Run Tests

```bash
./scripts/test.sh
```

### Deploy to Devnet

```bash
./scripts/deploy.sh devnet
```

### Deploy to Mainnet

```bash
./scripts/deploy.sh mainnet
```

## Integration with Backend

After deployment, update your backend `.env` file with the package IDs:

```env
SUI_NETWORK=mainnet
PASSPORT_PACKAGE_ID=0x...
CHECKIN_PACKAGE_ID=0x...
GRANT_POOL_PACKAGE_ID=0x...
```

## Key Features

-   **Soulbound Tokens**: Non-transferable NFTs for participation proof
-   **Gasless Transactions**: Sponsored transactions for seamless UX
-   **QR Verification**: ECDSA signature verification for mission validation
-   **Automated Distribution**: Smart contract-based reward distribution
-   **Dynamic Fields**: Scalable mission and attestation management

## Security Features

-   Anti-double claim protection
-   Timestamp verification
-   ECDSA signature validation
-   Soulbound token implementation
-   Comprehensive test coverage

## Development

### Adding New Contracts

1. Create new `.move` file in `sources/`
2. Add corresponding test file in `tests/`
3. Update `Move.toml` if needed
4. Run tests with `./scripts/test.sh`

### Testing

All contracts include comprehensive tests covering:

-   Normal operation flows
-   Edge cases
-   Security scenarios
-   Error conditions

Run tests frequently during development to ensure contract integrity.
