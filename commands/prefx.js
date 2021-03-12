const guildManager = require("../guildManager");

module.exports = {
    name: "prefix",
    description: "Changes the prefix for this server. Must be one character long",
    usage: "prefix <prefix>",
    run: async (message, args) => {
        if (!message.member.hasPermission("MANAGE_GUILD")) {
            message.channel.send("You must have the \"Manage Server\" permission to use this command");
            return true;
        }

        if (args.length === 0) return false;

        if (args[0].length > 1) {
            message.channel.send("The prefix must be one character long");
            return true;
        }

        let guild = await guildManager.getGuild(message.guild);
        guild.prefix = args[0];
        await guildManager.updateGuild(guild);
        message.channel.send(`Changed the prefix to "${args[0]}"`);

        return true;
    }
}