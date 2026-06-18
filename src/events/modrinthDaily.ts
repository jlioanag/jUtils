import {
  Client,
  EmbedBuilder,
  ChannelType,
  TextChannel,
  GuildBasedChannel,
} from "discord.js";
import https from "https";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { postEmbedToGuild } from "../utils/scheduler";

const API_URL = "https://api.modrinth.com/v2/project/cobbleverse/version";
const PROJECT_URL = "https://modrinth.com/project/cobbleverse";
const TIMEZONE = "America/New_York"; // follow project's default timezone

function msUntilNextMidnight(timezone: string = TIMEZONE): number {
  const now = new Date();
  const nowInTz = utcToZonedTime(now, timezone);

  const year = nowInTz.getFullYear();
  const month = nowInTz.getMonth();
  const date = nowInTz.getDate();

  // target is today at 00:00 local time
  let localTarget = new Date(year, month, date, 0, 0, 0, 0);
  let targetInstant = zonedTimeToUtc(localTarget, timezone);

  // If we've already passed today's midnight in the target timezone, schedule for tomorrow
  if (nowInTz.getTime() >= localTarget.getTime()) {
    const nextLocal = new Date(year, month, date + 1, 0, 0, 0, 0);
    targetInstant = zonedTimeToUtc(nextLocal, timezone);
  }

  return targetInstant.getTime() - now.getTime();
}

function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", (err) => reject(err));
  });
}

function truncate(str: string, max = 3800) {
  if (str.length <= max) return str;
  return str.slice(0, max - 3) + "...";
}

function buildEmbedFromVersion(version: any): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("Cobbleverse - Latest Version")
    .setURL(PROJECT_URL)
    .setColor(0x00b894)
    .setTimestamp(new Date());

  // Friendly fields if present
  const versionNumber =
    version?.version_number ?? version?.name ?? version?.version ?? "N/A";
  const datePublished =
    version?.date_published ?? version?.published ?? version?.uploaded ?? null;
  const changelog = version?.changelog ?? version?.description ?? null;
  const gameVersions = Array.isArray(version?.game_versions)
    ? version.game_versions.join(", ")
    : null;

  const fields: { name: string; value: string; inline?: boolean }[] = [];
  fields.push({ name: "Version", value: String(versionNumber), inline: true });
  if (datePublished)
    fields.push({
      name: "Published",
      value: String(datePublished),
      inline: true,
    });
  if (gameVersions)
    fields.push({ name: "Game Versions", value: gameVersions, inline: true });

  if (fields.length) embed.addFields(...fields);

  // Add changelog or description if available
  if (changelog) {
    // keep within embed field limits
    embed.addFields({
      name: "Changelog",
      value: truncate(String(changelog), 1000),
    });
  }

  return embed;
}

export async function runModrinthCheck(client: Client): Promise<number> {
  try {
    const json = await fetchJson(API_URL);
    if (!Array.isArray(json) || json.length === 0) {
      console.warn("Modrinth response was not an array or was empty");
      return 0;
    }

    const latest = json[0];
    const embed = buildEmbedFromVersion(latest);

    let postedCount = 0;

    for (const [, guild] of client.guilds.cache) {
      try {
        const channel = guild.channels.cache.find(
          (c: GuildBasedChannel) =>
            c.type === ChannelType.GuildText && c.name === "general",
        ) as TextChannel | undefined;

        if (channel) {
          await postEmbedToGuild(channel, embed, "Modrinth Daily");
          postedCount++;
        }
      } catch (err) {
        console.error(
          `Error posting Modrinth embed to guild ${guild.id}:`,
          err,
        );
      }
    }

    return postedCount;
  } catch (err) {
    console.error("Failed to fetch Modrinth data:", err);
    throw err;
  }
}

export function scheduleModrinthDaily(client: Client) {
  async function scheduleOnce() {
    const delay = msUntilNextMidnight(TIMEZONE);
    const sec = Math.max(0, Math.floor(delay / 1000));
    const hrs = Math.floor(sec / 3600);
    console.log(`Scheduling Modrinth daily check in ~${hrs}h (${sec} seconds)`);

    setTimeout(async () => {
      console.log("Running Modrinth daily check");
      try {
        const posted = await runModrinthCheck(client);
        console.log(`Modrinth check posted to ${posted} channels`);
      } catch (err) {
        console.error("Failed to run Modrinth check:", err);
      } finally {
        // Re-schedule for next midnight
        scheduleOnce();
      }
    }, delay);
  }

  // start scheduling
  try {
    scheduleOnce();
  } catch (err) {
    console.error("Failed to start Modrinth daily scheduler:", err);
  }
}

export default scheduleModrinthDaily;
