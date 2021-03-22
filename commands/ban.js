const userManager = require("../userManager");
const guildManager = require("../guildManager");

module.exports = {
    name: "ban",
    description: "Bans a user from the server",
    usage: "ban <@user> <reason>",
    run: async (message, args) => {
        if (!message.member.hasPermission("BAN_MEMBERS")) {
            message.channel.send("You must be a moderator to use this command");
            return true;
        }

        if (message.mentions.members.length === 0 || args.length < 2)
            return false;

        let taggedMember = message.mentions.members.first();
        if (taggedMember) {
            if (taggedMember.hasPermission("KICK_MEMBERS")) {
                message.channel.send("You cannot ban a moderator");
                return true;
            }

            let user = await userManager.getUser(taggedMember.user);
            let guild = await guildManager.getGuild(message.guild);
            args.shift();
            let reason = args.join(" ");
            await taggedMember.send(`You were banned from ${message.guild.name} for the reason: **${reason}**`);
            taggedMember.ban({reason: reason});
            message.channel.send(`${user.tag} ${user.realName ? "(" + user.realName + ") " : ""}was banned for the reason: **${reason}**`);
            if (guild.logChannel) {
                message.guild.channels.resolve(guild.logChannel).send({embed: {
                    color: 0xFF0000,
                    author: {
                        name: `User banned from ${guild.name}`
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