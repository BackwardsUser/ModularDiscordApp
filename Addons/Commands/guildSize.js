module.exports = {
    data: {
        Name: "ping",
        Author: "Backwards",
        Description: "Check the number of guilds the bot is in."
    },
    async execute(client) {
        await message.reply(`The bot is in ${client.guilds.cache.size}`)
    }
}