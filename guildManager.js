const Keyv = require("keyv");
const { mongoPath } = require("./config.json");

let guilds = {};
let mongoGuilds = new Keyv({uri: mongoPath, collection: "guilds"});

exports.addGuild = async (guild) => {
    const guildDefaults = {
        id: guild.id,
        name: guild.name,
        prefix: "?"
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
            prefix: guild.prefix
        };

        await mongoGuilds.set(guild.id, updatedGuild);
        guilds[guild.id] = updatedGuild
    }
}

exports.guilds = guilds;