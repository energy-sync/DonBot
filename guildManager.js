const Keyv = require("keyv");
const { mongoPath, defaultPrefix } = require("./config.json");

let guilds = {};
let mongoGuilds = new Keyv({uri: mongoPath, collection: "guilds"});

exports.addGuild = async (guild) => {
    const guildDefaults = {
        id: guild.id,
        name: guild.name,
        prefix: defaultPrefix,
        logChannel: undefined,
        welcomeChannel: undefined,
        welcomeMessage: undefined,
        verifyRole: undefined,
        muteRole: undefined,
        roleMenus: []
    }

    if (!guilds[guild.id]) {
        let mongoGuild = await mongoGuilds.get(guild.id);
        if (!mongoGuild) {
            await mongoGuilds.set(guild.id, guildDefaults);
            guilds[guild.id] = guildDefaults;
        }
        else guilds[guild.id] = mongoGuild;
    }
    return guilds[guild.id];
}

exports.getGuild = async (guild) => {
    if (!guilds[guild.id]) {
        await this.addGuild(guild);
    }
    return guilds[guild.id];
}

exports.updateGuild = async (guild) => {
    let g = this.getGuild(guild.id);
    if (g) {
        updatedGuild = {
            id: guild.id,
            name: guild.name,
            prefix: guild.prefix,
            logChannel: guild.logChannel,
            welcomeChannel: guild.welcomeChannel,
            welcomeMessage: guild.welcomeMessage,
            verifiedRole: guild.verifyRole,
            muteRole: guild.muteRole,
            roleMenus: guild.roleMenus
        };

        await mongoGuilds.set(guild.id, updatedGuild);
        guilds[guild.id] = updatedGuild
    }
}

exports.guilds = guilds;