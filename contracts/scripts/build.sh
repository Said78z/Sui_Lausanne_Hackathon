#!/bin/bash

# Build script for LémanFlow smart contracts
echo "🔨 Building LémanFlow smart contracts..."

# Navigate to contracts directory
cd "$(dirname "$0")/.."

# Build the contracts
sui move build

if [ $? -eq 0 ]; then
    echo "✅ Smart contracts built successfully!"
else
    echo "❌ Build failed!"
    exit 1
fi
