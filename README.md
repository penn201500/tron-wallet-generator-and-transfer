
# Tron Wallet Generator and Transfer

This project is a Node.js script for generating Tron wallets **locally** and transferring TRX from one address to multiple addresses. It supports generating multiple wallets and can output the results in CSV or JSON format.

## Features

- Generate multiple Tron wallets.
- Convert private keys to Tron addresses using Base58Check encoding.
- Output generated wallets in CSV or JSON format.
- Transfer TRX from one address to multiple addresses specified in a wallets file.
- Retrieve TRX from multiple wallets to a central wallet.

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

### Transferring TRX

To transfer TRX from one address to multiple addresses specified in a wallets file, run the script with the following command:

```bash
node transfer.js <sender_address> <wallets_file_path> <amount>
```

- `<sender_address>`: The address of the sender.
- `<wallets_file_path>`: The path to the file containing the wallet addresses.
- `<amount>`: The amount of TRX to transfer. You can set the random range in the code of function `getRandomAmount`.

Example:

```bash
node transfer.js TFDqAKZpCF2uHsa9NjPBNHspGcoeXdFfw4 wallets_2024-07-27_16-18-11.csv 1
```

### Retrieving TRX

To retrieve TRX from multiple wallets specified in a file to a central wallet, run the script with the following command:

```bash
node retrieveFunds.js <wallets_file_path> <central_wallet_address>
```

- `<wallets_file_path>`: The path to the file containing the wallets with private keys.
- `<central_wallet_address>`: The address of the central wallet to which the funds will be transferred.

## Examples

An example of generated output in CSV format:

```csv
Mnemonic,PrivateKey,WalletAddress
candy maple cake sugar pudding cream honey rich smooth crumble sweet treat,83e6d4714f1d3e1a0a7654926de35189c69e8b84b166c68475260c62d36d2fa0,TTj9kD5cFnb5YP1ySVPZqgr5pRtEXuB6cD
...

```

An example of generated transaction output:

```csv
Timestamp,From,To,randomAmount,TransactionHash,GasFee
"2024-07-28 21:12:15","TFDqAKZpCF2uHsa9NjPBNHspGcoeXdFfw4","TRkszKtjZYqNqdWbh7ubrhZwhmpfTfw3v9","0.94","ef1aff613c17b483777f194cd312f0f061a84c567eecb48c5cb2c5ce4c9a1bdd","1.1"
...
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please create an issue or submit a pull request.
