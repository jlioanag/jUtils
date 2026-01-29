import { Client, EmbedBuilder, ChannelType, TextChannel } from "discord.js";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";

const GIF_URL = "https://i.imgur.com/3WeiSsS.gif";

function msUntilNextMonday5pm(): number {
  const tz = "America/New_York"; // EST/EDT timezone
  const now = new Date();

  // Convert current instant to the target timezone to inspect local day/hour
  const nowInTz = utcToZonedTime(now, tz);
  const day = nowInTz.getDay();
  let daysUntil = (8 - day) % 7; // days until next Monday in tz

  const year = nowInTz.getFullYear();
  const month = nowInTz.getMonth();
  const date = nowInTz.getDate() + daysUntil;

  // Construct a Date object representing Monday at 17:00 in the target timezone
  const localTarget = new Date(year, month, date, 17, 0, 0, 0);
  let targetInstant = zonedTimeToUtc(localTarget, tz);

  // If it's already past 17:00 on Monday in the target timezone, schedule next week
  if (daysUntil === 0 && now.getTime() >= targetInstant.getTime()) {
    const nextLocal = new Date(year, month, date + 7, 17, 0, 0, 0);
    targetInstant = zonedTimeToUtc(nextLocal, tz);
  }

  return targetInstant.getTime() - now.getTime();
}

async function postMisatoToGuild(channel: TextChannel) {
  try {
    const embed = new EmbedBuilder()
      .setTitle("It's Misato Monday!")
      .setImage(GIF_URL)
      .setColor(0xff69b4);

    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error("Failed to post Misato Monday embed:", err);
  }
}

export function scheduleMisatoMonday(client: Client) {
  async function scheduleOnce() {
    const delay = msUntilNextMonday5pm();
    console.log(`Scheduling Misato Monday in ${Math.round(delay / 1000)}s`);

    setTimeout(async () => {
      for (const [, guild] of client.guilds.cache) {
        try {
          const channel = guild.channels.cache.find(
            (c: any) => c.type === ChannelType.GuildText && c.name === "general"
          ) as TextChannel | undefined;

          if (channel) await postMisatoToGuild(channel);
        } catch (err) {
          console.error(`Error posting to guild ${guild.id}:`, err);
        }
      }

      // Schedule next week's post
      scheduleOnce();
    }, delay);
  }

  scheduleOnce();
}

export default scheduleMisatoMonday;
