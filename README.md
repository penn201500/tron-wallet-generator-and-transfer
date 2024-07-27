
# Tron Wallet Generator

This project is a Node.js script for generating Tron wallets **locally**. It supports generating multiple wallets with a mnemonic phrase and can output the results in CSV or JSON format.

## Features

- Generate multiple Tron wallets.
- Generate Tron wallets with a mnemonic phrase.
- Convert private keys to Tron addresses using Base58Check encoding.
- Output generated wallets in CSV or JSON format.

## Requirements

- Node.js (v20.15.1)
- npm (v6 or later)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/penn201500/tron-wallet-generator-and-transfer
   cd tron-wallet-generator-and-transfer
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

## Usage

### Generating Wallets

To generate a specified number of Tron wallets and output them in a specified format, run the script with the following command:

```bash
node generator.js <number_of_wallets> <output_format>
```

- `<number_of_wallets>`: The number of wallets to generate (e.g., `2`).
- `<output_format>`: The format to output the generated wallets. Either `csv` or `json`.

Example:
```bash
node generator.js 5 csv
```

This command will generate 5 wallets and save them in CSV format.

### Output Example

Each generated wallet includes:
- Mnemonic phrase
- Private key
- Tron address

## Example

An example of generated output in CSV format:

```csv
Mnemonic,PrivateKey,WalletAddress
candy maple cake sugar pudding cream honey rich smooth crumble sweet treat,83e6d4714f1d3e1a0a7654926de35189c69e8b84b166c68475260c62d36d2fa0,TTj9kD5cFnb5YP1ySVPZqgr5pRtEXuB6cD
...

```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please create an issue or submit a pull request.
