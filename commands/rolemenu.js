const guildManager = require("../guildManager");

module.exports = {
    name: "rolemenu",
    description: "Creates a message that users can react to in order to get roles",
    usage: "rolemenu <create | replace | add | remove>",
    run: async (message, args) => {
        if (!message.member.hasPermission("MANAGE_GUILD")) {
            message.channel.send("You must have the \"Manage Server\" permission to use this command");
            return true;
        }

        if (args.length < 1) {
            message.channel.send("Usage: rolemenu <create | replace | add | remove>");
            return true;
        }

        switch (args[0]) {
            case "create":
                let title = args[1];
                args.splice(0, 2);
                if (args.length < 2 || args.length % 2 !== 0 || message.mentions.roles.length === 0) {
                    message.channel.send("Usage: rolemenu <create> <title> <@role> <emoji>, ...");
                    return true;
                }
        
                let roleMenu = {
                    messageID: undefined,
                    channelID: undefined,
                    reactions: []
                }
        
                fillRoleMenu({
                    title: title,
                    roleMenu: roleMenu,
                    usageString: "rolemenu <create> <title> <@role> <emoji>, ...",
                    args: args,
                    message: message
                });
        
                return true;

            case "replace":
                if (args.length < 4 || args.length % 2 !== 0 || message.mentions.roles.length === 0) {
                    message.channel.send("Usage: rolemenu replace <message link> <@role> <emoji>, ...");
                    return true;
                }

                if (args[1].indexOf("https://discord.com/channels/") === -1) {
                    message.channel.send("Usage: rolemenu replace <message link> <@role> <emoji>, ...");
                    return true;
                }

                //get message and channel IDs to fetch role menu message
                let shortenedLink = args[1].substring(args[1].indexOf("channels/") + 28);
                let channelID = shortenedLink.substring(0, shortenedLink.indexOf("/"));
                let messageID = shortenedLink.substring(shortenedLink.indexOf("/") + 1);
                let guild = await guildManager.getGuild(message.guild);
                let savedRoleMenu = guild.roleMenus.find(rm => rm.channelID === channelID && rm.messageID === messageID);
                if (!savedRoleMenu) {
                    message.channel.send("A role menu with that link does not exist");
                    return true;
                }
                let channel = message.client.channels.resolve(channelID);
                let menuMessage = channel.messages.resolve(messageID);
                if (!menuMessage) {
                    message.channel.send("That message cannot be found. It was probably deleted.");
                    return true;
                }

                args.splice(0, 2);

                let replaceRoleMenu = {
                    messageID: messageID,
                    channelID: channelID,
                    reactions: []
                }

                menuMessage.reactions.removeAll();

                fillRoleMenu({
                    roleMenu: replaceRoleMenu,
                    usageString: "rolemenu replace <message link> <@role> <emoji>, ...",
                    args: args,
                    message: message,
                    menuMessage, menuMessage
                });

                return true;

            case "add":
                if (args.length !== 4 || message.mentions.roles.length === 0) {
                    message.channel.send("Usage: rolemenu add <message link> <@role> <emoji>");
                    return true;
                }

                if (args[1].indexOf("https://discord.com/channels/") === -1) {
                    message.channel.send("Usage: rolemenu add <message link> <@role> <emoji>");
                    return true;
                }

                //get message and channel IDs to fetch role menu message
                let addShortenedLink = args[1].substring(args[1].indexOf("channels/") + 28);
                let addChannelID = addShortenedLink.substring(0, addShortenedLink.indexOf("/"));
                let addMessageID = addShortenedLink.substring(addShortenedLink.indexOf("/") + 1);
                let addGuild = await guildManager.getGuild(message.guild);
                let addSavedRoleMenu = addGuild.roleMenus.find(rm => rm.channelID === addChannelID && rm.messageID === addMessageID);
                if (!addSavedRoleMenu) {
                    message.channel.send("A role menu with that link does not exist");
                    return true;
                }
                let addChannel = message.client.channels.resolve(addChannelID);
                let addMenuMessage = addChannel.messages.resolve(addMessageID);
                if (!addMenuMessage) {
                    message.channel.send("That message cannot be found. It was probably deleted.");
                    return true;
                }

                args.splice(0, 2);

                addMenuMessage.reactions.removeAll();

                if (!args[0].includes("<@&")) {
                    message.channel.send("Usage: rolemenu add <message link> <@role> <emoji>");
                    return true;
                }
                let role = message.guild.roles.resolve(args[0].substring(args[0].indexOf("<@&") + 3, args[0].indexOf(">")));
                if (!role) {
                    message.channel.send("Usage: rolemenu add <message link> <@role> <emoji>");
                    return true;
                }
                let emoji = args[1].replace(/ /g, "");
                if (emoji.includes("<:")) {
                    emoji = emoji.substring(emoji.indexOf(":") + 1, emoji.indexOf(">"));
                    emoji = emoji.substring(emoji.indexOf(":") + 1);
                }

                //edit message
                let embed = addMenuMessage.embeds[0];
                embed.setDescription(embed.description += `\n\n${isNaN(emoji) ? emoji : message.client.emojis.resolve(emoji)}  **-**  ${role}\n\n`);
                await addMenuMessage.edit(embed);

                //add to role menu
                addGuild.roleMenus.find(rm => rm.messageID === addMessageID).reactions.push({role: role.id, emoji: emoji});
                guildManager.updateGuild(addGuild);

                //add reactions
                for (reaction of addGuild.roleMenus.find(rm => rm.messageID === addMessageID).reactions) {
                    try {
                        await addMenuMessage.react(reaction.emoji);
                    } catch (error) {
                        message.channel.send("Something went wrong. Please try again");
                        console.log(`\nError in rolemenu command:\n${error.stack}`);
                    }
                }
                
                return true;

            case "remove":
                if (args.length !== 3 || message.mentions.roles.length === 0) {
                    message.channel.send("Usage: rolemenu remove <message link> <@role>");
                    return true;
                }

                if (args[1].indexOf("https://discord.com/channels/") === -1) {
                    message.channel.send("Usage: rolemenu remove <message link> <@role>");
                    return true;
                }

                //get message and channel IDs to fetch role menu message
                let removeShortenedLink = args[1].substring(args[1].indexOf("channels/") + 28);
                let removeChannelID = removeShortenedLink.substring(0, removeShortenedLink.indexOf("/"));
                let removeMessageID = removeShortenedLink.substring(removeShortenedLink.indexOf("/") + 1);
                let removeGuild = await guildManager.getGuild(message.guild);
                let removeSavedRoleMenu = removeGuild.roleMenus.find(rm => rm.channelID === removeChannelID && rm.messageID === removeMessageID);
                if (!removeSavedRoleMenu) {
                    message.channel.send("A role menu with that link does not exist");
                    return true;
                }
                let removeChannel = message.client.channels.resolve(removeChannelID);
                let removeMenuMessage = removeChannel.messages.resolve(removeMessageID);
                if (!removeMenuMessage) {
                    message.channel.send("That message cannot be found. It was probably deleted.");
                    return true;
                }

                args.splice(0, 2);

                removeMenuMessage.reactions.removeAll();

                if (!args[0].includes("<@&")) {
                    message.channel.send("Usage: rolemenu remove <message link> <@role>");
                    return true;
                }
                let removeRole = message.guild.roles.resolve(args[0].substring(args[0].indexOf("<@&") + 3, args[0].indexOf(">")));
                if (!removeRole) {
                    message.channel.send("Usage: rolemenu remove <message link> <@role>");
                    return true;
                }

                let menuReactions = removeGuild.roleMenus.find(rm => rm.messageID === removeMessageID).reactions;

                //remove from role menu
                menuReactions.splice(menuReactions.findIndex(item => item.role === removeRole.id), 1);
                guildManager.updateGuild(removeGuild);

                //edit message
                let removeEmbed = removeMenuMessage.embeds[0];
                let roleList = "";
                for (r of menuReactions)
                    roleList += `\n\n${isNaN(r.emoji) ? r.emoji : message.client.emojis.resolve(r.emoji)}  **-**  <@&${r.role}>`;
                removeEmbed.setDescription(roleList);
                await removeMenuMessage.edit(removeEmbed);

                //add reactions
                for (reaction of menuReactions) {
                    try {
                        await removeMenuMessage.react(reaction.emoji);
                    } catch (error) {
                        message.channel.send("Something went wrong. Please try again");
                        console.log(`\nError in rolemenu command:\n${error.stack}`);
                    }
                }
                
                return true;
                
            default:
                return false;
        }
    }
}

//title, roleMenu, usageString, args, message, menuMessage
async function fillRoleMenu(options) {
    for (let i = 0; i < options.args.length - 1; i += 2) {
        if (!options.args[i].includes("<@&")) {
            options.message.channel.send(`Usage: ${options.usageString}`);
            return true;
        }
        let role = options.message.guild.roles.resolve(options.args[i].substring(options.args[i].indexOf("<@&") + 3, options.args[i].indexOf(">")));
        if (!role) {
            options.message.channel.send(`Usage: ${options.usageString}`);
            return true;
        }

        let emoji = options.args[i + 1].replace(/ /g, "");
        if (emoji.includes("<:")) {
            emoji = emoji.substring(emoji.indexOf(":") + 1, emoji.indexOf(">"));
            emoji = emoji.substring(emoji.indexOf(":") + 1);
        }
        
        options.roleMenu.reactions.push({
            role: role.id,
            emoji: emoji
        });
    }
    
    let msg = "";
    for (reaction of options.roleMenu.reactions) {
        msg += `${isNaN(reaction.emoji) ? reaction.emoji : options.message.client.emojis.resolve(reaction.emoji)}  **-**  <@&${reaction.role}>\n\n`;
    }

    let m;

    if (options.menuMessage) {
        //edit message
        let embed = options.menuMessage.embeds[0];
        embed.setDescription(msg);
        await options.menuMessage.edit(embed);
    }
    else {
        //send new message
        m = await options.message.channel.send({embed: {
            author: {
                name: options.title
            },
            description: msg
        }});
    }

    //update in database
    let guild = await guildManager.getGuild(options.message.guild);
    if (m) {
        options.roleMenu.messageID = m.id;
        options.roleMenu.channelID = m.channel.id;
        guild.roleMenus.push(options.roleMenu);
    }
    else {
        guild.roleMenus.find(rm => rm.messageID === options.roleMenu.messageID).reactions = options.roleMenu.reactions;
    }
    guildManager.updateGuild(guild);

    //add reactions
    for (reaction of options.roleMenu.reactions) {
        try {
            if (m)
                await m.react(reaction.emoji);
            else await options.menuMessage.react(reaction.emoji);
        } catch (error) {
            if (m)
                m.delete();
            else options.menuMessage.delete();
            options.message.channel.send("Something went wrong. Please try again");
            console.log(`\nError in rolemenu command:\n${error.stack}`);
        }
    }
}