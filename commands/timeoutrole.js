const guildManager = require("../guildManager");

module.exports = {
    name: "timeoutrole",
    description: "Sets the timeout role",
    usage: "timeoutrole [@role]",
    run: async (message, args) => {
        if (!message.member.hasPermission("MANAGE_GUILD")) {
            message.channel.send("You must have the \"Manage Server\" permission to use this command");
            return true;
        }

        let guild = await guildManager.getGuild(message.guild);
        if (message.mentions.roles.length === 0 || args.length === 0) {
            if (guild.timeoutRole)
                message.channel.send(`The timeout role is set to <@&${guild.timeoutRole}>`);
            else message.channel.send("There is no timeout role set");
            return true
        }

        let role = message.mentions.roles.first();
        if (!message.guild.roles.resolve(role)) {
            message.channel.send("Role not found");
            return true;
        }

        guild.timeoutRole = role.id;
        await guildManager.updateGuild(guild);
        message.channel.send(`Set the timeout role to <@&${role.id}>`);

        return true;
    }
}