const imageExport = require('./images.js');
const { EmbedBuilder, WebhookClient, AttachmentBuilder } = require('discord.js');
const path = require('path');
const config = require('./config.json');
const embedsHS = require('./embeds.json');
const metricsList = require('./metrics.json');
const various = require('./various.json');
const petOwnerPath = path.join(__dirname, 'VengIcons/');
const axios = require('axios');
const fs = require('fs');
const { WOMClient, Metric } = require('@wise-old-man/utils');
const client = new WOMClient({
  apiKey: `${process.env.API_KEY}`,
  userAgent: 'Toids'
});
const group_id = 1219;
let membersGlobal = [];
let embedFiles = [];
let embedsPet = [];
const now = new Date();
const getWebhookIdAndTokenFromLink = (link) => {
  const regex = /https:\/\/discord\.com\/api\/webhooks\/(\d+)\/([\w-]+)/;
  const matches = link.match(regex);
  return matches ? { id: matches[1], token: matches[2] } : null;
};
require('dotenv').config(); //process.env.WEBHOOK_URL
/*const getChannelIdFromLink = (link) => {
  const regex = /https:\/\/discord\.com\/channels\/\d+\/\d+\/(\d+)/;
  const matches = link.match(regex);
  return matches ? matches[1] : null;
};*/
const webhookDetails = getWebhookIdAndTokenFromLink(config.webhookUrl);
//const channelId = getChannelIdFromLink(config.previousMessageUrl);
const webhookClient = new WebhookClient({ id: webhookDetails.id, token: webhookDetails.token });
const petChamps = {
  'KaiserBruno': { 'amt': 0, 'iconspt1': '', 'type': '', 'role': '' },
  'King Slime': { 'amt': 0, 'iconspt1': '', 'type': '', 'role': '' },
  'Agv': { 'amt': 0, 'iconspt1': '', 'type': '', 'role': '' },
  'Gunzyx': { 'amt': 0, 'iconspt1': '', 'type': '', 'role': '' },
};
const petExtra = {
  'SuperVegeto': {
    'amt': 23,
    'type': '',
    'iconspt1':
      '<:chaos_ele:866763740363751454> <:supreme:866763968684883989> <:bandos:866764320616218684> <:mole:733540186448986202> <:Princeblackdragon:1215383753141264474> <:thermy:866782001998200852> <:kraken:866764439045799986> <:Petsnakeling:1215147932710338590> <:Chompychick:1215147927249485925> <:jad:866782063793143848> <:cerb:866763694015512667> <:Heron:1215147931712102412>',
    'iconspt2':
      '<:Rockgolem:1215147934774206484> <:Beaver:1215147925705982003> <:Riftguardian:1215385270640181289> <:Rockgolem:1215147934774206484> <:CoX:866763706397098014> <:skotizo:866764695351984158> <:vork:866782101034631179> <:ToB:866764781745864704> <:Ikklehydra:1215241396600963132> <:sarachnis:866764650851074049> <:Nex:932108512316751903>',
    'role': '<:Quester:1031783180996456448>'
  }
}
const usernameClog = {
  'KaiserBruno': { 'amt': 0, 'type': '', 'role': '', 'rank': '' },
  'C4ron': { 'amt': 0, 'type': '', 'role': '', 'rank': '' },
  'I am Donuts': { 'amt': 0, 'type': '', 'role': '', 'rank': '' },
  'SquanUK': { 'amt': 0, 'type': '', 'role': '', 'rank': '' },
  'its the game': { 'amt': 0, 'type': '', 'role': '', 'rank': '' },
  'nicnad': { 'amt': 0, 'type': '', 'role': '', 'rank': '' },
  'Rokkenjima': { 'amt': 0, 'type': '', 'role': '', 'rank': '' },
  'Farigno': { 'amt': 0, 'type': '', 'role': '', 'rank': '' },
  'K1ERZ': { 'amt': 0, 'type': '', 'role': '', 'rank': '' },
}
const usernameClogXtra =
  { 'osleeb': { 'amt': 982, 'type': '', 'role': '<:Completionist:1031783172670754898>', 'rank': '' } }


const initializeCSV = async () => {
  if (!membersGlobal.length) { // Check if the members data is not already fetched
    const csv = await client.groups.getMembersCSV(1219);
    membersGlobal = parseCSV(csv); // Store the result in the global variable
  }
  return membersGlobal;
};

function parseCSV(csvString) {
  const lines = csvString.split('\n');
  const result = [];

  lines.forEach((line, index) => {
    if (index > 0) { // Skip the header line
      let [player, role] = line.split(',');
      player = player.toLowerCase();
      const playerObject = {};
      playerObject[player.trim()] = role.trim(); // Trim spaces and store the role
      playerObject[player] = role;
      result.push(playerObject);
    }
  });
  return result;
}
const getRole = async (playerName) => {
  try {
    const members = await initializeCSV();
    const member = await members.find(obj => obj.hasOwnProperty(playerName.toLowerCase()));
    //console.log(member[playerName])
    const memberRole = member[playerName.toLowerCase()];
    return memberRole;
  } catch (error) {
    console.error('An error occurred:', error);
    return "guest";
  }
}

const collectUserDataUpdateClog = async (clogName = false, petName = false) => {
  try {
    const url = clogName ? `https://api.collectionlog.net/collectionlog/user/${clogName}` : `https://api.collectionlog.net/collectionlog/user/${petName}`;
    const urlRank = clogName ? `https://api.collectionlog.net/hiscores/ranks/${clogName}` : false;
    let petCount = 0;
    let iconCount = 1;
    let part = 1;
    let property = `iconspt${part}`;
    const response = await axios.get(url);
    const responseRank = clogName ? await axios.get(urlRank) : false;
    //clogName ? console.log(responseRank.data.accountTypeRanks.ALL) : false;

    //clogName ? console.log(JSON.stringify(responseRank, replacerFunc(), 2)) : console.log("clogname = false");
    const roleList = Object.entries(various.role_icons);
    const roleListObject = Object.fromEntries(roleList); //`${roleListObject[usernameClog[displayName].role]}\n`
    const helmList = Object.entries(various.titles);
    const helmListObject = Object.fromEntries(helmList);

    const displayName = response.data.collectionLog.username;
    //const displayNameLow = displayNameUp.toLowerCase();
    const typeData = response.data.collectionLog.accountType;
    const accountType = helmListObject[typeData.toLowerCase()];
    //return console.log(typeData.toLowerCase(), JSON.stringify(helmListObject, null, 2));
    const uniqueObtained = response.data.collectionLog.uniqueObtained;
    const uniqueItems = response.data.collectionLog.uniqueItems;
    const allPets = response.data.collectionLog.tabs.Other['All Pets'];
    //const parsedResponseRank = clogName ? JSON.parse(responseRank) : false;
    //const rank = clogName ? parsedResponseRank.accountTypeRanks.ALL : false;
    const rank = clogName ? responseRank.data.accountTypeRanks.ALL : false;
    //clogName? console.log(rank) : console.log("false");
    const roleF = await getRole(displayName.toLowerCase());
    const role = `${roleListObject[roleF]}`
    //console.log(role)
    //console.log(role, "test");
    //petName ? petChamps[displayName].role = role : false;
    clogName ? usernameClog[displayName].role = role : false;
    clogName && rank ? usernameClog[displayName].rank = rank : false;
    /*
    const getIcon = async (petId) => {
      let icon = various.pet_icons[petId];
      return icon;
    }
    */
    for (const pet in allPets.items) {
      if (allPets.items[pet].obtained) {
        const petId = allPets.items[pet].id;
        petCount++;
      }
    }
    /*
    async function appendIcon(petChamps, displayName, petId) {
      const icon = await getIcon(petId);


      if (iconCount > 12) {
        part++;
        property = `iconspt${part}`;
        iconCount = 1;
        typeof (petChamps[displayName][property]) === 'undefined' && clogName === false ? petChamps[displayName][property] = '' : false;
      }

      petChamps[displayName][property] += `${icon} `;

      iconCount++;
    }
    */
    //petName ? await appendIcon(petChamps, displayName, petId) : false;
    //console.log(property, petChamps[displayName][property])

    clogName ? usernameClog[displayName].amt = uniqueObtained : petChamps[displayName].amt = petCount;
    clogName ? usernameClog[displayName].type = accountType : false;//petChamps[displayName].type = accountType;
    //petName ? console.log(property, petChamps[displayName][property]) : false;
    //petName ? console.log(JSON.stringify(petChamps, null, 2)) : false;
  } catch (error) {
    console.error(error);
  }
}

const collectAllUserData = async () => {
  for (const key of Object.keys(usernameClog)) {
    await collectUserDataUpdateClog(key, false);
  }
  for (const key of Object.keys(petChamps)) {
    await collectUserDataUpdateClog(false, key);
  }
  for (const key of Object.keys(usernameClogXtra)) {
    usernameClog[key] = usernameClogXtra[key];
  }
  for (const key of Object.keys(petExtra)) {
    petChamps[key] = petExtra[key];
  }
  //console.log(JSON.stringify(petChamps, null, 2), JSON.stringify(petExtra, null, 2));
}


const sortAllData = async () => {
  await collectAllUserData();
  let itemsClog = Object.keys(usernameClog).map(key => {
    //console.log('Key:', key, 'Value:', usernameClog[key]); // Add this to debug
    return { name: key, ...usernameClog[key] };
  });
  let itemsPet = Object.keys(petChamps).map(key => {
    return { name: key, ...petChamps[key] };
  });
  itemsClog.sort((a, b) => {
    if (b.amt === a.amt) {
      return a.name.localeCompare(b.name);
    }
    return b.amt - a.amt;
  });
  itemsPet.sort((a, b) => {
    if (b.amt === a.amt) {
      return a.name.localeCompare(b.name);
    }
    return b.amt - a.amt;
  });
  //console.log(JSON.stringify(itemsPet, null, 2));
  //console.log(JSON.stringify(itemsPet, null, 2));
  return [itemsClog, itemsPet];
}


function compareString(original, lowered) {
  //change original objcs back to player case
  //implement changes 
  return original.toLowerCase() === lowered.toLowerCase() ? original : false;
}

const clogAndPetEmbedBuilder = async () => {
  imageExport();
  const clogAndPet = await sortAllData();
  const clog = clogAndPet[0];
  //return console.log(clog[0].name);
  const pet = clogAndPet[1];
  //return console.log(JSON.stringify(pet, null, 2),JSON.stringify(pet, null, 2));

  function formatDateWithSuffix(date) {
    const day = date.getDate();
    const month = date.getMonth(); // getMonth() is zero-indexed
    const year = date.getFullYear();
    let suffix = 'th';

    // Determine the correct suffix for the day
    if (day % 10 === 1 && day !== 11) {
      suffix = 'st';
    } else if (day % 10 === 2 && day !== 12) {
      suffix = 'nd';
    } else if (day % 10 === 3 && day !== 13) {
      suffix = 'rd';
    }
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    // Return the formatted date string
    return `${day}${suffix} of ${months[month]}, ${year}`;
  }



  let top10role = '';
  let top10rank = '';
  let top10Names = '';
  let top10Values = '';
  let embeds = [];
  let helm = '';
  //for (const [key, value] of Object.entries(clog)) {
  for (const key in clog) {
    helm = clog[key].type;
    top10role = clog[key].role;
    top10Names += `${top10role} ${clog[key].name}\n`;
    top10Values += `${clog[key].amt}\n`;
    top10rank += `${clog[key].rank}${helm}\n`
  }
  const clogEmbed = new EmbedBuilder()
    .addFields(
      { name: various.titles.top10, value: `${"".padEnd(30, '🔹')}`, inline: false },
      { name: "Community Member", value: top10Names, inline: true },
      { name: "Uniques", value: top10Values, inline: true },
      { name: "Rank", value: top10rank, inline: true }
    );
  embeds.push({ "top10": clogEmbed })
  //console.log(JSON.stringify(clogEmbed, null, 2));
  let petRank = 1;
  /////////////////////////////////////
  /*
  for (const key in pet) {
    helm = pet[key].type;
    const petOwner = pet[key].name;
    //console.log(petOwner)
    const petOwnerAmt = pet[key].amt;
    //const petOwnerIcons = pet[key].icons;
    
    let petOwnerPtField = [];
    for (let i = 1; i < Object.keys(pet[key]).length - 3; i++) {
      petOwnerPtField.push({ name: '\u200b', value: `${pet[key][`iconspt${i}`]}`, inline: false });
    }
    
    const petEmbed = new EmbedBuilder()
      .addFields(
        { name: `${petRank}. ${petChamps[petOwner].role}${petOwner} - ${petOwnerAmt.toString()} ${helm}`, value: `${"".padEnd(30, '🔹')}`, inline: false },
        ...petOwnerPtField
      );
    embeds.push({ [petOwner]: petEmbed })
    petRank++;
  }*/

  for (const key in pet) {
    const petOwnerName = pet[key].name;
    //console.log(testcounter++)
    const imageName = path.join(petOwnerPath, `${petOwnerName}.png`);
    const file = new AttachmentBuilder(imageName);
    embedFiles.push({ [petOwnerName]: file });
  }
  //console.log(imageName);
  /*const petEmbed = new EmbedBuilder()
    .setImage(`attachment://${encodeURI(petOwnerName)}.png`);
  embedsPet.push({ [petOwnerName]: petEmbed });*/
  //return console.log(JSON.stringify(embeds, null, 2));

  //<@358710615923097600>
  const dateEmbed = new EmbedBuilder()
    .addFields(
      { name: `${"".padEnd(30, '🔹')}`, value: `Message <@358710615923097600> to be added to collection\n log or pet hiscores`, inline: false },
      { name: `${formatDateWithSuffix(now)}`, value: `${"".padEnd(30, '🔹')}`, inline: false },
    );
  embeds.push({ "Date": dateEmbed })

  //console.log(JSON.stringify(embeds, null, 2));
  return [embeds, embedFiles]; // Return the embeds array instead of logging it
}
//return clogAndPetEmbedBuilder();

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

function replaceTitle(metric) { //clue scrolls all

  let cat = findParentObject(metricsList, metric);
  let icon = metricsList[cat][metric].icon;
  return `**${icon} ${metricsList[cat][metric].display} ${icon}**`;
}

function formatXpValue(xpValue) {
  if (xpValue >= 1000000000) {
    return (xpValue / 1000000000).toFixed(3) + 'b';
  } else if (xpValue >= 1000000) {
    return (Math.floor(xpValue / 1000000)) + 'm';
  }
  // Add more conditions if you want to handle other cases (e.g., thousands)
  return Math.floor(xpValue).toString();
}

// Function to send a new webhook message with an embed
const sendWebhook = async (embeds) => {
  const delay = (duration) => new Promise(resolve => setTimeout(resolve, duration));

  const attemptToSend = async (embeds, retries = 10) => {
    try {
      const message = await webhookClient.send({
        username: 'Vengienz Hiscores',
        avatarURL: 'https://i.imgur.com/K0Bz4ZN.png',
        embeds: [embeds]
      });
      //console.log('Embed sent successfully');
      return message;
    } catch (error) {
      if (error.code === 429 && retries > 0) { // Discord rate limit error code
        console.error('Rate limited. Waiting to retry...');
        const retryAfter = error.response?.headers?.['retry-after'] * 1000 || 10000; // Use the `retry-after` header or default to 10 seconds
        await delay(retryAfter);
        return attemptToSend(embeds, retries - 1);
      } else {
        console.error('Error sending embed:', error);
        return null;
      }
    }
  };

  return attemptToSend(embeds);
};

const sendWebhookForPets = async (attachment) => {
  //console.log(attachment)
  const delay = (duration) => new Promise(resolve => setTimeout(resolve, duration));
  //console.log(`${name} in sendWebhookForPets\n${JSON.stringify(embedFiles[name], null, 2)}`)
  const attemptToSend = async (attachment, retries = 10) => {
    try {
      const message = await webhookClient.send({
        username: 'Vengienz Hiscores',
        avatarURL: 'https://i.imgur.com/K0Bz4ZN.png',
        files: [attachment]
      });
      //console.log('Embed sent successfully');
      return message;
    } catch (error) {
      if (error.code === 429 && retries > 0) { // Discord rate limit error code
        console.error('Rate limited. Waiting to retry...');
        const retryAfter = error.response?.headers?.['retry-after'] * 1000 || 10000; // Use the `retry-after` header or default to 10 seconds
        await delay(retryAfter);
        return attemptToSend(attachment, retries - 1);
      } else {
        console.error('Error sending embed:', error);
        return null;
      }
    }
  };

  return attemptToSend(attachment);
};


const writeEmbedMessageIdsToJson = async (messageIds) => {
  // Write the updated array of message IDs back to the file
  fs.writeFile('embedMessageIds.json', JSON.stringify(messageIds, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing to JSON file:', err);
    } else {
      console.log('Successfully appended message ID key-value pairs to JSON file');
    }
  });
}


function quantityString(metrics) {
  let quantity;
  let metric = findParentObject(metricsList, metrics);

  switch (metric) {
    case "exp":
      quantity = "XP";
      break;
    case "skills":
      quantity = "XP";
      break;
    case "activities":
      quantity = "Score";
      break;
    case "kills":
      quantity = "KC";
      break;
    case "ehp":
      quantity = "Time";
      break;
    case "ehb":
      quantity = "Time";
      break;
    default:
      quantity = "Test";
  }
  return quantity;
}

const createEmbedBatch = async () => {
  const embeds = Object.keys(embedsHS.embeds).flatMap(metric => {
    let metricEmbeds = []; // Array to hold the embed for this metric
    const playerEntries = Object.entries(embedsHS.embeds[metric]);
    const roleList = Object.entries(various.role_icons);
    const roleListObject = Object.fromEntries(roleList);
    const helmList = Object.entries(various.titles);
    const helmListObject = Object.fromEntries(helmList);

    for (let i = 0; i < playerEntries.length; i += 5) {
      const playerChunk = playerEntries.slice(i, i + 5); // Next 5 players
      const nameValues = playerChunk.map(([key, players]) => `${roleListObject[players.roleValue]} ${players.nameValue}`
      ).join('\n');
      const xpValues = playerChunk.map(([key, players]) => players.xpValue === 200000000 ? `${formatXpValue(players.xpValue)} :star2:` : formatXpValue(players.xpValue)
      ).join('\n');
      const posValues = playerChunk.map(([key, players]) => `${players.posValue} ${helmListObject[players.helmValue]}`).join('\n');
      const embed = new EmbedBuilder()
        .addFields(
          { name: replaceTitle(metric), value: `${"".padEnd(30, '🔹')}`, inline: false },
          { name: 'Community Member', value: `${nameValues}`, inline: true },
          { name: quantityString(metric), value: `${xpValues}`, inline: true },
          { name: 'Rank', value: `${posValues}`, inline: true }
        );
      metricEmbeds.push({ [metric]: embed });
    }
    return metricEmbeds;
  });
  const embedsFields = embeds.map(e => Object.values(e)[0]);
  const embedsMetrics = embeds.map(e => Object.keys(e)[0]);

  return embeds;
}
const initializeEmbeds = async () => {
  const embeds = await createEmbedBatch();
  const embedsAndFiles = await clogAndPetEmbedBuilder();
  const embeds2 = embedsAndFiles[0];
  const embedFiles = embedsAndFiles[1];

  const combinedEmbeds = embeds.concat(embeds2);
  const combinedFields = combinedEmbeds.map(e => Object.values(e)[0]);
  const combinedMetrics = combinedEmbeds.map(e => Object.keys(e)[0]);
  let messageIds = {};

  for (let i = 0; i < combinedFields.length; i++) {
    //console.log(combinedFields.length)
    const metric = combinedMetrics[i];
    const embed = combinedFields[i];
    const message = await sendWebhook(embed);

    if (message && message.id) {
      const messageId = message.id;
      messageIds[metric] = { "id": messageId };
    }

    if (metric === 'zulrah') { //insert after zulrah
      for (let obj of embedFiles) {
        for (let nameKey in obj) {
          let attachmentValue = obj[nameKey]
          //console.log(attachmentValue)
          const messagePets = await sendWebhookForPets(attachmentValue);
          messageIds[nameKey] = { "id": messagePets.id };
        }
      }
    }
  }

  await writeEmbedMessageIdsToJson(messageIds);
}

const updateEmbeds = async (msgid, embed) => {
  try {
    await webhookClient.editMessage(msgid, { embeds: [embed] }); // embeds should be an array
    //console.log('Embed edited successfully');
  } catch (error) {
    console.error('Error editing embed:', error);
  }
};


const updateEmbedsForPets = async (msgid, attachment) => {
  try {
    await webhookClient.editMessage(msgid, { embeds: [], files: [attachment] }); // embeds should be an array
    //console.log('Embed edited successfully');
  } catch (error) {
    console.error('Error editing embed:', error);
  }
};

const updateAllEmbeds = async () => {
  try {
    const embedsAndFiles = await clogAndPetEmbedBuilder();
    const embeds2 = embedsAndFiles[0]
    const embeds = await createEmbedBatch();
    let embedFiles = embedsAndFiles[1]

    const combinedEmbeds = embeds.concat(embeds2);
    const combinedFields = combinedEmbeds.map(e => Object.values(e)[0]);
    const combinedMetrics = combinedEmbeds.map(e => Object.keys(e)[0]);

    //console.log(JSON.stringify(combinedFlattenedEmbedsFields, null, 2));
    const data = await fs.promises.readFile('embedMessageIds.json', 'utf8');
    const embedIds = JSON.parse(data);
    const updatePromises = [];
    //return console.log(JSON.stringify(embedFiles, null, 2));
    console.log('starting update of pets')
    for (const key in embedFiles) {
      const nameKey = Object.keys(embedFiles[key])[0]; //prints KaiserBruno
      //return console.log(embMsgId, JSON.stringify(embedFiles, null, 2));
      updatePromises.push(updateEmbedsForPets(embedIds[nameKey].id, embedFiles[key][nameKey]));
      console.log(embedFiles[key][nameKey]);
    }

    for (let i = 0; i < combinedFields.length; i++) {
      const embed = combinedFields[i]; // field
      const metric = combinedMetrics[i]; // metric to check on msgid.json
      //console.log(combinedMetrics, metric);
      const id = embedIds[metric].id; //id from msgid.json
      updatePromises.push(updateEmbeds(id, embed));
    }

    /*
    for (const [key, msgIds] of Object.entries(embedIds)) {
      console.log(`Processing message IDs for key: ${key}`);
      for (const [metric, id] of Object.entries(msgIds)) {
        const embed = combinedFields[key];
        //const embed2 = embedsFields2[key];
        //console.log(JSON.stringify(embed, null, 2), JSON.stringify(embed2, null, 2));
        //console.log(JSON.stringify(embed));
        //console.log(`Finding embed field for metric: ${metric}`);
        if (embed) {
          console.log(`Found embed field for metric: ${metric}, updating message ID: ${id}`);
          updatePromises.push(updateEmbeds(id, embed));
        } else {
          console.log(`No embed field found for metric: ${metric}, skipping message ID: ${id}`);
        }
      }
    }*/

    console.log('Waiting for all embeds to update...');
    await Promise.all(updatePromises);
    console.log('All embeds updated successfully');

  } catch (error) {
    console.error('Error updating embeds:', error);
  }
};


const testSendEmbed = async (name) => {
  try {
    let embedFiles = {};
    const embedsAndFiles = await clogAndPetEmbedBuilder();
    for (let obj of embedsAndFiles[1]) {
      obj[name] ? embedFiles = obj[name] : false;
    }
    console.log(embedFiles)
    const message = await webhookClient.send({
      username: 'Vengienz Hiscores',
      avatarURL: 'https://i.imgur.com/K0Bz4ZN.png',
      files: [embedFiles]
    });
    return
  } catch (error) {
    console.error(error);
  }

}



const updateEmbedsFile = async (msgid) => {
  try {
    const imageName = path.join(petOwnerPath, `Toids.png`);
    console.log(imageName)
    const file = new AttachmentBuilder(imageName);
    await webhookClient.editMessage(msgid, { files: [file] }); // embeds should be an array
    //console.log('Embed edited successfully');
  } catch (error) {
    console.error('Error editing embed:', error);
  }
};

//updateEmbedsFile('1245441616047640576')
//initializeEmbeds();
updateAllEmbeds();

//potentially automating ship function to run 1st of month
//fix pets
//add clog ranks, different api call
//overal xp in bills

//updateEmbeds('1243399742470492311', testEmbed);

