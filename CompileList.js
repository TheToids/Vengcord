require('dotenv').config();
const fs = require('fs');
const { WOMClient, Metric } = require('@wise-old-man/utils');
const metricsList = require('./metrics.json');
const client = new WOMClient({
    apiKey: `${process.env.API_KEY}`,
    userAgent: 'Toids'
  });
const group_id = 1219;
const category = ["exp", "ehp", "ehb", "experience", "score", "kills"]
let embedsObject = {
    "embeds": {}
}
let playerCounter = 1;
let membersGlobal = [];

const initializeCSV = async () => {
    if (!membersGlobal.length) { // Check if the members data is not already fetched
        const csv = await client.groups.getMembersCSV(1219);
        membersGlobal = parseCSV(csv); // Store the result in the global variable
    }
    return membersGlobal;
};






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

function parseCSV(csvString) {
    const lines = csvString.split('\n');
    const result = [];

    lines.forEach((line, index) => {
        if (index > 0) { // Skip the header line
            const [player, role] = line.split(',');
            const playerObject = {};
            playerObject[player] = role;
            result.push(playerObject);
        }
    });
    return result;
}

function findParentObject(obj, targetKey) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key) && typeof obj[key] === 'object') {
            if (obj[key].hasOwnProperty(targetKey)) {
                return key; // This is the parent key
            }
        }
    }
    return null; // If the targetKey wasn't found in any object
}

function writeEmbeds(embedsObject) {
    const newData = JSON.stringify(embedsObject, null, 2);
    fs.writeFile('embeds.json', newData, 'utf8', (err) => {
        if (err) {
            console.error("Error writing to target file:", err);
        } else {
            console.log("Data written to target file successfully.");
        }
    });
}

const delay = ms => {
    console.log(`Starting delay for ${ms / 1000} seconds...`);
    return new Promise(resolve => {
        setTimeout(() => {
            console.log(`Finished delay of ${ms / 1000} seconds.`);
            resolve();
        }, ms);
    });
};

async function retryPromise(fn, maxRetries, delay) {
    let attempts = 0;

    while (attempts < maxRetries) {
        try {
            return await fn();
        } catch (error) {
            attempts++;
            console.log(`Attempt ${attempts}: Retrying in ${delay}ms...`);
            if (attempts === maxRetries) throw error;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

function getPlayerValue(metricsList, result, hiscore) {
    const metric = findParentObject(metricsList, result.additionalValue);
    let playerValue;

    switch (metric) {
        case 'exp':
            playerValue = hiscore.player.exp;
            break;
        case 'ehp':
            playerValue = hiscore.player.ehp;
            break;
        case 'ehb':
            playerValue = hiscore.player.ehb;
            break;
        case 'kills':
            playerValue = hiscore.data.kills;
            break;
        case 'activities':
            playerValue = hiscore.data.score;
            break;
        case 'skills':
            playerValue = hiscore.data.experience;
            break;
        default:
            playerValue = null; // Or any other default value you deem appropriate
    }
    return playerValue;
}

function addPlayer(embedsObject, metric, playerId, nameValue, xpValue, posValue, helmValue, roleValue) {
    if (!embedsObject.embeds[metric]) {
        embedsObject.embeds[metric] = {}; // If not, initialize it
    }
    embedsObject.embeds[metric][playerId] = {
        "nameValue": nameValue,
        "xpValue": xpValue,
        "posValue": posValue,
        "helmValue": helmValue,
        "roleValue": roleValue
    };
}

const getRole = async (playerName) => {
    try {
        const members = await initializeCSV();
        const member = await members.find(obj => obj.hasOwnProperty(playerName));
        const memberRole = member[playerName];
        return memberRole;
    } catch (error) {
        console.error('An error occurred:', error);
        return "Guest";
    }
}

const getHiscores = async (metric, retries = 10) => {
    try {
        const hiscores = await client.groups.getGroupHiscores(group_id, metric, { limit: 5 });
        return hiscores;
    } catch (error) {
        if (error.response && error.response.status === 429 && retries > 0) {
            console.log(`Rate limit exceeded for metric: ${metric}. Retrying after 61 seconds...`);
            await delay(61000); // Explicitly wait for 61 seconds
            console.log('Retrying now...');
            return getHiscores(metric, retries - 1); // Retry the request with one less retry
        } else if (retries === 0) {
            throw new Error(`Rate limit exceeded for metric: ${metric}. No more retries left.`);
        } else {
            throw error; // Rethrow other errors to be handled elsewhere
        }
    }
};

const iterate = async (obj, cat, metric = []) => {
    let playerCounter = 1; // Initialize playerCounter

    for (const [key, value] of Object.entries(obj[cat])) {
        const newMetric = metric.concat(key);
        if (typeof value === 'object' && value !== null) {
            try {
                const result = await retryPromise(() => getHiscores(`${newMetric.join('')}`).then(hiscores => ({ hiscores, additionalValue: newMetric.join('') })), 10, 61000);
                //console.log(JSON.stringify(hiscores, null, 2));
                // Process result here
                for (const hiscore of result.hiscores) {
                    if (playerCounter === 6) { playerCounter = 1; }
                    let playerId = `player${playerCounter}`; // Use let to declare playerId
                    const playerExperience = getPlayerValue(metricsList, result, hiscore);
                    const memberRole = await getRole(hiscore.player.displayName);
                    addPlayer(embedsObject, result.additionalValue, playerId, hiscore.player.displayName, playerExperience, hiscore.data.rank, hiscore.player.type, memberRole);
                    playerCounter++;
                }
                writeEmbeds(embedsObject);
            } catch (error) {
                console.error('Failed to get hiscores after retries:', error);
            }
        } else {
            console.log(`category: ${newMetric.join(' > ')}, key: ${key}, value: ${value}`);
        }
    }
};

const createHiscoreList = async () => {
    try {
        const data = await fs.promises.readFile('metrics.json', 'utf8');
        const sourceData = JSON.parse(data);
        for (const cat of Object.keys(sourceData)) {
            await iterate(sourceData, cat);
        }
    } catch (err) {
        console.error("Error reading from source file:", err);
    }
};
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




