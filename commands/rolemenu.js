const guildManager = require("../guildManager");

module.exports = {
    name: "rolemenu",
    description: "Creates a message that users can react to in order to get roles",
    usage: "rolemenu <title>, <@role>, <emoji>, ...",
    run: async (message, args) => {
        if (!message.member.hasPermission("MANAGE_GUILD")) {
            message.channel.send("You must have the \"Manage Server\" permission to use this command");
            return true;
        }

        let argsStr = args.join(" ").replace(/, /g, ",");
        args = argsStr.split(",");
        if (args.length < 3 || args.length % 2 === 0 || message.mentions.roles.length === 0) return false;

        let roleMenu = {
            messageID: undefined,
            channelID: undefined,
            reactions: []
        }

        for (let i = 1; i < args.length - 1; i += 2) {
            if (!args[i].includes("<@&")) return false;
            let role = message.guild.roles.resolve(args[i].substring(args[i].indexOf("<@&") + 3, args[i].indexOf(">")));
            if (!role) return false;

            let emoji = args[i + 1].replace(/ /g, "");
            if (emoji.includes("<:")) {
                emoji = emoji.substring(emoji.indexOf(":") + 1, emoji.indexOf(">"));
                emoji = emoji.substring(emoji.indexOf(":") + 1);
            }
            
            roleMenu.reactions.push({
                role: role.id,
                emoji: emoji
            });
        }
        
        let msg = "";
        for (reaction of roleMenu.reactions) {
            msg += `${isNaN(reaction.emoji) ? reaction.emoji : message.client.emojis.resolve(reaction.emoji)}  **-**  <@&${reaction.role}>\n\n`;
        }
        message.channel.send({embed: {
            author: {
                name: args[0]
            },
            description: msg
        }}).then(async (m) => {
            //update in database
            let guild = await guildManager.getGuild(message.guild);
            roleMenu.messageID = m.id;
            roleMenu.channelID = m.channel.id;
            guild.roleMenus.push(roleMenu);
            guildManager.updateGuild(guild);

            //add reactions
            for (reaction of roleMenu.reactions) {
                try {
                    await m.react(reaction.emoji);
                } catch (error) {
                    m.delete();
                    message.channel.send("Something went wrong. Please try again");
                    console.log(`\nError in rolemenu command:\n${error.stack}`);
                }
            }
        });

        return true;
    }
}