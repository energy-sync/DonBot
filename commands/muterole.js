const guildManager = require("../guildManager");

module.exports = {
    name: "muterole",
    description: "Sets the role used for muting users",
    usage: "muterole [@role]",
    run: async (message, args) => {
        if (!message.member.hasPermission("MANAGE_GUILD")) {
            message.channel.send("You must have the \"Manage Server\" permission to use this command");
            return true;
        }

        let guild = await guildManager.getGuild(message.guild);
        if (message.mentions.roles.length === 0 || args.length === 0) {
            if (guild.muteRole)
                message.channel.send(`The mute role is set to <@&${guild.muteRole}>`);
            else message.channel.send("There is no mute role set");
            return true;
        }

        let role = message.mentions.roles.first();
        if (!message.guild.roles.resolve(role)) {
            message.channel.send("Role not found");
            return true;
        }

        guild.muteRole = role.id;
        await guildManager.updateGuild(guild);
        message.channel.send(`Set the mute role to <@&${role.id}>`);

        return true;
    }
}