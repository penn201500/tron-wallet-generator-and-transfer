const fs = require("fs");

// Function to format the current date and time as "YYYY-MM-DD_HH-MM-SS"
function getFormattedDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // Months are zero-indexed in JavaScript
  const day = now.getDate();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}_${hours.toString().padStart(2, "0")}-${minutes.toString().padStart(2, "0")}-${seconds.toString().padStart(2, "0")}`;
}

// Function to write data to a file in CSV or JSON format
function writeDataToFile(prefix, data, format = "csv") {
  const filename = `${prefix}_${getFormattedDateTime()}.${format}`;
  let content;
  if (format === "csv") {
    content = data;
  } else {
    // JSON format
    content = JSON.stringify(data, null, 2);
  }
  fs.writeFileSync(filename, content, "utf8");
  console.log(`Data saved to '${filename}'`);
}

// Function to read wallet addresses from a file (CSV or JSON)
function readWalletAddresses(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf8");
  if (filePath.endsWith('.json')) {
    const wallets = JSON.parse(fileContent);
    return wallets.map(wallet => wallet.address);
  } else if (filePath.endsWith('.csv')) {
    const records = parse(fileContent, {
      columns: false,
      skip_empty_lines: true
    });
    return records.map(record => record[0]);
  }
  throw new Error("Unsupported file format. Only JSON and CSV are supported.");
}

// Function to convert timestamp to datetime string
function timestampToDatetime(timestamp) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
}

// Function to get a random amount within a specified range
function getRandomAmount(amount) {
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount)) {
    throw new Error("Invalid amount provided.");
  }
  const minFactor = 0.8;
  const maxFactor = 1.0;
  const min = parsedAmount * minFactor;
  const max = parsedAmount * maxFactor;
  return (Math.random() * (max - min) + min).toFixed(2);
}

module.exports = { getFormattedDateTime, writeDataToFile, readWalletAddresses, timestampToDatetime, getRandomAmount };
