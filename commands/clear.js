const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Deletes a specific amount of messages in the channel')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('How many messages should be deleted? (1–100)')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');

    if (amount < 1 || amount > 100) {
      return await interaction.reply({ content: 'Insert a number from 1 to 100.', ephemeral: true });
    }

    try {
      const deleted = await interaction.channel.bulkDelete(amount, true);
      await interaction.reply({ content: `${deleted.size} messages deleted.`, ephemeral: true });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Error while deleting messages.', ephemeral: true });
    }
  }
};
