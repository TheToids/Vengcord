const { EmbedBuilder, WebhookClient } = require('discord.js');
const { webhookId, webhookToken } = require('./config.json');
const fs = require('fs');

const webhookClient = new WebhookClient({ id: webhookId, token: webhookToken });

const embed = new EmbedBuilder()
	.setTitle('Blah')
	.setColor('#0099ff');
webhookClient.send({
	content: 'Webhook test',
	username: 'Vengienz Hiscores2replace',
	avatarURL: 'https://i.imgur.com/K0Bz4ZN.png',
	embeds: [embed],
})

const MSG_ID = webhookClient.id;
fs.writeFile('MSGID.txt', MSG_ID, (err) => {
    if (err) throw err;
    console.log('Data written to file');
});

