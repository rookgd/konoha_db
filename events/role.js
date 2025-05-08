const config = require('../config.json');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    try {
      const role = member.guild.roles.cache.get(config.rolleId);
      if (role) {
        await member.roles.add(role);
        console.log(`Role ${role.name} has been given to ${member.user.tag}.`);
      } else {
        console.log('Role not found.');
      }
    } catch (error) {
      console.error('Error assigning role:', error);
    }
  }
};