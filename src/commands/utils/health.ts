import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const healthCommand = {
    data: new SlashCommandBuilder()
        .setName("health")
        .setDescription("Check if the bot is healthy"),
    
    async execute (interaction: ChatInputCommandInteraction) {
        console.log("[DEBUG] Recieved interaction for health command");
        await interaction.reply({
            content: "I am healthy!",
            ephemeral: true,
        });
    },
};

export default healthCommand;