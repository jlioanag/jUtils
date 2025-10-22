import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  MessageFlags,
} from "discord.js";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables from .env file
dotenv.config();

// Create a new Discord client instance
export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

const handlersDir = path.join(__dirname, "./handlers");
fs.readdirSync(handlersDir).forEach((handler) => {
  if (!handler.endsWith(".js") && !handler.endsWith(".ts")) return;
  require(`${handlersDir}/${handler}`)(client);
});

console.log(client.commands);

// Login to Discord with your bot token
client.login(process.env.DISCORD_TOKEN).catch((err) => {
  console.error("Failed to login:", err);
});
