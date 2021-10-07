const { Client, Intents, MessageEmbed } = require("discord.js");
const Keyv = require("keyv");
const { token, mongoPath } = require("./config.json");
const userManager = require("./userManager");
const guildManager = require("./guildManager");
const commandHandler = require("./commandHandler");

const client = new Client({
    ws : {intents: Intents.ALL}
});
client.login(token);
const keyv = new Keyv(mongoPath);

client.on("ready", async () => {
    commandHandler.loadCommands(client);
    //cache messages for role menus
    for (guild of client.guilds.cache.array())
        await guildManager.getGuild(guild);
    for (guild in guildManager.guilds) {
        for (roleMenu of guildManager.guilds[guild].roleMenus) {
            if (roleMenu) {
                let channel = client.channels.resolve(roleMenu.channelID);
                try {
                    await channel.messages.fetch(roleMenu.messageID);
                } catch (error) {
                    //remove role menu if the message no longer exists
                    let g = guildManager.guilds[guild];
                    g.roleMenus.splice(g.roleMenus.indexOf(roleMenu), 1);
                    guildManager.updateGuild(g);
                }
            }
        }
    }
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
            let embed = new MessageEmbed({
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
        let embed = new MessageEmbed({
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

    //add verify role
    if (guild.verifiedRole)
        member.roles.add(guild.verifiedRole);
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
    let guild = await guildManager.getGuild(oldMember.guild);
    let user = await userManager.getUser(oldMember.user);
    user.realName = newMember.nickname;
    userManager.updateUser(user);

    if (oldMember.nickname !== newMember.nickname) {
        if (!newMember.nickname) {
            //log
            if (guild.logChannel) {
                client.channels.fetch(guild.logChannel).then(c => {
                    c.send({embed: {
                        author: {
                            name: "User removed their nickname"
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
    
            //unverify user
            if (guild.verifiedRole) {
                newMember.roles.cache.each(role => {
                    if (role.name !== "@everyone")
                        newMember.roles.remove(role);
                });
                newMember.roles.add(guild.verifiedRole);
            }
        }
        else {
            //log
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

            //verify
            if (guild.verifiedRole) {
                if (newMember.roles.cache.some(r => r.id === guild.verifiedRole))
                    newMember.roles.remove(guild.verifiedRole);
            }
        }
    }
});

client.on("messageDelete", async (message) => {
    let guild = await guildManager.getGuild(message.guild);
    if (guild.logChannel) {
        let embed = new MessageEmbed({
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

    //deletes role menu if it is one
    let roleMenu = guild.roleMenus.find(r => r.messageID === message.id);
    if (roleMenu) {
        guild.roleMenus.splice(guild.roleMenus.indexOf(roleMenu), 1);
        guildManager.updateGuild(guild);
    }
});

//role menus

client.on("messageReactionAdd", async (reaction, user) => {
    try {
        if (!user.bot) {
            let guild = await guildManager.getGuild(reaction.message.guild);
            let roleMenu = guild.roleMenus.find(r => r.messageID === reaction.message.id);
            if (roleMenu) {
                let member = reaction.message.guild.members.resolve(user.id);
                let role = roleMenu.reactions.find(r => (r.emoji === reaction.emoji.name || r.emoji === reaction.emoji.id));
                if (role)
                    member.roles.add(role.role);
            }
        }
    } catch (error) {
        console.log(`Error during messageReactionAdd event:\n${error.stack}`);
    }
});

client.on("messageReactionRemove", async (reaction, user) => {
    try {
        if (!user.bot) {
            let guild = await guildManager.getGuild(reaction.message.guild);
            let roleMenu = guild.roleMenus.find(r => r.messageID === reaction.message.id);
            if (roleMenu) {
                let member = reaction.message.guild.members.resolve(user.id);
                let role = roleMenu.reactions.find(r => (r.emoji === reaction.emoji.name || r.emoji === reaction.emoji.id));
                if (role)
                    member.roles.remove(role.role);
            }
        }
    } catch (error) {
        console.log(`Error during messageReactionRemove event:\n${error.stack}`);
    }
});

client.on("error", async (error) => {
    console.log(`Connection error: ${error}`);
});

keyv.on("error", err => {
    console.log(`Keyv connection error: ${err.stack}`);
});