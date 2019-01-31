/*
	created by MasterPtato
	https://github.com/masterptato

	have fun with it
*/


let Discord = require('discord.js');
let sqlite = require('sqlite');
let util = require('util');
let fs = require('fs');
let moment = require('moment');
let glob = require('./globalVars.js');
let utilities = require('./utilities.js');

// enable console logging
let logging = false;

let client = new Discord.Client();
glob.client = client;

let botToken = "UR TOKEN HERE";
client.login(botToken);

//access the database
glob.database = {};
let database = sqlite.open('./database.sqlite').then(db => {
	database = db.driver;
	glob.database = database;
});

let commands = require('./commands/commands.js');

client.on('ready', () => {
	if(logging) console.log('Bot is ready');

	client.user.setActivity('Do raf help for commands!');
});

client.on('message', message => {
	if(message.author.bot) return;

	if(!message.content.startsWith('raf ')) return;

	let args = message.content.replace(/raf +/i, '').split(' ');
	let commandName = args[0];

	if(commands[commandName]) commands[commandName](message, args.slice(1));
});

// test for completions
setInterval(() => {
	utilities.dbasyncall(`select * from raffles`).then(raffles => {
		for(let raffle of raffles) {
			utilities.endRaffle(raffle);
		}
	});
}, 3500);


// update "ends in" message
setInterval(() => {
	utilities.dbasyncall(`select * from raffles`).then(raffles => {
		for(let raffle of raffles) {
			if(Date.now() > raffle.endstamp) return;

			let guildID = raffle.id.match(/^\d+:/)[0].replace(/:/g, '');
			let guild = client.guilds.get( guildID );

			if(guild) {
				let channelID = raffle.id.match(/:\d+:/)[0].replace(/:/g, '');
				let channel = guild.channels.get( channelID );

				if(channel) {
					let msgID = raffle.id.match(/:\d+$/)[0].replace(/:/g, '');

					channel.fetchMessage( msgID ).then(msg => {
						if(msg) {
							let embed = new Discord.RichEmbed({
								title: raffle.name,
								description: `React to enter!${raffle.winners != 1 ? `\n*${raffle.winners} winners*`:''}\nEnds in: **${utilities.getTime(raffle.endstamp - Date.now(), true)}**`,
								color: 0x3386BF,
								footer: {
									text: msg.embeds[0].footer.text
								}
							});

							msg.edit(':anger: **NEW RAFFLE** :anger:', {embed: embed});
						}
					});
				}
			}
		}
	});
}, 1000 * 60 * 16.231);