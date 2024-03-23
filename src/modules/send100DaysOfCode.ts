import { ExtendedClient } from "../interfaces/ExtendedClient";
import { errorHandler } from "../utils/errorHandler";

/**
 * Sends the reminder for the 100 days of code.
 *
 * @param {ExtendedClient} CamperChan The CamperChan's Discord instance.
 */
export const send100DaysOfCode = async (CamperChan: ExtendedClient) => {
  try {
    const channel =
      CamperChan.homeGuild.channels.cache.get("697124514982527086") ||
      (await CamperChan.homeGuild.channels.fetch("697124514982527086"));
    if (!channel || !("send" in channel)) {
      await CamperChan.config.debugHook.send(
        "Cannot find 100 days of code channel."
      );
      return;
    }

    await channel.send({
      content: `## 100 Days of Code~!

Heya <@&1189043630489473074> friends! This is your daily reminder to post your progress update.

- Tell us what you did today! Did you write code? Read documentation? Something else?
- Are you stuck on something? Ask in https://canary.discord.com/channels/692816967895220344/718214639669870683, and we'll be happy to help!
- Want to chat with your fellow developers? Head over to https://canary.discord.com/channels/692816967895220344/693145545878929499!
- Make sure to encourage and support your fellow https://canary.discord.com/channels/692816967895220344/697124514982527086 participants!

To opt in/out of these notifications, visit <id:customize>.`
    });
  } catch (err) {
    await errorHandler(CamperChan, "send 100 days of code module", err);
  }
};
