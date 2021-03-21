module.exports = {
    name: "ping",
    description: "Pong!",
    usage: "ping",
    run: async (message, args) => {
        message.channel.send("Pong!");
    }
}