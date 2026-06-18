import { Events, Client } from "discord.js";

import scheduleMisatoMonday from "./misatoMonday";
import scheduleFoenemFriday from "./foenemFriday";
import scheduleModrinthDaily from "./modrinthDaily";

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

    try {
      scheduleFoenemFriday(client);
    } catch (err) {
      console.error("Failed to schedule Foenem Friday:", err);
    }

    try {
      scheduleModrinthDaily(client);
    } catch (err) {
      console.error("Failed to schedule Modrinth daily:", err);
    }
  },
};
