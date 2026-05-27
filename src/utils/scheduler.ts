import {
  Client,
  EmbedBuilder,
  ChannelType,
  TextChannel,
  GuildBasedChannel,
} from "discord.js";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";

/**
 * Calculate milliseconds until the next occurrence of a specific day at a specific time
 * @param targetDay - Day of the week (0 = Sunday, 1 = Monday, ..., 5 = Friday, ..., 6 = Saturday)
 * @param hour - Hour in 24-hour format (0-23)
 * @param minute - Minute (0-59)
 * @param timezone - IANA timezone string (default: "America/New_York")
 */
export function msUntilDayAtTime(
  targetDay: number,
  hour: number = 17,
  minute: number = 0,
  timezone: string = "America/New_York",
): number {
  const now = new Date();

  // Convert current instant to the target timezone to inspect local day/hour
  const nowInTz = utcToZonedTime(now, timezone);
  const currentDay = nowInTz.getDay();
  const currentHour = nowInTz.getHours();
  const currentMinute = nowInTz.getMinutes();

  // Calculate days until target day
  let daysUntil = (targetDay - currentDay + 7) % 7;

  const year = nowInTz.getFullYear();
  const month = nowInTz.getMonth();
  const date = nowInTz.getDate() + daysUntil;

  // Construct a Date object representing the target day at the specified time
  const localTarget = new Date(year, month, date, hour, minute, 0, 0);
  let targetInstant = zonedTimeToUtc(localTarget, timezone);

  // If it's the target day and we've already passed the scheduled time, schedule next week
  if (daysUntil === 0) {
    if (
      currentHour > hour ||
      (currentHour === hour && currentMinute >= minute)
    ) {
      const nextLocal = new Date(year, month, date + 7, hour, minute, 0, 0);
      targetInstant = zonedTimeToUtc(nextLocal, timezone);
    }
  }

  return targetInstant.getTime() - now.getTime();
}

/**
 * Format milliseconds into a human-readable string
 */
export function formatDelay(delayMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(delayMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  let rem = totalSeconds % 86400;
  const hours = Math.floor(rem / 3600);
  rem %= 3600;
  const minutes = Math.floor(rem / 60);
  const seconds = rem % 60;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Post an embed to a guild's general channel
 */
export async function postEmbedToGuild(
  channel: TextChannel,
  embed: EmbedBuilder,
  eventName: string,
): Promise<void> {
  try {
    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error(`Failed to post ${eventName} embed:`, err);
  }
}

/**
 * Schedule a recurring event at a specific day and time
 * @param client - Discord client
 * @param targetDay - Day of the week (0 = Sunday, 1 = Monday, ..., 5 = Friday, ..., 6 = Saturday)
 * @param hour - Hour in 24-hour format (default: 17 for 5 PM)
 * @param minute - Minute (default: 0)
 * @param embedFactory - Function that returns the embed to post
 * @param eventName - Name of the event for logging
 * @param timezone - IANA timezone string (default: "America/New_York")
 */
export function scheduleRecurringEvent(
  client: Client,
  targetDay: number,
  embedFactory: () => EmbedBuilder,
  eventName: string,
  hour: number = 17,
  minute: number = 0,
  timezone: string = "America/New_York",
): void {
  async function scheduleOnce() {
    const delay = msUntilDayAtTime(targetDay, hour, minute, timezone);
    const formattedDelay = formatDelay(delay);

    console.log(`Scheduling upcoming ${eventName} in ${formattedDelay}`);

    setTimeout(async () => {
      for (const [, guild] of client.guilds.cache) {
        try {
          const channel = guild.channels.cache.find(
            (c: GuildBasedChannel) =>
              c.type === ChannelType.GuildText && c.name === "general",
          ) as TextChannel | undefined;

          if (channel) {
            const embed = embedFactory();
            await postEmbedToGuild(channel, embed, eventName);
          }
        } catch (err) {
          console.error(`Error posting to guild ${guild.id}:`, err);
        }
      }

      // Schedule next occurrence
      scheduleOnce();
    }, delay);
  }

  scheduleOnce();
}
