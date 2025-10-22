import { Client } from "discord.js";

const readyEvent = {
  name: "ready",
  once: true,
  execute(client: Client) {
    console.log(`Ready! Logged in as ${client.user?.tag}`);
  },
};

export default readyEvent;
