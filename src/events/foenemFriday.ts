import { Client, EmbedBuilder } from "discord.js";
import { scheduleRecurringEvent } from "../utils/scheduler";

const FOENEM_GIF_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwbEqxnXXzTPTRemq-hdyI1In1kZi6MvkY3g&s";

export function scheduleFoenemFriday(client: Client) {
  const embedFactory = () =>
    new EmbedBuilder()
      .setTitle("It's Foenem Friday!")
      .setImage(FOENEM_GIF_URL)
      .setColor(0xffa500);

  // Friday = 5, 5 PM (17:00)
  scheduleRecurringEvent(client, 5, embedFactory, "Foenem Friday", 17, 0);
}

export default scheduleFoenemFriday;
