const fs = require('fs');

// Read the source JSON file
fs.readFile('metrics.json', 'utf8', (err, data) => {
  if (err) {
    console.error("Error reading from source file:", err);
    return;
  }

  // Parse the data from string to an object
  const sourceData = JSON.parse(data);

  // Modify the data as needed
  // For example, you can add a new property:
  // sourceData.newProperty = "New Value";

  // Convert the modified object back to a JSON string
console.log(sourceData.exp.overall);
  const newData = JSON.stringify(sourceData, null, 2);
  /*
  // Write the JSON string to the target file
  fs.writeFile('embeds.json', newData, 'utf8', (err) => {
    if (err) {
      console.error("Error writing to target file:", err);
    } else {
      console.log("Data written to target file successfully.");
    }
  });
  */
});
