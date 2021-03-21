const guildManager = require("../guildManager");

module.exports = {
    name: "welcomechannel",
    description: "Sets a channel to send a welcome message to new users",
    usage: "welcomechannel [#channel]",
    run: async (message, args) => {
        if (!message.member.hasPermission("MANAGE_GUILD")) {
            message.channel.send("You must have the \"Manage Server\" permission to use this command");
            return true;
        }

        let guild = await guildManager.getGuild(message.guild);
        if (args.length === 0) {
            if (guild.welcomeChannel)
                message.channel.send(`The welcome channel is set to <#${guild.welcomeChannel}>`);
            else message.channel.send("The welcome channel is not set");
            return true;
        }

        if (message.mentions.channels.length === 0) return false;

            let channel = message.guild.channels.resolve(message.mentions.channels.first());
            if (channel) {
                guild.welcomeChannel = channel.id;
                guildManager.updateGuild(guild);
                message.channel.send(`Set the welcome channel to ${args[0]}. Don't forget to set a welcome message!`);
            }
            else message.channel.send("Channel not found");
        return true;
    }
}