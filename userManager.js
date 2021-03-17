const Keyv = require("keyv");
const { mongoPath } = require("./config.json");

let users = {};
let mongoUsers = new Keyv({uri: mongoPath, collection: "users"});

exports.addUser = async (user) => {
    const userDefaults = {
        id: user.id,
        tag: user.tag,
        realName: undefined,
        warns: []
    }

    if (!users[user.id]) {
        let mongoUser = await mongoUsers.get(user.id);
        if (!mongoUser) {
            await mongoUsers.set(user.id, userDefaults);
            users[user.id] = userDefaults;
        }
        else users[user.id] = mongoUser;
    }
    return users[user.id];
}

exports.getUser = async (user) => {
    if (!users[user.id]) {
        await this.addUser(user);
    }
    return users[user.id];
}

exports.updateUser = async (user) => {
    let g = this.getUser(user.id);
    if (g) {
        updatedUser = {
            id: user.id,
            tag: user.tag,
            realName: user.realName,
            warns: user.warns
        };

        await mongoUsers.set(user.id, updatedUser);
        users[user.id] = updatedUser
    }
}

exports.users = users;