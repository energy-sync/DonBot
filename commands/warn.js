const userManager = require("../userManager");
const guildManager = require("../guildManager");

module.exports = {
    name: "warn",
    description: "Warns a user",
    usage: "warn <@user> <reason>",
    run: async (message, args) => {
        if (!message.member.hasPermission("KICK_MEMBERS")) {
            message.channel.send("You must be a moderator to use this command");
            return true;
        }
        if (message.mentions.users.length === 0 || args.length < 2)
            return false;
        let taggedUser = message.mentions.users.first();
        if (taggedUser) {
            let user = await userManager.getUser(taggedUser);
            let guild = await guildManager.getGuild(message.guild);
            args.shift();
            let reason = args.join(" ");
            user.warns.push({
                reason: reason,
                time: new Date().toUTCString()
            });
            await userManager.updateUser(user);
            message.channel.send(`Warned ${taggedUser.username} for the reason: **${reason}**`);
            taggedUser.send(`You were warned in ${message.guild.name} for the reason: **${reason}**`);
            if (guild.logChannel) {
                message.guild.channels.resolve(guild.logChannel).send({embed: {
                    color: 0xFFFF00,
                    author: {
                        name: `User warned`
                    },
                    thumbnail: {
                        url: message.mentions.users.first().displayAvatarURL()
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
        else message.channel.send("User not found");
        return true;
    }
}