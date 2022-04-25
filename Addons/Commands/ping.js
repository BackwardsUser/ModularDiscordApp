module.exports = {
    data: {
        Name: "ping",
        Author: "BackwardsUser",
        Description: "Check the bots Latency",
    },
    async execute(client, message, args) {
        await message.reply(`PONG! The bots latency is ${client.ws.ping}ms!`);
    },
};