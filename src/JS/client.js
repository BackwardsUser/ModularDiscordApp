// Imports
const { Client, Intents } = require('discord.js')

// Exports
module.exports = class client {
    // Class Constructor
    constructor(token) {
        // Creating a new Client
        const client = new Client({
            intents: [
                "DIRECT_MESSAGES",
                "DIRECT_MESSAGE_REACTIONS",
                "DIRECT_MESSAGE_TYPING",
                "GUILDS",
                "GUILD_BANS",
                "GUILD_EMOJIS_AND_STICKERS",
                "GUILD_INTEGRATIONS",
                "GUILD_INVITES",
                "GUILD_MEMBERS",
                "GUILD_MESSAGES",
                "GUILD_MESSAGE_REACTIONS",
                "GUILD_MESSAGE_TYPING",
                "GUILD_PRESENCES",
                "GUILD_VOICE_STATES",
                "GUILD_WEBHOOKS",
            ],
        });
        // Logging into the bot
        client.login(token);

        // Setting Data
        this.client = client;
        this.token = token;
    }


}