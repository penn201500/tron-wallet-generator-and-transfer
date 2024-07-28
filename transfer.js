require("dotenv").config()
const axios = require("axios")
const { readWalletAddresses, writeDataToFile, timestampToDatetime, getRandomAmount } = require("./utils")

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchTransactionInfoFromTronGrid(txid) {
  const tronGridEndpoint = `${process.env.TRONSCAN_QUERY_API}${txid}`
  try {
    const response = await axios.get(tronGridEndpoint, {
      headers: {
        Accept: "application/json, text/plain, */*",
      },
    })
    if (response.status !== 200) {
      throw new Error(`Failed to fetch transaction info from TronGrid: ${response.statusText}`)
    }

    const jsonData = response.data
    if (!jsonData || !jsonData.contractRet) {
      throw new Error("No valid transaction info found on TronGrid")
    }

    return jsonData
  } catch (error) {
    throw new Error(`Failed to fetch transaction info from TronGrid: ${error.message}`)
  }
}

function calculateGasFee(cost) {
  const netFee = cost.net_fee || 0
  const memoFee = cost.memoFee || 0
  const accountCreateFee = cost.account_create_fee || 0
  const multiSignFee = cost.multi_sign_fee || 0
  return netFee + memoFee + accountCreateFee + multiSignFee
}

async function main() {
  const [sender, filePath, amount] = process.argv.slice(2)
  const privateKey = process.env.SENDER_PRIVATE_KEY // Load private key from environment variables

  if (!sender || !privateKey || !filePath || !amount) {
    console.error("Error: All arguments (sender, filePath, amount) and privateKey must be provided/set")
    return
  }

  const { default: TronWeb } = await import("tronweb")

  const tronWeb = new TronWeb({
    fullHost: process.env.TRON_FULL_HOST, // Load Tron host from environment variables
    privateKey,
  })

  try {
    const wallets = readWalletAddresses(filePath)
    console.log(`Wallet number is: ${wallets.length}. Here are the wallet addresses to transfer funds to: ${wallets.join(", ")}`)

    let transactions = []
    for (const receiver of wallets) {
      if (!receiver) {
        console.error(`Invalid wallet address: ${receiver}`)
        continue
      }

      const randomAmount = getRandomAmount(amount)

      // Perform the transfer
      try {
        const transaction = await tronWeb.trx.sendTransaction(receiver, tronWeb.toSun(randomAmount))
        // console.log(`Transaction: ${JSON.stringify(transaction, null, 2)}`);

        await sleep(5000) // Sleep for 5 seconds before making the next request

        let receipt
        receipt = await fetchTransactionInfoFromTronGrid(transaction.txid)
        if (!receipt || !receipt.contractRet) {
          throw new Error("No valid transaction info found on TronGrid")
        }
        // console.log("Transaction Receipt from TronGrid:", JSON.stringify(receipt, null, 2));

        const result = receipt.contractRet ? receipt.contractRet : "UNKNOWN"
        console.log(`Transaction result for ${receiver}: ${result}`)

        if (result !== "SUCCESS") {
          console.error(`Failed to transfer ${randomAmount} TRX to ${receiver}. Transaction hash: ${transaction.txid}`)
          throw new Error(`Transaction failed at ${receiver}, transaction hash: ${transaction.txid}`)
        }

        const gasFee = calculateGasFee(receipt.cost)

        console.log(`Transferred ${randomAmount} TRX to ${receiver}, TxHash: ${transaction.txid}`)
        transactions.push({
          timestamp: timestampToDatetime(receipt.timestamp),
          from: sender,
          to: receiver,
          randomAmount: randomAmount.toString(),
          transactionHash: transaction.txid,
          gasFee: tronWeb.fromSun(gasFee).toString(),
        })
      } catch (transferError) {
        console.error(`Failed to transfer ${randomAmount} TRX to ${receiver}. Error: ${transferError.message}`)
        break // Stop the loop if a transfer fails
      }
    }

    let format = "csv" // Default format is 'csv'
    if (format === "csv") {
      let content = "Timestamp,From,To,randomAmount,TransactionHash,GasFee\n"
      transactions.forEach(tx => {
        content += `"${tx.timestamp}","${tx.from}","${tx.to}","${tx.randomAmount}","${tx.transactionHash}","${tx.gasFee}"\n`
      })
      writeDataToFile("transfer-transactions", content, "csv") // Ensure proper filename for CSV
    } else {
      writeDataToFile("transfer-transactions", transactions, "json") // Ensure proper filename for JSON
    }
  } catch (error) {
    console.error(`Error: ${error.message}`)
  }
}

main().catch(console.error)
