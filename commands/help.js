let glob = require('../globalVars.js');

function help(message, args) {
	if(args.length) return;
	
	message.channel.send(`help - list all of the commands.\ncreate - create a raffle: \`raf create "name" "duration" [winners (optional)] [channel (optional)]\`.\nend - end a raffle prematurely: \`raf end [raffle name]\`.\ninvite - recieve the invite link for Raffle Bot.`);
}

module.exports = help;