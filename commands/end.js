let glob = require('../globalVars.js');
let utilities = require('../utilities.js');

function end(message, args) {
	if(!message.member.hasPermission("ADMINISTRATOR")) {
		message.channel.send('You must have permission `ADMINISTRATOR` to use this command.');
		return;
	}
	if(!args.length) {
		message.channel.send('End a raffle like this: `raf end [raffle name]`.');
		return;
	}

	let name = args.join(' ').trim();

	utilities.dbasync(`select * from raffles where name = '${name.replace(/'/g, "''").toLowerCase().trim()}'`).then(raffle => {
		if(!raffle) {
			message.channel.send('Raffle not found.');
			return;
		}

		let guildID = raffle.id.match(/^\d+:/)[0].replace(/:/g, '');
		if(guildID != message.guild.id) {
			message.channel.send('Raffle not found.');
			return;
		}

		utilities.endRaffle(raffle, true);
		message.channel.send(`Raffle **${raffle.name}** manually ended.`);
	});
}

module.exports = end;