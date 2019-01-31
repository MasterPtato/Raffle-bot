let glob = require('../globalVars.js');
let util = require('util');
let utilities = require('../utilities.js');

function eval_cmd(message, args) {
	if(message.author.id != '200830681893437441') return;

	args = message.content.split(" ").slice(2);
	let code = args.join(" ");
	try {
		let evaled = eval(code);
		if(typeof evaled !== "string"){
			evaled = util.inspect(evaled);
		}
		message.channel.send('**Input**```js\n'+code+'```\n**Output**```js\n'+(evaled.toString())+'```');
	}
	catch(err) {
		message.channel.send('**Input**```js\n'+code+'```\n**Output**```js\n'+(err.toString())+'```');
	}
}

module.exports = eval_cmd;