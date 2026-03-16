#!/bin/bash
set -e

echo "🚀 Deploying Student Vesting Contract to Testnet..."

# Check prerequisites
if ! command -v stellar &> /dev/null; then
  echo "❌ Stellar CLI not found. Install with: cargo install --locked stellar-cli"
  exit 1
fi

if ! command -v cargo &> /dev/null; then
  echo "❌ Rust/Cargo not found. Install from https://rustup.rs"
  exit 1
fi

# Build contract
echo "🔨 Building WASM..."
cd contracts/student_vesting
cargo build --target wasm32-unknown-unknown --release
WASM_PATH="target/wasm32-unknown-unknown/release/student_vesting.wasm"

# Deploy to testnet
echo "📡 Deploying to Stellar Testnet..."
CONTRACT_ID=$(stellar contract deploy \
  --source <YOUR_TESTNET_SECRET_KEY> \
  --network testnet \
  --wasm "$WASM_PATH" \
  --output-id 2>/dev/null | grep -o 'Contract ID: [A-Z0-9]*' | cut -d' ' -f3)

if [ -z "$CONTRACT_ID" ]; then
  echo "❌ Deployment failed"
  exit 1
fi

echo "✅ Contract deployed: $CONTRACT_ID"

# Update frontend env
cd ../..
echo "VITE_VESTING_CONTRACT_ID=$CONTRACT_ID" >> .env.local

echo "🎉 Deployment complete!"
echo "Add this to your .env.local:"
echo "VITE_VESTING_CONTRACT_ID=$CONTRACT_ID"