module.exports = {
    name: "say",
    description: "Sends a message to a specified channel",
    usage: "say <#channel> <message>",
    run: async (message, args) => {
        if (!message.member.hasPermission("MANAGE_GUILD")) {
            message.channel.send("You must be an administrator to use this command");
            return true;
        }

        if (message.mentions.channels.array().length === 0 || args.length < 2)
            return false;

        let channel = message.guild.channels.resolve(message.mentions.channels.first());
        if (!channel) {
            message.channel.send("That channel could not be found in this server");
            return true;
        }

        args.shift();
        let msg = args.join(" ");
        channel.send(msg);
        return true;
    }
}