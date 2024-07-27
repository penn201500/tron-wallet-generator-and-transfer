require("dotenv").config();
const { generateMnemonic, mnemonicToSeed } = require("bip39");
const hdkey = require("hdkey");
const { keccak256 } = require("ethereum-cryptography/keccak");
const base58 = require("base-58");
const { stringify } = require("csv-stringify/sync");
const { getFormattedDateTime, writeDataToFile } = require("./utils.js");
const EC = require("elliptic").ec;

// Create and initialize EC context
const ec = new EC("secp256k1");

// Parse CLI arguments
const numberOfWallets = process.argv.length > 2 ? parseInt(process.argv[2]) : 1;
const format = process.argv.length > 3 ? process.argv[3] : "csv";

if (isNaN(numberOfWallets) || numberOfWallets < 1) {
  console.error("⛔️ Error: Please provide a valid number of wallets to generate!");
  process.exit(1);
}

if (!["csv", "json"].includes(format.toLowerCase())) {
  console.error('⛔️ Error: Format must be either "csv" or "json"!');
  process.exit(1);
}

// Generate wallets locally
function privateKeyToTronAddress(privateKey) {
  const key = ec.keyFromPrivate(privateKey);
  const publicKey = key.getPublic().encode("hex").slice(2); // Remove the '04' prefix
  const address = keccak256(Buffer.from(publicKey, "hex")).slice(-20); // Get the last 20 bytes
  const tronAddressHex = Buffer.from("41" + address.toString("hex"), "hex"); // Add Tron address prefix '41'
  const tronAddress = base58.encode(tronAddressHex); // Base58 encode
  return tronAddress;
}

async function generateWallet() {
  const mnemonic = generateMnemonic();
  const seed = await mnemonicToSeed(mnemonic); // The mnemonic is converted to a seed
  const root = hdkey.fromMasterSeed(seed); // Using hdkey, the seed is used to derive the private key and address for the Tron blockchain
  const addrnode = root.derive("m/44'/195'/0'/0/0"); // Tron derivation path
  const privateKey = addrnode.privateKey.toString("hex");
  const address = privateKeyToTronAddress(privateKey);

  return {
    mnemonic,
    privateKey,
    address,
  };
}

console.log(`✨ Generating ${numberOfWallets} wallet(s) in ${format} format...`);
let wallets = [];
let rows = [];

(async () => {
  for (let i = 0; i < numberOfWallets; i++) {
    const wallet = await generateWallet();

    // Console output for each wallet
    console.log(`Wallet #${i + 1}`);
    console.log("📄 Mnemonic:", wallet.mnemonic);
    console.log("🔑 Private Key:", wallet.privateKey);
    console.log("👛 Wallet Address:", wallet.address);
    console.log("-----------------------------------");

    wallets.push(wallet);
    rows.push([wallet.mnemonic, wallet.privateKey, wallet.address]); // Adjust columns as needed
  }

  let csvContent;
  // Save wallets to a file using the utility function
  if (format === "csv") {
    csvContent = stringify(rows, { header: true, columns: ["Mnemonic", "PrivateKey", "WalletAddress"] });
    writeDataToFile("wallets", csvContent, "csv"); // Ensure proper filename for CSV
  } else {
    writeDataToFile("wallets", wallets, "json"); // Ensure proper filename for JSON
  }

  console.log(`✨ Generated and saved ${numberOfWallets} wallet(s) in ${format} format.`);
})();
