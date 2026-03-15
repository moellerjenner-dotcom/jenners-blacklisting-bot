const { REST, Routes } = require('discord.js');
const config = require('./config.json');

const commands = [
    {
        name: 'whitelist',
        description: 'Add user to whitelist',
        options: [
            {
                name: 'userid',
                description: 'Roblox User ID',
                type: 4,
                required: true
            },
            {
                name: 'username',
                description: 'Roblox Username',
                type: 3,
                required: true
            }
        ]
    },
    {
        name: 'blacklist',
        description: 'Blacklist user',
        options: [
            {
                name: 'userid',
                description: 'Roblox User ID',
                type: 4,
                required: true
            },
            {
                name: 'username',
                description: 'Roblox Username',
                type: 3,
                required: true
            },
            {
                name: 'reason',
                description: 'Reason',
                type: 3,
                required: false
            }
        ]
    },
    {
        name: 'ban',
        description: 'Ban user',
        options: [
            {
                name: 'userid',
                description: 'Roblox User ID',
                type: 4,
                required: true
            },
            {
                name: 'username',
                description: 'Roblox Username',
                type: 3,
                required: true
            },
            {
                name: 'reason',
                description: 'Reason',
                type: 3,
                required: true
            }
        ]
    },
    {
        name: 'unblacklist',
        description: 'Remove from blacklist',
        options: [
            {
                name: 'userid',
                description: 'Roblox User ID',
                type: 4,
                required: true
            }
        ]
    },
    {
        name: 'unban',
        description: 'Unban user',
        options: [
            {
                name: 'userid',
                description: 'Roblox User ID',
                type: 4,
                required: true
            }
        ]
    },
    {
        name: 'checkuser',
        description: 'Check user status',
        options: [
            {
                name: 'userid',
                description: 'Roblox User ID',
                type: 4,
                required: true
            }
        ]
    }
];

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        console.log('Registering commands...');
        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commands }
        );
        console.log('✅ Commands registered!');
    } catch (error) {
        console.error(error);
    }
})();
