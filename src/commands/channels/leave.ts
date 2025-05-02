import { GAME_ROLES } from "@/defaults";
import { ChatInputCommandInteraction, GuildMember, MessageFlags, SlashCommandBuilder } from "discord.js";

const leaveCommand = {
    data: new SlashCommandBuilder()
        .setName("leave")
        .setDescription("Choose a game channel to leave.")
        .addStringOption((option) =>
            option
                .setName("game")
                .setDescription("The game you want to leave")
                .setRequired(true)
                .addChoices(
                    Object.keys(GAME_ROLES).map((game: string) => ({
                        name: game,
                        value: game,
                    }))
                )
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        console.log("[DEBUG] Recieved interaction for leave command");

        const game = interaction.options.getString("game", true);

        const roleId = GAME_ROLES[game];
        const member = interaction.member as GuildMember;

        if (!member.roles.cache.has(roleId)) {
            await interaction.reply({
                content: `You are not in the ${game} channel!`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        try {
            await member.roles.remove(roleId);
            await interaction.reply({
                content: `✅ You have been removed to the ${game} channel!`,
                flags: MessageFlags.Ephemeral
            });
        }
        catch (error) {
            console.error(error);
            await interaction.reply({
                content: `❌ Failed to unassign \`role:${roleId}\` for \`game:${game}\`.`,
                flags: MessageFlags.Ephemeral
            });
        }
    },
};

export default leaveCommand;