const { Collection } = require("discord.js");
const fs = require("fs");

let client;

exports.loadCommands = (c) => {
    client = c;
    client.commands = new Collection();
    const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
    for (file of commandFiles) {
        const command = require(`./commands/${file}`);
        client.commands.set(command.name, command);
    }
}

exports.run = (message, prefix) => {
    let args = message.content.toLowerCase().slice(1).trim().split(/ +/g);
    let cmd = args.shift().toLowerCase();
    let command = client.commands.get(cmd);
    if (command) {
        try {
            command.run(message, args).then(valid => {
                if (!valid)
                    message.channel.send(`Usage: ${prefix}${command.usage}`);
            });
        } catch (error) {
            console.log(`Error during ${command.name} command: ${error.stack}`);
        }
    }
}