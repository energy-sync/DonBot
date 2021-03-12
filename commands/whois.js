const userManager = require("../userManager");

module.exports = {
    name: "whois",
    description: "Shows information of a user",
    usage: "whois <@user>",
    run: async (message, args) => {
        if (!message.member.hasPermission("KICK_MEMBERS")) {
            message.channel.send("Only moderators have access to this command");
            return true;
        }
        
        if (args.length == 0 || message.mentions.members.length == 0) return false;

        let user = await userManager.getUser(message.mentions.members.first().user);
        if (user) {
            message.channel.send({embed: {
                author: {
                    name: "User information"
                },
                thumbnail: {
                    url: message.mentions.members.first().user.displayAvatarURL()
                },
                fields: [
                    {
                        name: "Tag",
                        value: user.tag
                    },
                    {
                        name: "ID",
                        value: user.id
                    },
                    {
                        name: "Real name",
                        value: user.realName
                    }
                ]
            }})
        }
        else message.channel.send("User not found");
        return true;
    }
}