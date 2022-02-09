const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    // Create a new slash command
    // You can add whatever you would like, and this will make a standard slash command
    // Message commands (!Ping) will not be supported as it is deprecated by discord

    // Command name should be flatcase. (no spaces no special characters, all lowercase.)

    data: new SlashCommandBuilder()
        .setName("examplecommand")
        .setDescription("Just an Example Command"),
    async execute(interaction) {
        // Code goes here
        await interaction.reply("This is an example command!")
    }
};

// Learn more here, https://discord.js.org/#/docs/discord.js/stable/general/welcome