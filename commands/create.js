let Discord = require('discord.js');
let glob = require('../globalVars.js');
let utilities = require('../utilities.js');

function create(message, args) {
	if(!message.member.hasPermission("ADMINISTRATOR")) {
		message.channel.send('You must have permission `ADMINISTRATOR` to use this command.');
		return;
	}
	if(!args.length) {
		message.channel.send('`raf create "name" "duration" [winners (optional)] [channel (optional)]` is used like this: `raf create "700 big potatoes" "9 hours"`.');
		return;
	}

	let newargs = args.join(' ').trim();
	let name = newargs.match(/^"[^"]*"/i);

	if(!name) {
		message.channel.send('`raf create "name" "duration" [winners (optional)] "[channel (optional)]` is used like this: `raf create "700 big potatoes" "9 hours"`.');
		return;
	}
	name = name[0].replace(/"/g, '');

	if(name.length > 128 || !name) {
		message.channel.send('Your raffle name must be at least 1 character long and less than 128 characters long.');
		return;
	}

	let duration = newargs.match(/"[^"]*"/gi)[1];

	if(!/\d{1,4} ?(days|day|d|hours|hour|h|minutes|mins|min|minute|m|seconds|secs|sec|s)/gi.test(duration)) {
		message.channel.send('Invalid time format. Try: `4h`, `30 seconds`, `12 hours`, `2 days`, `1d`, etc. (max 4 digit number)');
		return;
	}

	let winners = newargs.match(/ +\d+($|) +/);

	if(winners) {
		if(!(/^\d+$/.test(winners[0].trim()))){
			message.channel.send(`Parameter \`winners\` must be a number from 1 to 20`);
			return;
		}
		else if(parseInt(winners[0]) > 20 || parseInt(winners[0]) < 1) {
			message.channel.send(`Parameter \`winners\` must be a number from 1 to 20`);
			return;
		}
		winners = parseInt(winners[0].trim());
	}
	else {
		winners = 1;
	}

	if(!/\d{1,4} ?(days|day|d|hours|hour|h|minutes|mins|min|minute|m|seconds|secs|sec|s)/gi.test(duration)) {
		message.channel.send('Invalid time format. Try: `4h`, `30 seconds`, `12 hours`, `2 days`, `1d`, etc. (max 4 digit number)');
		return;
	}

	let channel = newargs.match(/<#\d+> *$/);

	if(channel) {
		let matchChannel = message.guild.channels.get(channel[0].replace(/[<#>]/g, ''));

		if(matchChannel) {
			channel = matchChannel;
		}
		else {
			channel = message.channel;
		}
	}
	else {
		channel = message.channel;
	}

	let days = duration.match(/\d{1,4} ?(days|day|d)/i);
	let hours = duration.match(/\d{1,4} ?(hours|hour|h)/i);
	let minutes = duration.match(/\d{1,4} ?(minutes|minute|mins|min|m)/i);
	let seconds = duration.match(/\d{1,4} ?(seconds|secs|sec|s)/i);

	days = days ? parseInt(days[0]):0;
	hours = hours ? parseInt(hours[0]):0;
	seconds = seconds ? parseInt(seconds[0]):0;
	minutes = minutes ? parseInt(minutes[0]):0;

	let time = (1000 * 60 * 60 * 24 * days) + (1000 * 60 * 60 * hours) + (1000 * 60 * minutes) + (1000 * seconds);

	let embed = new Discord.RichEmbed({
		title: name,
		description: `React to enter!${winners != 1 ? `\n*${winners} winners*`:''}`,
		color: 0x3386BF,
		footer: {
			text: `Duration • ${utilities.getTime(time, true)}`
		}
	});

	if(channel.id != message.channel.id) {
		message.channel.send(`Raffle successfully created.`);
	}

	channel.send(':anger: **NEW RAFFLE** :anger:', {embed: embed}).then(msg => {
		let globID = `${msg.guild.id}:${msg.channel.id}:${msg.id}`;

		glob.database.run(`insert into raffles values('${globID}', '${name.replace(/'/, "''")}', '${Date.now() + time}', ${winners})`);
	});
}

module.exports = create;