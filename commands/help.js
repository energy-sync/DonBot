const fs = require("fs");
const path = require("path");
const guildManager = require("../guildManager");

module.exports = {
    name: "help",
    description: "Shows the help list",
    usage: "help",
    run: async (message, args) => {
        const guild = await guildManager.getGuild(message.guild);

        if (args.length === 0) {
            //shows list
            let commandList = "";
            const commandFiles = fs.readdirSync(path.resolve("./commands")).filter(file => file.endsWith(".js"));
            for (file of commandFiles) {
                const command = require(path.resolve(`./commands/${file}`));
                commandList += `**${command.name}** | ${command.description}\n`;
            }
            message.channel.send({embed: {
                author: {
                    name: "Command help",
                    icon_url: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/twitter/259/question-mark_2753.png"
                },
                description: commandList,
                footer: {
                    text: `Prefix: ${guild.prefix}`
                }
            }});
        }
        else {
            //shows specific command
            let commandPath = path.resolve(`./commands/${args[0]}.js`);
            if (fs.existsSync(commandPath)) {
                const command = require(commandPath);
                message.channel.send({embed: {
                    author: {
                        name: `Command help: ${command.name}`,
                        icon_url: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/twitter/259/question-mark_2753.png"
                    },
                    fields: [
                        {
                            name: "Description",
                            value: command.description
                        },
                        {
                            name: "Usage",
                            value: `${guild.prefix}${command.usage}`
                        }
                    ]
                }});
            }
            else message.channel.send(`No command "${args[0]}" found`);
        }
        return true;
    }
}