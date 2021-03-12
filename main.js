const Discord = require("discord.js");
const Keyv = require("keyv");
const { token, mongoPath } = require("./config.json");
const userManager = require("./userManager");
const guildManager = require("./guildManager");
const commandHandler = require("./commandHandler");

const client = new Discord.Client();
client.login(token);
const keyv = new Keyv(mongoPath);

client.on("ready", async () => {
    commandHandler.loadCommands(client);
    console.log(`Connected as ${client.user.username}`);
});

client.on("message", async (message) => {
    if (!message.author.bot && !message.system && message.channel.type === "text") {
        //makes sure user is in the database and cache
        userManager.addUser(message.author);

        //commands
        let guild = await guildManager.getGuild(message.guild);
        if (!guild)
            guild = await guildManager.addGuild(message.guild);
        if (message.content.startsWith(guild.prefix));
            commandHandler.run(message, guild.prefix);

        //tells the prefix if pinged
        if (message.content === `<@!${client.user.id}>`) {
            let guild = await guildManager.getGuild(message.guild);
            message.channel.send(`The prefix for this server is "${guild.prefix}"`);
        }
    }
});

client.on("guildCreate", async (guild) => {
    await guildManager.addGuild(guild);
});

client.on("error", async (error) => {
    console.log(`Connection error: ${error}`);
});

keyv.on("error", err => {
    console.log(`Keyv connection error: ${err.stack}`);
});