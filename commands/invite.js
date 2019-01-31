let glob = require('../globalVars.js');

function help(message, args) {
	if(args.length) return;
	
	message.channel.send('Raffle Bot by **ptato#0665**\nServer link: https://discord.gg/HcxhMES\nInvite link: https://discordapp.com/oauth2/authorize?client_id=536324257316339713&scope=bot&permissions=2146958463');
}

module.exports = help;