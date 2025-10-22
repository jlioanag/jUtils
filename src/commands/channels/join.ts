import { GAME_ROLES } from "@/defaults";
import {
  ChatInputCommandInteraction,
  GuildMember,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

const joinCommand = {
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Choose a game channel to join.")
    .addStringOption((option) =>
      option
        .setName("game")
        .setDescription("The game you want to join")
        .setRequired(true)
        .addChoices(
          GAME_ROLES.map((game) => ({
            name: game.title,
            value: game.id,
          })),
        ),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const game = interaction.options.getString("game", true);

    const roleId = GAME_ROLES.find((role) => role.id === game)?.roleId;
    if (!roleId) {
      await interaction.reply({
        content: `❌ The game \`${game}\` does not exist or is not configured properly.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const member = interaction.member as GuildMember;

    console.log(
      `[DEBUG] Recieved interaction for join command from user ${member.user.username} for game ${game}`,
    );

    if (member.roles.cache.has(roleId)) {
      await interaction.reply({
        content: `You are already in the ${game} channel!`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      await member.roles.add(roleId);
      await interaction.reply({
        content: `✅ You have been added to the ${game} channel!`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `❌ Failed to assign \`role:${roleId}\` for \`game:${game}\`.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

export default joinCommand;
