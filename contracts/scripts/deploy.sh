#!/bin/bash

# Deployment script for LémanFlow smart contracts
echo "🚀 Deploying LémanFlow smart contracts..."

# Check if network is provided
NETWORK=${1:-devnet}
echo "📡 Deploying to: $NETWORK"

# Navigate to contracts directory
cd "$(dirname "$0")/.."

# Build first
echo "🔨 Building contracts..."
sui move build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Deploy
echo "🚀 Publishing to $NETWORK..."
sui client publish --gas-budget 100000000 --skip-dependency-verification

if [ $? -eq 0 ]; then
    echo "✅ Smart contracts deployed successfully!"
    echo "📝 Don't forget to update your .env files with the new package IDs"
else
    echo "❌ Deployment failed!"
    exit 1
fi
