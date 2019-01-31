function e_require(name) {
	return require(`./${name}.js`);
}

let commandsList = ['help', 'create', 'eval', 'end', 'invite'];

function objFormat(list) {
	let obj = {};

	list.map(a => {
		obj[a] = e_require(a);
	});

	return obj;
}

module.exports = objFormat(commandsList);