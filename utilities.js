const Discord = require('discord.js');
const config = require('./config.json');

module.exports = {
    /**
    * Returns the user that is mentioned. Returns null or undefined if the user is not found, or if the mention is incorrectly formatted.
    * @param {message} message the message object being sent.
    * @param {string} lookingFor the string to be checked for a member mention.
    * @returns {Discord.GuildMember} the guild member to be found. Null or undefined if not found.
    */
    getUserFromMention: function (message, lookingFor) {
        if (!lookingFor) {
            return;
        }

        // First, we check if the mention is an incomplete mention.
        if (lookingFor.startsWith('@')) {
            lookingfor = lookingFor.substr(1);
        }

        // First, we check if the input is a User ID.
        let target = message.guild.members.cache.get(lookingFor);

        // Next, we look for a mention.
        if (!target && lookingFor.startsWith('<@') && lookingFor.endsWith('>')) {
            lookingFor = lookingFor.slice(2, -1);

            // Checks if the mentioned user has a nickname. If so, removes the beginning '!'.
            if (lookingFor.startsWith('!')) {
                lookingFor = lookingFor.slice(1);
            }
            return message.guild.members.cache.get(lookingFor);
        }

        // Finally, we look for partial names. For example, if you want to ping @bobthebuilder and only type in bob, it will return 
        // the first user it finds that contains 'bob' in their name.
        if (!target && lookingFor) {
            target = message.guild.members.cache.find(member => {
                return (member.displayName.toLowerCase().includes(lookingFor) || member.user.tag.toLowerCase().includes(lookingFor)) && !member.user.bot;
            });
        }
        return target;
    },

    /**
     * Returns the channel. Returns null or undefined if the channel is not found.
     * @param {message} message the message object being sent.
     * @param {string} lookingFor the string to be checked for a channel mention.
     * @returns {Discord.Channel} the channel lookingFor represents. Null or undefined if not found.
     */
    getChannelFromMention: function (message, lookingFor) {
        if (!lookingFor) {
            return;
        }

        // First, we have to make sure that the input is lowercase.
        lookingFor = lookingFor.toLowerCase();

        // Next, we shall see if a channel ID was directly inputted.
        var sendingChannel = message.guild.channels.cache.get(lookingFor);

        // If not, then, we look for the channel by name.
        if (!sendingChannel) {
            sendingChannel = message.guild.channels.cache.find(channel => channel.name.toLowerCase() === lookingFor && channel.type === 'text');
        }

        // If the name doesn't match, then it must be a mention. Looks for the channel id from a mention.
        if (!sendingChannel && lookingFor.startsWith('<#') && lookingFor.endsWith('>')) {
            lookingFor = lookingFor.slice(2, -1);
            return message.guild.channels.cache.get(lookingFor);
        }

        return sendingChannel;
    },

    /**
     * Sends a message in the channel, and deletes after config.delete_delay milliseconds.
     * Catches any errors with the request, such as the bot not having permissions to speak in that channel.
     * @param {Discord.channel} channel the channel to send the message in. 
     * @param {string} content the message to send.
     * @param {int} millis_before_delete how many milliseconds before deletion.
     */
    sendTimedMessage: function (channel, content, millis_before_delete) {
        channel.send(content)
            .then(msg => msg.delete({ timeout: (millis_before_delete || config.delete_delay) })
                .catch(error => channel.send(`Error: ${error}`)));
    },

    /**
     * Sends a message in the channel.
     * Catches any errors with the request, such as the bot not having permissions to speak in that channel.
     * @param {Discord.channel} channel the channel to send the message in. 
     * @param {string} content the message to send.
     */
    sendMessage: function (channel, content, messageArgs) {
        channel.send(content, messageArgs)
            .catch(error => console.log(error + " " + error.message));
    },

    /**
     * Deletes the message, catching any errors, such as lack of permissions, or if the message is already deleted.
     * @param {Discord.Message} message the message to be deleted
     */
    safeDelete: function (message) {
        if (message) {
            message.delete().catch(error => channel.send(`Error: ${error.message}`));
        }
    }
}