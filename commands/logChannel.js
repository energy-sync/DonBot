const guildManager = require("../guildManager");

module.exports = {
    name: "logchannel",
    description: "Sets the logging channel",
    usage: "logchannel <#channel>",
    run: async (message, args) => {
        if (args.length === 0 || message.mentions.channels.length === 0) return false;

        if (!message.member.hasPermission("MANAGE_GUILD")) {
            message.channel.send("You must have the \"Manage Server\" permission to use this command");
            return true;
        }

        let guild = await guildManager.getGuild(message.guild);
        let channel = message.guild.channels.resolve(message.mentions.channels.first());
        if (channel) {
            guild.logChannel = channel.id;
            guildManager.updateGuild(guild);
            message.channel.send(`The log channel has been set to <#${channel.id}>`);
        }
        else message.channel.send("That channel was not found in this server");
        return true;
    }
}