import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  Client,
} from "discord.js";
import { runModrinthCheck } from "../../events/modrinthDaily";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("modrinth-debug")
    .setDescription("Run Modrinth fetch and post to guilds (debug)"),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      const client = interaction.client as Client;
      const posted = await runModrinthCheck(client);
      await interaction.editReply({
        content: `Modrinth check completed. Posted to ${posted} guild(s).`,
      });
    } catch (err) {
      console.error("Error running modrinth debug command:", err);
      await interaction.editReply({
        content: `Failed to run Modrinth check: ${(err as Error).message}`,
      });
    }
  },
};
