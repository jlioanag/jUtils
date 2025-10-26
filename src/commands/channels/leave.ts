import { prisma } from "@/index";
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  GuildMember,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Choose a game channel to leave.")
    .addStringOption((option) =>
      option
        .setName("game")
        .setDescription("The game you want to leave")
        .setRequired(true)
        .setAutocomplete(true),
    ),
  async autocomplete(interaction: AutocompleteInteraction) {
    console.log("[DEBUG] Autocomplete interaction received");
    const userInput = interaction.options.getFocused();
    const matchingItems = await prisma.gameRole.findMany({
      where: { title: { contains: userInput } },
      take: 5,
    });
    await interaction.respond(
      matchingItems.map((item) => ({ name: item.title, value: item.title })),
    );
  },
  async execute(interaction: ChatInputCommandInteraction) {
    const game = interaction.options.getString("game", true);

    prisma.gameRole
      .findFirst({ where: { title: game } })
      .then(async (gameRole) => {
        if (!gameRole) {
          await interaction.reply({
            content: `❌ The game \`${game}\` does not exist or is not configured properly.`,
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        const roleId = gameRole.roleId;
        const member = interaction.member as GuildMember;

        console.log(
          `[DEBUG] Recieved interaction for join command from user ${member.user.username} for game ${game}`,
        );

        if (!member.roles.cache.has(roleId)) {
          await interaction.reply({
            content: `You are not in the ${game} channel!`,
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        try {
          await member.roles.remove(roleId);
          await interaction.reply({
            content: `✅ You have been removed to the ${game} channel!`,
            flags: MessageFlags.Ephemeral,
          });
        } catch (error) {
          console.error(error);
          await interaction.reply({
            content: `❌ Failed to unassign \`role:${roleId}\` for \`game:${game}\`.`,
            flags: MessageFlags.Ephemeral,
          });
        }
      })
      .catch(async () => {
        await interaction.reply({
          content: `❌ The game \`${game}\` does not exist or is not configured properly.`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      });
  },
};
