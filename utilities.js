let glob = require('./globalVars.js');
let Discord = require('discord.js');
let moment = require('moment');

let utilities = {};

utilities.dbasyncall = function(param) {
	return new Promise(function(resolve, reject) {
		glob.database.all(param,function(err, data) {
			if(err !== null) return reject(JSON.stringify(err,undefined,4));
			resolve(data);
		})
	});
}

utilities.dbasync = function(param) {
	return new Promise(function(resolve, reject) {
		glob.database.get(param,function(err, data) {
			if(err !== null) return reject(JSON.stringify(err,undefined,4));
			resolve(data);
		});
	});
}

utilities.getTime = function(stamp, nosub) {
	var sec = 0;
	var min = 0;
	var hrs = 0;
	var dys = 0;
	var yrs = 0;
	var doMins = false;
	var ret;
	if(nosub) {
		if((stamp) / 1000 < 60) {
			return (stamp) / 1000 + "s"
		}
		else{
			doMins = true
		}
	}
	else{
		if((Date.now() - stamp) / 1000 < 60) {
			return (Date.now() - stamp) / 1000 + "s"
		}
		else{
			doMins = true
		}
	}
	if(doMins) {
		sec = (nosub) ? Math.round((stamp) / 1000):Math.round((Date.now() - stamp) / 1000);
		while(sec >= 60) {
			sec -= 60;
			min ++;
		}
		while(min >= 60) {
			min -= 60;
			hrs ++;
		}
		while(hrs >= 24) {
			hrs -= 24;
			dys ++;
		}
		while(dys >= 365) {
			dys -= 365;
			yrs ++;
		}
	}
	return ((!yrs ? '':yrs+"y ")+(!dys ? '':dys+"d ")+(!hrs ? '':hrs+"h ")+(!min ? '':min+"m ")+(!sec ? '':sec+"s")).trim();
}

utilities.uniq_fast = function(a) {
	let seen = {};
	let out = [];
	let len = a.length;
	let j = 0;

	for(let i = 0; i < len; i++) {
		let item = a[i];
		if(seen[item] !== 1) {
			seen[item] = 1;
			out[j++] = item;
		}
	}

	return out;
}

utilities.endRaffle = function(raffle, force) {
	if(Date.now() < raffle.endstamp && !force) return;

	let guildID = raffle.id.match(/^\d+:/)[0].replace(/:/g, '');
	let guild = glob.client.guilds.get( guildID );

	if(guild) {
		let channelID = raffle.id.match(/:\d+:/)[0].replace(/:/g, '');
		let channel = guild.channels.get( channelID );

		if(channel) {
			let msgID = raffle.id.match(/:\d+$/)[0].replace(/:/g, '');

			channel.fetchMessage( msgID ).then(msg => {
				if(msg) {
					let reactionPromises = [];

					msg.reactions.map(reaction => {
						reactionPromises.push(reaction.fetchUsers());
					});

					Promise.all(reactionPromises).then( (collect) => {
						let reactionEntries = utilities.uniq_fast([].concat.apply([], collect.map(reactions => reactions.map(user => user.id))));

						if(reactionPromises.length) {
							let safety = 0;
							let winners = [];
							let scanID = '';

							while(winners.length < raffle.winners && reactionEntries.length != 0) {
								if(reactionEntries.indexOf(scanID) != -1) reactionEntries.splice(reactionEntries.indexOf(scanID), 1);
								safety ++;
								if(safety > 10) {
									winners = [];
									break;
								}

								if(guild.members.get(scanID)) {
									winners.push(scanID);
								}

								scanID = reactionEntries[~~(Math.random() * reactionEntries.length)];
							}

							if(winners.length) {
								let embed = new Discord.RichEmbed({
									title: raffle.name,
									description: `**Winner${winners.length == 1 ? '':'s'}:${winners.length == 1 ? ' ':'\n'}${winners.map(id => `<@${id}>`).join('\n')}**`,
									color: 0x202225,
									footer: {
										text: `Ended • ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
									}
								});

								msg.edit(':anger: **OLD RAFFLE** :anger:', {embed: embed});

								channel.send(`Congratulations to ${winners.map(id => `<@${id}>`).join(', ')} for winning the **${raffle.name}** raffle!`);
							}
						}
						else {
							let embed = new Discord.RichEmbed({
								title: raffle.name,
								description: `**No winner :cry:**`,
								color: 0x202225,
								footer: {
									text: `Ended • ${moment().format('MMMM Do YYYY, h:mm:ss a')}`
								}
							});

							msg.edit(':anger: **OLD RAFFLE** :anger:', {embed: embed});
						}
					});
				}
			});
		}
	}

	glob.database.run(`delete from raffles where id = '${raffle.id}'`);
}

module.exports = utilities;