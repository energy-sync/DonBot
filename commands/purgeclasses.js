const { classChannelCategory } = require("../config.json");

module.exports = {
    name: "purgeclasses",
    description: "Deletes all messages from the class channels",
    usage: "purgeclasses confirm",
    run: async (message, args) => {
        if (!message.member.hasPermission("MANAGE_GUILD")) {
            message.channel.send("You must be an administrator to use this command");
            return true;
        }

        if (!classChannelCategory) {
            message.channel.send("A class category channel has not been set");
            return true;
        }

        if (message.mentions.members.length === 0 || args[0] !== "confirm")
            return false;

        message.guild.channels.cache.each(async (channel) => {
            if (channel.type === "text" && channel.parentID !== null && channel.parentID === classChannelCategory) {
                let c = await message.client.channels.resolve(channel);
                await c.clone();
                await channel.delete();
            }
        });

        return true;
    }
}