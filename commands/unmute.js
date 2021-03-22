const userManager = require("../userManager");
const guildManager = require("../guildManager");

module.exports = {
    name: "unmute",
    description: "Unmutes a user. Requires a mute role to be configured",
    usage: "mute <@user>",
    run: async (message, args) => {
        if (!message.member.hasPermission("KICK_MEMBERS")) {
            message.channel.send("You must be a moderator to use this command");
            return true;
        }

        if (message.mentions.members.length === 0)
            return false;

        let guild = await guildManager.getGuild(message.guild);
        if (!guild.muteRole) {
            message.channel.send("There is no mute role set up for this server. Configure it using !muterole");
            return true;
        }

        let taggedMember = message.mentions.members.first();
        if (taggedMember) {
            if (taggedMember.hasPermission("KICK_MEMBERS")) {
                message.channel.send("You cannot mute/unmute a moderator");
                return true;
            }

            if (!taggedMember.roles.cache.some(r => r.id === guild.muteRole)) {
                message.channel.send(`${user.tag} is not muted`);
                return true;
            }

            let user = await userManager.getUser(taggedMember.user);
            
            taggedMember.roles.remove(guild.muteRole, "Unmuted");
            message.channel.send(`Unmuted ${user.tag}`);
            taggedMember.send(`You were unmuted in ${message.guild.name}`);
            if (guild.logChannel) {
                message.guild.channels.resolve(guild.logChannel).send({embed: {
                    color: 0xFFFF00,
                    author: {
                        name: `User unmuted`
                    },
                    thumbnail: {
                        url: message.mentions.users.first().displayAvatarURL()
                    },
                    fields: [
                        {
                            name: "Tag",
                            value: user.tag
                        }
                    ]
                }});
            }
        }
        else message.channel.send("User not found");
        return true;
    }
}