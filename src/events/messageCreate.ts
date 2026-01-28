import { Events, Message } from "discord.js";

const TWITTER_REGEX = /https?:\/\/(?:www\.)?(?:twitter|x)\.com\/([^\s\/]+)\/status(?:es)?\/([0-9]+)/gi;

module.exports = {
  name: Events.MessageCreate,
  async execute(message: Message) {
    try {
      if (!message.content) return;
      if (message.author?.bot) return;

      const matches = [...message.content.matchAll(TWITTER_REGEX)];
      if (!matches.length) return;

      // limit to first 10 matches to avoid overly long replies
      const conversions = matches.slice(0, 10).map((m) => {
        const original = m[0];
        const fxtwitter = original.replace(/https?:\/\/(?:www\.)?(?:twitter|x)\.com/, "https://fxtwitter.com");
        return { original, fxtwitter };
      });

      // Build a concise reply listing conversions (fxtwitter only per user preference)
      const replyLines = conversions.map((c) => `${c.original} -> ${c.fxtwitter}`);

      // Reply publicly in the same channel
      await message.reply({ content: replyLines.join("\n") });
    } catch (err) {
      console.error("Error in messageCreate event:", err);
    }
  },
};
