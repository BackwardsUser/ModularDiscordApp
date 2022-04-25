module.exports = {
    name: 'guildUpdate',
    description: 'Test Event',
    author: 'Backwards',
    once: false,
    execute(client, newGuild, oldGuild){
        console.log(newGuild);
        console.log(oldGuild);
    }
}