module.exports = {
    data: {
        Name: "examplecommand",
        Author: "BackwardsUser",
        Description: "Just an Example Command"
    },
    async execute(client, message, args) {
        // Code goes here
        await message.reply("This is an example command!")
    }
};