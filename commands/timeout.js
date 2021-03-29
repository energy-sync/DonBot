const userManager = require("../userManager");
const guildManager = require("../guildManager");

module.exports = {
    name: "timeout",
    description: "Sends a user to timeout",
    usage: "timeout <@user> <minutes>",
    run: async (message, args) => {
        if (!message.member.hasPermission("MANAGE_GUILD")) {
            message.channel.send("You must be a moderator to use this command");
            return true;
        }

        if (message.mentions.members.length === 0 || args.length < 2 || isNaN(parseInt(args[1])))
            return false;

        let guild = await guildManager.getGuild(message.guild);
        if (!guild.timeoutRole) {
            message.channel.send("There is no timeout role set up for this server. Configure it using !timeoutrole");
            return true;
        }

        let taggedMember = message.mentions.members.first();
        if (taggedMember) {
            if (taggedMember.hasPermission("MANAGE_GUILD")) {
                message.channel.send("You cannot send an administrator to timeout");
                return true;
            }

            let user = await userManager.getUser(taggedMember.user);
            
            //get all roles from members
            let roles = [];
            taggedMember.roles.cache.each(role => {
                if (role.name !== "@everyone") {
                    roles.push(role);
                    taggedMember.roles.remove(role);
                }
            });

            taggedMember.roles.add(guild.timeoutRole);
            message.channel.send(`Sent ${user.tag} to timeout for ${args[1]} minutes`);
            if (guild.timeoutLogChannel) {
                message.guild.channels.resolve(guild.timeoutLogChannel).send({embed: {
                    color: 0xFFFF00,
                    author: {
                        name: `User sent to timeout`
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
                        }
                    ]
                }});
            }

            //timer to take user out of timeout
            setTimeout(() => {
                if (taggedMember.roles.cache.some(r => r.id === guild.timeoutRole)) {
                    taggedMember.roles.remove(guild.timeoutRole);
                    for (role of roles)
                        taggedMember.roles.add(role);
                    if (guild.timeoutLogChannel) {
                        message.guild.channels.resolve(guild.timeoutLogChannel).send({embed: {
                            color: 0xFFFF00,
                            author: {
                                name: `User taken out of timeout`
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