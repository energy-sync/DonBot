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

//logging

client.on("channelCreate", async (channel) => {
    if (channel.guild) {
        let guild = await guildManager.getGuild(channel.guild);
        if (guild.logChannel) {
            let embed = new Discord.MessageEmbed({
                author: {
                    name: "Channel created"
                }
            });
            embed.addField("Name", channel.type === "text" ? `<#${channel.id}>` : channel.name);
            if (channel.parent)
                embed.addField("Category", channel.parent.name);
            embed.addField("Type", channel.type);
            client.channels.fetch(guild.logChannel).then(c => {
                c.send(embed);
            });
        }
    }
});

client.on("channelDelete", async (channel) => {
    let guild = await guildManager.getGuild(channel.guild);
    if (guild.logChannel) {
        let embed = new Discord.MessageEmbed({
            author: {
                name: "Channel deleted"
            }
        });
        embed.addField("Name", channel.type === "text" ? `#${channel.name}` : channel.name);
        if (channel.parent)
            embed.addField("Category", channel.parent.name);
        embed.addField("Type", channel.type);
        client.channels.fetch(guild.logChannel).then(c => {
            c.send(embed);
        });
    }
});

client.on("guildCreate", async (guild) => {
    await guildManager.addGuild(guild);
});

client.on("guildMemberAdd", async (member) => {
    await userManager.getUser(member.user);
    let guild = await guildManager.getGuild(member.guild);
    //welcome message
    if (guild.welcomeChannel && guild.welcomeMessage) {
        client.channels.fetch(guild.welcomeChannel).then(c => {
            c.send(guild.welcomeMessage.replace("{user}", `<@!${member.user.id}>`));
        });
    }
    //log
    if (guild.logChannel) {
        let user = member.user;
        client.channels.fetch(guild.logChannel).then(c => {
            c.send({embed: {
                author: {
                    name: `User joined ${guild.name}`
                },
                thumbnail: {
                    url: user.displayAvatarURL()
                },
                fields: [
                    {
                        name: "Tag",
                        value: user.tag
                    },
                    {
                        name: "ID",
                        value: user.id
                    },
                    {
                        name: "Account created at",
                        value: user.createdAt
                    }
                ]
            }});
        });
    }
});

client.on("guildMemberRemove", async (member) => {
    let guild = await guildManager.getGuild(member.guild);
    if (guild.logChannel) {
        let user = member.user;
        let fetchedUser = await userManager.getUser(member.user);
        client.channels.fetch(guild.logChannel).then(c => {
            c.send({embed: {
                author: {
                    name: `User left ${guild.name}`
                },
                thumbnail: {
                    url: user.displayAvatarURL()
                },
                fields: [
                    {
                        name: "Tag",
                        value: user.tag
                    },
                    {
                        name: "ID",
                        value: user.id
                    },
                    {
                        name: "Real name",
                        value: fetchedUser.realName
                    }
                ]
            }});
        });
    }
});

client.on("guildMemberUpdate", async (oldMember, newMember) => {
    if (oldMember.nickname !== newMember.nickname) {
        let guild = await guildManager.getGuild(oldMember.guild);
        let user = await userManager.getUser(oldMember.user);
        user.realName = newMember.nickname;
        userManager.updateUser(user);
        if (guild.logChannel) {
            client.channels.fetch(guild.logChannel).then(c => {
                c.send({embed: {
                    author: {
                        name: "User changed their nickname"
                    },
                    thumbnail: {
                        url: newMember.user.displayAvatarURL()
                    },
                    fields: [
                        {
                            name: "User",
                            value: newMember.user.tag
                        },
                        {
                            name: "Old nickname",
                            value: oldMember.nickname ? oldMember.nickname : "None"
                        },
                        {
                            name: "New nickname",
                            value: newMember.nickname ? newMember.nickname : "None"
                        }
                    ]
                }});
            });
        }
    }
});

client.on("messageDelete", async (message) => {
    let guild = await guildManager.getGuild(message.guild);
    if (guild.logChannel) {
        let embed = new Discord.MessageEmbed({
            author: {
                name: `Message by ${message.member.displayName} deleted`,
                icon_url: message.author.displayAvatarURL()
            }
        });
        if (message.content)
            embed.addField("Message", message.content);
        embed.addField("Channel", `<#${message.channel.id}>`);
        if (message.attachments.first())
            embed.setImage(message.attachments.first().proxyURL);
        client.channels.fetch(guild.logChannel).then(c => {
            c.send(embed);
        });
    }
});

client.on("error", async (error) => {
    console.log(`Connection error: ${error}`);
});

keyv.on("error", err => {
    console.log(`Keyv connection error: ${err.stack}`);
});