module.exports = {

	// Events:

	// apiRequest, apiResponse, applicationCommandCreate(D), applicationCommandDelete(D), applicationCommandUpdate(D),
	// channelCreate, channelDelete, channelPinsUpdate, channelUpdate, debug, emojiCreate, emojiDelete, emojiUpdate,
	// error, guildBanAdd, guildBanRemove, guildCreate, guildDelete, guildIntegrationUpdate, guildMemberAdd,
	// guildMemberAvailable, guildMemberRemove, guildMemberChunk, guildMemberUpdate, guildScheduledEventCreate,
	// guildScheduledEventDelete, guildScheduledEventUpdate, guildScheduledEventUserAdd, guildScheduledEventUserRemove
	// guildUnavailable, guildUpdate, interaction(D), interactionCreate, invalidated, invalidRequestWarning,
	// inviteCreate, inviteDelete, message(D), messageCreate, messageDelete, messageDeleteBulk,
	// messageReactionAdd, messageReactionRemove, messageReactionRemoveAll, messageReactionRemoveEmoji, 
	// messageUpdate, presenceUpdate, rateLimit, ready, roleCreate, roleDelete, roleUpdate, shardDisconnect,
	// shardError, shardReady, shardReconnecting, shardResume, stageInstanceCreate, stageInstanceDelete,
	// stageInstanceUpdate, stickerCreate, stickerDelete, stickerUpdate, threadCreate, threadDelete,
	// threadListSync, threadMembersUpdate, threadMemberUpdate, threadUpdate, typingStart, userUpdate, voiceStateUpdate,
	// warn, webhookUpdate.

	// read more here, https://discord.js.org/#/docs/discord.js/stable/class/Client

	name: 'ready',
	description: 'Event "once" example',
	author: 'Backwards',
	once: true, // optional
	execute(client) {
		// This example is redundant as you won't see the console with this program,
		// however for those who have coded discord bots in the past, this should look familiar,
		// making an event for this program is no different than making one normally.

		// Code goes here.

		// console.log(`Logged in as ${client.user.tag}`)
	},
};