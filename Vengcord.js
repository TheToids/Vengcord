const { EmbedBuilder, WebhookClient } = require('discord.js');
const config = require('./config.json');
const embedsHS = require('./embeds.json');
const metricsList = require('./metrics.json');
const getWebhookIdAndTokenFromLink = (link) => {
  const regex = /https:\/\/discord\.com\/api\/webhooks\/(\d+)\/([\w-]+)/;
  const matches = link.match(regex);
  return matches ? { id: matches[1], token: matches[2] } : null;
};
const getChannelIdFromLink = (link) => {
  const regex = /https:\/\/discord\.com\/channels\/\d+\/\d+\/(\d+)/;
  const matches = link.match(regex);
  return matches ? matches[1] : null;
};
const webhookDetails = getWebhookIdAndTokenFromLink(config.webhookUrl);
const channelId = getChannelIdFromLink(config.previousMessageUrl);
const webhookClient = new WebhookClient({ id: webhookDetails.id, token: webhookDetails.token });

function replaceTitle(metric) { //clue scrolls all
  let icon = metricsList.activities[metric].icon;
  let cat = findParentObject(metricsList, metric);
  return `**${icon} ${metricsList[cat][metric].display} ${icon}**`;
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

const embeds = Object.keys(embedsHS.embeds).flatMap(metric => {
  let metricEmbeds = []; // Array to hold the embeds for this metric
  const playerEntries = Object.entries(embedsHS.embeds[metric]); // Entries for the players

  for (let i = 0; i < playerEntries.length; i += 5) {
    const playerChunk = playerEntries.slice(i, i + 5); // Next 5 players
    const nameValues = playerChunk.map(([key, players]) => players.nameValue).join('\n');
    const xpValues = playerChunk.map(([key, players]) => players.xpValue).join('\n');

    const embed = new EmbedBuilder()
      .addFields(
        { name: replaceTitle(metric), value: `${"".padEnd(41, `=`)}`, inline: false },
        { name: nameValues, value: '\u200B', inline: true },
        { name: '\u200B', value: '\u200B', inline: true },
        { name: xpValues, value: '\u200B', inline: true }
        // Removed the third inline field with zero-width space
      );
    metricEmbeds.push(embed); // Add the embed to the array
  }
  return metricEmbeds;
});

// Send the embeds in batches of 10 to avoid exceeding the limit
const createEmbedBatch = async () => {
  for (let i = 0; i < embeds.length; i += 10) {
    const embedBatch = embeds.slice(i, i + 10);
    sendWebhook(embedBatch);
    //message.channel.send({ embeds: embedBatch });
  }
}

// Function to send a new webhook message with an embed
const sendWebhook = async (embeds) => {
  try {
    await webhookClient.send({
      username: 'Vengienz Hiscores',
      avatarURL: 'https://i.imgur.com/K0Bz4ZN.png',
      embeds: embeds
    });
    console.log('Embed sent successfully');
  } catch (error) {
    console.error('Error sending embed:', error);
  }
};

// Function to update an existing webhook message with an embed
const updateWebhook = async () => {
  try {
    await webhookClient.editMessage(channelId, {
      username: 'Vengienz Hiscores',
      avatarURL: 'https://i.imgur.com/K0Bz4ZN.png',
      embeds: [embed2]
    });
    console.log('Embed updated successfully');
  } catch (error) {
    // If updating fails, send a new message
    if (error.response && error.response.status === 404) {
      console.log('Previous message not found, sending a new embed.');
      await sendWebhook();
    } else {
      console.error('Error updating embed:', error);
    }
  }
};

// Call the updateWebhook function to attempt to update the previous message
//updateWebhook();
//sendWebhook();
createEmbedBatch();
