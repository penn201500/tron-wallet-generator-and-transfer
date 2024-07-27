const fs = require("fs")

// Function to format the current date and time as "YYYY-MM-DD_HH-MM-SS"
function getFormattedDateTime() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // Months are zero-indexed in JavaScript
  const day = now.getDate()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}_${hours.toString().padStart(2, "0")}-${minutes.toString().padStart(2, "0")}-${seconds.toString().padStart(2, "0")}`
}

// Function to write data to a file in CSV or JSON format
function writeDataToFile(prefix, data, format = "csv") {
  const filename = `${prefix}_${getFormattedDateTime()}.${format}`
  let content
  if (format === "csv") {
    content = data
  } else {
    // JSON format
    content = JSON.stringify(data, null, 2)
  }
  fs.writeFileSync(filename, content, "utf8")
  console.log(`Data saved to '${filename}'`)
}

module.exports = { getFormattedDateTime, writeDataToFile }
