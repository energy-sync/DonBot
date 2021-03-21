const Discord = require("discord.js");
const userManager = require("../userManager");

module.exports = {
    name: "warnings",
    description: "Gets a list of warnings for a user",
    usage: "warnings <@user> [clear]",
    run: async (message, args) => {
        if (!message.member.hasPermission("KICK_MEMBERS")) {
            message.channel.send("You must be a moderator to use this command");
            return true;
        }

        if (message.mentions.users.length === 0)
            return false;
            
        let user = await userManager.getUser(message.mentions.users.first());
        if (args[1] && (args[1].toLowerCase() === "clear" || args[1].toLowerCase() === "reset")) {
            user.warns = [];
            await userManager.updateUser(user);
            message.channel.send(`Reset all warnings for ${user.tag}`);
        }
        else {
            let warnings = user.warns.reverse();
            if (user.warns.length === 0)
                message.channel.send(`${user.tag} (${user.realName}) has no warnings`);
            else {
                let embeds = [];
                let embedCount = -1;
                for (let i = 0; i < warnings.length; i++) {
                    if (i % 10 === 0) {
                        embeds.push(new Discord.MessageEmbed({
                            author: {
                                name: `Warnings for ${user.tag}`,
                                icon_url: message.mentions.users.first().displayAvatarURL()
                            }
                        }));
                        embedCount++;
                    }
                    embeds[embedCount].addField(i + 1, `**Reason:** ${warnings[i].reason}\n**Timestamp:** ${warnings[i].time}`);
                }
                for (embed of embeds)
                    message.channel.send(embed);
            }
        }
        return true;
    }
}