import { Events, Client } from "discord.js";

import scheduleMisatoMonday from "./misatoMonday";

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client: Client) {
    console.log(`Ready! Logged in as ${client.user?.tag}`);
    try {
      scheduleMisatoMonday(client);
    } catch (err) {
      console.error("Failed to schedule Misato Monday:", err);
    }
  },
};
