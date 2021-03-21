const guildManager = require("../guildManager");

module.exports = {
    name: "verifyrole",
    description: "Sets the role given to users when they join the server. This role is taken away to give access to the server fully",
    usage: "verify [@role]",
    run: async (message, args) => {
        if (!message.member.hasPermission("MANAGE_GUILD")) {
            message.channel.send("You must have the \"Manage Server\" permission to use this command");
            return true;
        }

        let guild = await guildManager.getGuild(message.guild);
        if (message.mentions.roles.length === 0 || args.length === 0) {
            if (guild.verifyRole)
                message.channel.send(`The verify role is set to <@&${guild.verifyRole}>`);
            else message.channel.send("There is no verify role set");
            return true
        }

        let role = message.mentions.roles.first();
        if (!message.guild.roles.resolve(role)) {
            message.channel.send("Role not found");
            return true;
        }

        guild.verifyRole = role.id;
        await guildManager.updateGuild(guild);
        message.channel.send(`Set the verify role to <@&${role.id}>`);

        return true;
    }
}