import { REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const commands: any[] = [];
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  // Grab all the command files from the commands directory you created earlier
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath).default;
    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
      );
    }
  }
}

// Construct and prepare an instance of the REST module
const discord_token: string = process.env.DISCORD_TOKEN!;
console.log(`Discord token: ${discord_token}`);
const rest = new REST().setToken(discord_token);

// and deploy your commands!
(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`,
    );
    const client_id: string = process.env.CLIENT_ID!;
    const guild_id: string = process.env.GUILD_ID!;
    // The put method is used to fully refresh all commands in the guild with the current set
    const data: any = await rest.put(
      // Registers commands to a specific guild/server
      // (run if you want to register commands faster for testing purposes, and comment out the other line)
      Routes.applicationGuildCommands(client_id, guild_id),

      // Registers commands globally across all guilds/servers
      // Routes.applicationCommands(client_id),

      { body: commands },
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`,
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(`ERROR: ${error}`);
  }
})();
