const userManager = require("../userManager");
const guildManager = require("../guildManager");

module.exports = {
    name: "kick",
    description: "Kicks a user from the server",
    usage: "kick <@user> <reason>",
    run: async (message, args) => {
        if (!message.member.hasPermission("KICK_MEMBERS")) {
            message.channel.send("You must be a moderator to use this command");
            return true;
        }

        if (message.mentions.members.length === 0 || args.length < 2)
            return false;
            
        let taggedUser = message.mentions.users.first();
        if (taggedUser) {
            let user = await userManager.getUser(taggedUser);
            let guild = await guildManager.getGuild(message.guild);
            args.shift();
            let reason = args.join(" ");
            await message.mentions.members.first().send(`You were kicked from ${message.guild.name} for the reason: **${reason}**`);
            message.mentions.members.first().kick(reason);
            message.channel.send(`${user.tag} ${user.realName ? "(" + user.realName + ") " : ""}was kicked for the reason: **${reason}**`);
            if (guild.logChannel) {
                message.guild.channels.resolve(guild.logChannel).send({embed: {
                    color: 0xFF0000,
                    author: {
                        name: `User kicked from ${guild.name}`
                    },
                    thumbnail: {
                        url: taggedUser.displayAvatarURL()
                    },
                    fields: [
                        {
                            name: "Tag",
                            value: user.tag
                        },
                        {
                            name: "Reason",
                            value: reason
                        }
                    ]
                }});
            }
        }
        return true;
    }
}