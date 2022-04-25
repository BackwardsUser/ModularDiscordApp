module.exports = {
    data: {
        Name: "anothercommand",
        Author: "BackwardsUser",
        Description: "Just another Example Command"
    },
    async execute(client, message, args) {
        // Code goes here
        await message.reply("This is an example command!")
    }
};