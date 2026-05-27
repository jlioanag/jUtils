import { Client, EmbedBuilder } from "discord.js";
import { scheduleRecurringEvent } from "../utils/scheduler";

const GIF_URL = "https://i.imgur.com/3WeiSsS.gif";

export function scheduleMisatoMonday(client: Client) {
  const embedFactory = () =>
    new EmbedBuilder()
      .setTitle("It's Misato Monday!")
      .setImage(GIF_URL)
      .setColor(0xff69b4);

  // Monday = 1, 5 PM (17:00)
  scheduleRecurringEvent(client, 1, embedFactory, "Misato Monday", 17, 0);
}

export default scheduleMisatoMonday;
