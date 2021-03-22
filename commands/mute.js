const userManager = require("../userManager");
const guildManager = require("../guildManager");

module.exports = {
    name: "mute",
    description: "Mutes a user. Requires a mute role to be configured",
    usage: "mute <@user> <minutes> <reason>",
    run: async (message, args) => {
        if (!message.member.hasPermission("KICK_MEMBERS")) {
            message.channel.send("You must be a moderator to use this command");
            return true;
        }

        if (message.mentions.members.length === 0 || args.length < 3 || isNaN(parseInt(args[1])))
            return false;

        let guild = await guildManager.getGuild(message.guild);
        if (!guild.muteRole) {
            message.channel.send("There is no mute role set up for this server. Configure it using !muterole");
            return true;
        }

        let taggedMember = message.mentions.members.first();
        if (taggedMember) {
            if (taggedMember.hasPermission("KICK_MEMBERS")) {
                message.channel.send("You cannot mute a moderator");
                return true;
            }

            let user = await userManager.getUser(taggedMember.user);
            let reason = args.splice(2).join(" ");
            user.warns.push({
                reason: `Mute: ${reason}`,
                time: new Date().toUTCString()
            });
            
            taggedMember.roles.add(guild.muteRole, `Muted for the reason: ${reason}`);
            message.channel.send(`Muted ${user.tag} for ${args[1]} minutes for the reason: **${reason}**`);
            taggedMember.send(`You were muted for ${args[1]} minutes in ${message.guild.name} for the reason: **${reason}**`);
            if (guild.logChannel) {
                message.guild.channels.resolve(guild.logChannel).send({embed: {
                    color: 0xFFFF00,
                    author: {
                        name: `User muted`
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
                            name: "Duration",
                            value: `${args[1]} minutes`
                        },
                        {
                            name: "Reason",
                            value: reason
                        }
                    ]
                }});
            }

            //timer to unmute user
            setTimeout(() => {
                if (taggedMember.roles.cache.some(r => r.id === guild.muteRole)) {
                    taggedMember.roles.remove(guild.muteRole, "Unmuted");
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
            }, parseInt(args[1]) * 60000);
        }
        else message.channel.send("User not found");
        return true;
    }
}