const guildManager = require("../guildManager");

module.exports = {
    name: "welcomemessage",
    description: "Sets a welcome message for new users",
    usage: "welcomemessage <message>",
    run: async (message, args) => {
        if (!message.member.hasPermission("MANAGE_GUILD")) {
            message.channel.send("You must have the \"Manage Server\" permission to use this command");
            return true;
        }

        let guild = await guildManager.getGuild(message.guild);
        if (args.length === 0) {
            if (guild.welcomeMessage)
                message.channel.send(`The welcome message is set to "${guild.welcomeMessage}"`);
            else message.channel.send("The welcome message is not set");
        }
        else {
            let welcomeMessage = args.join(" ");
            guild.welcomeMessage = welcomeMessage;
            guildManager.updateGuild(guild);
            message.channel.send(`Set the welcome message to: "${welcomeMessage}"`);
        }
        return true;
    }
}