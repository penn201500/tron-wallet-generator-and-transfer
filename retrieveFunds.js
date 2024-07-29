require("dotenv").config()
const axios = require("axios")
const TronWeb = require("tronweb")
const { readWalletsWithPrivateKeys, writeDataToFile, timestampToDatetime } = require("./utils")

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchTransactionInfoFromTronGrid(txid) {
  const tronGridEndpoint = `${process.env.TRONSCAN_QUERY_API}${txid}`
  console.log(`Fetching transaction info from: ${tronGridEndpoint}`)

  try {
    const response = await axios.get(tronGridEndpoint)
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

async function estimateTransactionFee(tronWeb, from, to, amount) {
  try {
    const transaction = await tronWeb.transactionBuilder.sendTrx(to, amount, from)
    const unsignedTransaction = await tronWeb.trx.sign(transaction, tronWeb.defaultPrivateKey)
    const { result, txid } = await tronWeb.trx.broadcast(unsignedTransaction)

    if (!result) {
      throw new Error("Failed to estimate transaction fee.")
    }

    await sleep(5000) // Wait for transaction info to be available

    const receipt = await fetchTransactionInfoFromTronGrid(txid)

    const gasFee = calculateGasFee(receipt.cost)
    return { gasFee, transactionHash: txid }
  } catch (error) {
    throw new Error(`Failed to estimate transaction fee: ${error.message}`)
  }
}

async function main() {
  const [filePath, recipient] = process.argv.slice(2)

  if (!filePath || !recipient) {
    console.error("Error: Both file path and recipient address must be provided")
    return
  }

  try {
    const wallets = readWalletsWithPrivateKeys(filePath)
    console.log(`Number of wallets to retrieve funds from: ${wallets.length}`)

    let transactions = []
    for (const wallet of wallets) {
      if (!wallet.privateKey) {
        console.error(`Invalid wallet: ${JSON.stringify(wallet)}`)
        continue
      }

      const tronWeb = new TronWeb({
        fullHost: process.env.TRON_FULL_HOST,
        privateKey: wallet.privateKey,
      })

      try {
        const balance = await tronWeb.trx.getBalance(wallet.address)
        if (balance <= 0) {
          console.log(`No funds to retrieve from wallet: ${wallet.address}`)
          continue
        }

        const { gasFee, transactionHash } = await estimateTransactionFee(tronWeb, wallet.address, recipient, balance)

        const transactionAmount = balance - gasFee
        if (transactionAmount <= 0) {
          console.log(`Insufficient funds to cover the fee from ${wallet.address}`)
          continue
        }

        // Use the transactionHash from the estimateTransactionFee function
        const receipt = await fetchTransactionInfoFromTronGrid(transactionHash)
        if (!receipt || !receipt.contractRet) {
          throw new Error("No valid transaction info found on TronGrid")
        }

        const result = receipt.contractRet ? receipt.contractRet : "UNKNOWN"
        console.log(`Transaction result for ${wallet.address}: ${result}`)

        if (result !== "SUCCESS") {
          console.error(`Failed to retrieve funds from ${wallet.address}. Transaction hash: ${transactionHash}`)
          throw new Error(`Transaction failed at ${wallet.address}, transaction hash: ${transactionHash}`)
        }

        const finalGasFee = calculateGasFee(receipt.cost)

        console.log(`Retrieved ${tronWeb.fromSun(transactionAmount)} TRX from ${wallet.address} to ${recipient}, TxHash: ${transactionHash}`)
        transactions.push({
          timestamp: timestampToDatetime(receipt.timestamp),
          from: wallet.address,
          to: recipient,
          amount: tronWeb.fromSun(transactionAmount).toString(),
          transactionHash,
          gasFee: tronWeb.fromSun(finalGasFee).toString(),
        })

        await sleep(5000) // Sleep for 5 seconds before making the next request
      } catch (transferError) {
        console.error(`Failed to retrieve funds from ${wallet.address}. Error: ${transferError.message}`)
      }
    }

    let content = "Timestamp,From,To,Amount,TransactionHash,GasFee\n"
    transactions.forEach(tx => {
      content += `"${tx.timestamp}","${tx.from}","${tx.to}","${tx.amount}","${tx.transactionHash}","${tx.gasFee}"\n`
    })
    writeDataToFile("retrieve-transactions", content, "csv")
  } catch (error) {
    console.error(`Error: ${error.message}`)
  }
}

main().catch(console.error)
