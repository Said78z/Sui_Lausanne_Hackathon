#!/bin/bash

# Test script for LémanFlow smart contracts
echo "🧪 Testing LémanFlow smart contracts..."

# Navigate to contracts directory
cd "$(dirname "$0")/.."

# Run tests
sui move test

if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Tests failed!"
    exit 1
fi
