import { Events, Message } from "discord.js";

type Provider = {
  name: string;
  regex: RegExp;
  transform: (original: string, match: RegExpMatchArray) => string;
};

const providers: Provider[] = [
  {
    name: "twitter",
    regex:
      /https?:\/\/(?:www\.)?(?:twitter|x)\.com\/([^\s\/]+)\/status(?:es)?\/([0-9]+)/gi,
    transform: (original) =>
      original.replace(
        /https?:\/\/(?:www\.)?(?:twitter|x)\.com/,
        "https://fxtwitter.com",
      ),
  },
  {
    name: "reddit",
    regex: /https?:\/\/(?:www\.)?reddit\.com(\/[^\s]*)/gi,
    transform: (_original, match) => {
      const path = match[1] || "";
      return `https://www.rxddit.com${path}`;
    },
  },
];

module.exports = {
  name: Events.MessageCreate,
  async execute(message: Message) {
    try {
      if (!message.content) return;
      if (message.author?.bot) return;

      const conversions: Array<{
        original: string;
        converted: string;
        provider: string;
      }> = [];
      const seen = new Set<string>();

      for (const provider of providers) {
        // collect matches for this provider
        const matches = [...message.content.matchAll(provider.regex)];
        for (const m of matches) {
          if (conversions.length >= 10) break; // overall cap
          const original = m[0];
          if (seen.has(original)) continue;
          seen.add(original);
          const converted = provider.transform(original, m as RegExpMatchArray);
          conversions.push({ original, converted, provider: provider.name });
        }
        if (conversions.length >= 10) break;
      }

      if (!conversions.length) return;

      const replyLines = conversions.map((c) => c.converted);

      await message
        .reply({
          content: `${message.author.mention}:\n\n` + replyLines.join("\n"),
        })
        .then(() => {
          message.delete().catch((err: unknown) => {
            console.error(
              `Failed to delete original message: ${(err as Error).message}`,
              "Events.MessageCreate",
            );
          });
        })
        .catch((err: unknown) => {
          const errMsg: string = (err as Error).message;
          if (errMsg.includes("Missing Permissions")) return;
          console.error(
            `Failed to reply: ${(err as Error).message}`,
            "Events.MessageCreate",
          );
        });
    } catch (err) {
      console.error("Error in messageCreate event:", err);
    }
  },
};
