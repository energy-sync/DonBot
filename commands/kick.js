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
            
        let taggedMember = message.mentions.members.first();
        if (taggedMember) {
            if (taggedMember.hasPermission("KICK_MEMBERS")) {
                message.channel.send("You cannot kick a moderator");
                return true;
            }

            let user = await userManager.getUser(taggedMember.user);
            let guild = await guildManager.getGuild(message.guild);
            args.shift();
            let reason = args.join(" ");
            await taggedMember.send(`You were kicked from ${message.guild.name} for the reason: **${reason}**`);
            taggedMember.kick(reason);
            message.channel.send(`${user.tag} ${user.realName ? "(" + user.realName + ") " : ""}was kicked for the reason: **${reason}**`);
            if (guild.logChannel) {
                message.guild.channels.resolve(guild.logChannel).send({embed: {
                    color: 0xFF0000,
                    author: {
                        name: `User kicked from ${guild.name}`
                    },
                    thumbnail: {
                        url: taggedMember.user.displayAvatarURL()
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