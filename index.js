const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Message, Partials.Channel, Partials.GuildMember]
});

// moderation
const badWords = config.bad_words.map(w => w.toLowerCase());
const admins = new Set(config.admins);
const warnCounts = new Map();

// slash commands
client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// bot online
client.once('ready', () => {
    console.log(`the bot is online ${client.user.tag}`);
});

// automatic role assignment
client.on('guildMemberAdd', async (member) => {
    try {
        const role = member.guild.roles.cache.get(config.roleId);
        if (role) {
            await member.roles.add(role);
            console.log(`The role ${role.name} was assigned to ${member.user.tag}.`);
        } else {
            console.log('The role was not found - please check roleId in config.json.');
        }
    } catch (error) {
        console.error('Error while assigning role:', error);
    }
});

// text-based moderation handling
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const content = message.content.toLowerCase();

    // Bad word filter
    if (badWords.some(word => content.includes(word))) {
        await message.delete();
        const userId = message.author.id;
        const currentWarn = (warnCounts.get(userId) || 0) + 1;
        warnCounts.set(userId, currentWarn);

        message.channel.send(`${message.author}, your role contained bad words and was deleted. (Warning #${currentWarn})`);
        return;
    }

    // !addbadword
    if (content.startsWith('!addbadword ')) {
        if (!admins.has(message.author.id)) {
            message.channel.send('You are not allowed to use this command.');
            return;
        }

        const word = content.slice(13).trim();
        if (badWords.includes(word)) {
            message.channel.send('This word is already on the list.');
        } else {
            badWords.push(word);
            message.channel.send(`The word  '${word}' has been added to the list.`);
        }
    }

    // !warns
    if (content === '!warns') {
        if (warnCounts.size === 0) {
            message.channel.send('Clean record!');
            return;
        }

        let report = 'Warns:\n';
        for (const [id, count] of warnCounts.entries()) {
            const user = await client.users.fetch(id).catch(() => null);
            const name = user ? user.username : `User-ID: ${id}`;
            report += `- ${name}: ${count}\n`;
        }
        message.channel.send(report);
    }
});

// slash command debugging in case something doesnt work
client.on('interactionCreate', async interaction => {
    console.log(`[DEBUG] Interaction received: ${interaction.commandName}`);

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error('Error:', error);
        await interaction.reply({ content: 'Something went wrong.', ephemeral: true });
    }
});

client.login(config.token);
