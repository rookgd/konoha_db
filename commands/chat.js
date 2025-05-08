const { SlashCommandBuilder } = require('discord.js');
const { OpenAI } = require('openai');
const config = require('../config.json'); // save your OpenAI API Key there please

const openai = new OpenAI({
  apiKey: config.openaiApiKey
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName('question')
    .setDescription('Ask the bot a question')
    .addStringOption(option =>
      option.setName('input')
        .setDescription('What would you like to know?')
        .setRequired(true)),
        
        async execute(interaction) {
          const userInput = interaction.options.getString('input');
        
          await interaction.deferReply();
          
          try {
            const completion = await openai.chat.completions.create({
              model: 'gpt-3.5-turbo',
              messages: [{ role: 'user', content: userInput }]
            });
        
            const reply = completion.choices[0].message.content;
            await interaction.editReply(reply.slice(0, 2000));
          } catch (err) {
            console.error(err);
            await interaction.editReply('Error while contacting OpenAI.');
          }
        }
};
