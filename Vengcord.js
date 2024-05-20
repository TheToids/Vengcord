const { EmbedBuilder, WebhookClient } = require('discord.js');
const config = require('./config.json');
const embedsHS = require('./embeds.json');
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


const embed2 = new EmbedBuilder()
  .setTitle('<:slime:1049235206105735168> Updated <:slime:1049235206105735168>')
  .setDescription('<:slime:1049235206105735168> Updated content here <:slime:1049235206105735168>')
  .setColor(0x2F3136); // You can set the color as you like
  
/*const embeds = embedsHS.embeds.map(embedData => {
  const embed = new EmbedBuilder()
    .setTitle(embedData.metric)
    .setDescription('test')
    // Map each fieldData into two separate fields
    .addFields(embedData.fields.flatMap(fieldData => [
      { name: '\u200B', value: fieldData.nameValue, inline: true },
      { name: '\u200B', value: fieldData.xpValue, inline: true },
      { name: '\u200B', value: '\u200B', inline: true }
    ]));
    return embed;
  })*/
//`**${embedData.metric}**`
  const embeds = embedsHS.embeds.map(embedData => {
    const embed = new EmbedBuilder()
      .addFields({
        name: `**${embedData.metric}**`,
        value: `${"".padEnd(20, `<>`)}`, 
        inline: false
      },
      {
        name: embedData.fields.map(fieldData => `${fieldData.nameValue}`).join('\n'),
        value: "\u200B", 
        inline: true
      },
      {
        name: embedData.fields.map(fieldData => `${fieldData.xpValue}`).join('\n'), 
        value: "\u200B", 
        inline: true
      },
      {
        name: "\u200B", 
        value: "\u200B", 
        inline: true
      });
    return embed;
  });



// Function to send a new webhook message with an embed
const sendWebhook = async () => {
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
sendWebhook();
