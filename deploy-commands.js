const { REST, Routes } = require('discord.js');
const { token } = require('./config.json');
const fs = require('fs');

const clientId = 'THE BOTS USER ID';
const guildId = 'YOUR SERVERS ID';

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Registering slash commands - please wait');
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );
    console.log('commands registered!');
  } catch (error) {
    console.error(error);
  }
})();
