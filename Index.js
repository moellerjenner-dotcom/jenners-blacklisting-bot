const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const config = require('./config.json');
const fs = require('fs');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers
    ]
});

// Simple file-based database (works on Render)
const DB_FILE = './database.json';

// Initialize database
let database = { users: [] };

// Load database
function loadDatabase() {
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            database = JSON.parse(data);
            console.log('✅ Database loaded');
        } else {
            saveDatabase();
        }
    } catch (e) {
        console.log('Creating new database');
        saveDatabase();
    }
}

// Save database
function saveDatabase() {
    fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2));
    console.log('💾 Database saved');
}

// Check admin role
function hasAdminRole(member) {
    return member.roles.cache.has(config.adminRoleId) || member.permissions.has('Administrator');
}

// Find user in database
function findUser(userId) {
    return database.users.find(u => u.userId === parseInt(userId));
}

client.once('ready', () => {
    console.log(`✅ Bot online as ${client.user.tag}`);
    loadDatabase();
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    
    if (!hasAdminRole(interaction.member)) {
        return interaction.reply({ 
            content: '❌ You need admin role to use this!', 
            ephemeral: true 
        });
    }

    const { commandName, options } = interaction;

    // WHITELIST
    if (commandName === 'whitelist') {
        const userId = options.getInteger('userid');
        const username = options.getString('username');
        
        // Remove old entry
        database.users = database.users.filter(u => u.userId !== userId);
        
        // Add new
        database.users.push({
            userId: userId,
            username: username,
            status: 'whitelisted',
            reason: '',
            addedBy: interaction.user.tag,
            addedAt: new Date().toISOString()
        });
        
        saveDatabase();
        
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('✅ User Whitelisted')
            .addFields(
                { name: 'User', value: `${username} (${userId})`, inline: true },
                { name: 'Added By', value: interaction.user.tag, inline: true }
            )
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }

    // BLACKLIST
    if (commandName === 'blacklist') {
        const userId = options.getInteger('userid');
        const username = options.getString('username');
        const reason = options.getString('reason') || 'No reason provided';
        
        database.users = database.users.filter(u => u.userId !== userId);
        database.users.push({
            userId: userId,
            username: username,
            status: 'blacklisted',
            reason: reason,
            addedBy: interaction.user.tag,
            addedAt: new Date().toISOString()
        });
        
        saveDatabase();
        
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('⛔ User Blacklisted')
            .addFields(
                { name: 'User', value: `${username} (${userId})`, inline: true },
                { name: 'Reason', value: reason, inline: false },
                { name: 'Added By', value: interaction.user.tag, inline: true }
            )
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }

    // BAN
    if (commandName === 'ban') {
        const userId = options.getInteger('userid');
        const username = options.getString('username');
        const reason = options.getString('reason');
        
        database.users = database.users.filter(u => u.userId !== userId);
        database.users.push({
            userId: userId,
            username: username,
            status: 'banned',
            reason: reason,
            addedBy: interaction.user.tag,
            addedAt: new Date().toISOString()
        });
        
        saveDatabase();
        
        const embed = new EmbedBuilder()
            .setColor(0x8B0000)
            .setTitle('🔨 User Banned')
            .addFields(
                { name: 'User', value: `${username} (${userId})`, inline: true },
                { name: 'Reason', value: reason, inline: false },
                { name: 'Banned By', value: interaction.user.tag, inline: true }
            )
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }

    // UNBLACKLIST / UNBAN
    if (commandName === 'unblacklist' || commandName === 'unban') {
        const userId = options.getInteger('userid');
        database.users = database.users.filter(u => u.userId !== userId);
        saveDatabase();
        
        await interaction.reply({ 
            content: `✅ Removed user ${userId} from list`,
            ephemeral: true 
        });
    }

    // CHECK USER
    if (commandName === 'checkuser') {
        const userId = options.getInteger('userid');
        const user = findUser(userId);
        
        if (user) {
            const embed = new EmbedBuilder()
                .setColor(user.status === 'whitelisted' ? 0x00FF00 : 0xFF0000)
                .setTitle(`User: ${user.username}`)
                .addFields(
                    { name: 'User ID', value: userId.toString(), inline: true },
                    { name: 'Status', value: user.status, inline: true },
                    { name: 'Reason', value: user.reason || 'None', inline: false },
                    { name: 'Added By', value: user.addedBy, inline: true },
                    { name: 'Added At', value: new Date(user.addedAt).toLocaleString(), inline: true }
                )
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.reply({ 
                content: '❌ User not found in database',
                ephemeral: true 
            });
        }
    }
});

client.login(config.token);
