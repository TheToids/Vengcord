const fs = require('fs');
const { WOMClient, Metric } = require('@wise-old-man/utils');
const metrics = require('./metrics.json');
const api_url = "https://api.wiseoldman.net/v2/groups/1219/hiscores?metric="
const client = new WOMClient();
const group_id = 1219;
const category = ["exp", "ehp", "ehb", "experience", "score", "kills"]
let embedsObject = {
    "embeds": {}
}
let playerCounter = 1;



/*
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
    //console.log(sourceData.exp.overall.metric);
    // Convert the modified object back to a JSON string
    
    const newData = JSON.stringify(sourceData, null, 2);
  
    // Write the JSON string to the target file
    fs.writeFile('embeds.json', newData, 'utf8', (err) => {
      if (err) {
        console.error("Error writing to target file:", err);
      } else {
        console.log("Data written to target file successfully.");
      }
    });
    
});
*/
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function writeEmbeds(embedsObject){
    const newData = JSON.stringify(embedsObject, null, 2);
    fs.writeFile('embeds.json', newData, 'utf8', (err) => {
        if (err) {
          console.error("Error writing to target file:", err);
        } else {
          console.log("Data written to target file successfully.");
        }
      });
}


function addPlayer(embedsObject, metric, playerId, nameValue, xpValue) {
    if (!embedsObject.embeds[metric]) {
        embedsObject.embeds[metric] = {}; // If not, initialize it
    }
    embedsObject.embeds[metric][playerId] = {
      "nameValue": nameValue,
      "xpValue": xpValue
    };
  }

const getHiscores = async (metric) => {
    try {
        const hiscores = await client.groups.getGroupHiscores(group_id, metric, { limit: 5 });
        return hiscores;
    } catch (error) {
        if (error.message.includes('RateLimitError')) {
            console.log(`Rate limit exceeded for metric: ${metric}. Retrying after 61 seconds...`);
            await delay(61000); // Wait for 61 seconds
            return getHiscores(metric); // Retry the request
        } else {
            throw error; // Rethrow other errors to be handled elsewhere
        }
    }
};

const iterate = async (obj, metric = []) => {
    const promises = Object.entries(obj).map(async ([key, value]) => {
        const newMetric = metric.concat(key);
        if (typeof value === 'object' && value !== null) {
            // Wrap the getHiscores call in a new Promise that includes the additional value
            return new Promise((resolve, reject) => {
                getHiscores(`${newMetric.join('')}`)
                    .then(hiscores => resolve({ hiscores, additionalValue: newMetric.join('') }))
                    .catch(reject);
            });
        } else {
            console.log(`category: ${newMetric.join(' > ')}, key: ${key}, value: ${value}`);
        }
    });

    try {
        const allData = await Promise.allSettled(promises);
        allData.forEach((result) => {
            if (result.status === 'fulfilled') {
                result.value.hiscores.forEach((player) => {
                    if(playerCounter === 6) {playerCounter = 1;}
                    let playerId = `player${playerCounter}`; // Use let to declare playerId
                    const playerExperience = player.data.experience != null ? player.data.experience : player.data[category.find(cat => player.data[cat] != null)];
                    addPlayer(embedsObject, result.value.additionalValue, playerId, player.player.displayName, playerExperience);
                    playerCounter++;
                });
                writeEmbeds(embedsObject); // Moved outside of the forEach loop
            } else {
                console.error('A promise was rejected:', result.reason);
            }
        });
    } catch (error) {
        console.error('Error with promises:', error);
    }
};



const createHiscoreList = async () => {
    fs.readFile('metrics.json', 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading from source file:", err);
            return;
        }
        const sourceData = JSON.parse(data);
        iterate(sourceData.activities);
        
    });
}
createHiscoreList();

/*
sourceData.exp.forEach(metObj => {
    console.log("break 3");
    getHiscores(metObj.overall.metric).then(data => {
        console.log("break 4");
        data.forEach(player => {
            console.log(`Display Name: ${player.player.displayName}`);
            console.log(`Type: ${player.player.type}`);
            console.log(`Experience: ${player.data.experience}`);
        });
    }).catch(error => { console.error('error:', error); });
});
*/

/*
getHiscores().then(data => {
    data.forEach(player => {
        console.log(`Display Name: ${player.player.displayName}`);
        console.log(`Type: ${player.player.type}`);
        console.log(`Experience: ${player.data.experience}`);
    });
}).catch(error => { console.error('error:', error); });
*/


// Example usage with .then() to handle the resolved promise
/*getHiscores().then(data => {
  console.log(JSON.stringify(data, null, 2)); // Log the data as a JSON string
}).catch(error => {
  console.error('There has been a problem with your fetch operation:', error);
});*/




