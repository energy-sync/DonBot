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

        let argsStr = args.join(" ").replaceAll(", ", ",");
        args = argsStr.split(",");
        if (args.length < 3 || args.length % 2 === 0 || message.mentions.roles.length === 0) return false;

        let roleMenu = {
            reactions: []
        }

        for (let i = 1; i < args.length - 1; i += 2) {
            if (!args[i].includes("<@&")) return false;
            let role = message.guild.roles.resolve(args[i].substring(args[i].indexOf("<@&") + 3, args[i].indexOf(">")));
            if (!role) return false;
            
            roleMenu.reactions.push({
                role: role.id,
                emoji: args[i + 1].replaceAll(" ", "")
            });
        }
        
        let msg = `**${args[0]}**\n\n`;
        for (reaction of roleMenu.reactions) {
            msg += `${reaction.emoji}  |  <@&${reaction.role}>\n`;
        }
        message.channel.send(msg).then(async (m) => {
            //update in database
            let guild = await guildManager.getGuild(message.guild);
            guild.roleMenus[m.id] = roleMenu;
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