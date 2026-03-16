.PHONY: build test deploy

build:
	cargo build --target wasm32-unknown-unknown --release
	@ls -la target/wasm32-unknown-unknown/release/*.wasm

test:
	cargo test -- --nocapture

deploy: build
	@echo "Deploying to testnet..."
	@stellar contract deploy \
		--source-alice \
		--network testnet \
		--wasm target/wasm32-unknown-unknown/release/student_vesting.wasm \
		--output-id

install-tools:
	cargo install --locked stellar-cli
	rustup target add wasm32-unknown-unknown