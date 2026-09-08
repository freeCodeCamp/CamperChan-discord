import { errorHandler } from "../utils/errorHandler.js";
import type { ExtendedClient } from "../interfaces/extendedClient.js";

/**
 * Sends the reminder for the 100 days of code.
 * @param camperChan - The camperChan's Discord instance.
 */
export const send100DaysOfCode
 = async(camperChan: ExtendedClient): Promise<void> => {
   try {
     const channel
      = camperChan.homeGuild.channels.cache.get("697124514982527086")
      ?? await camperChan.homeGuild.channels.fetch("697124514982527086");
     if (!channel || !("send" in channel)) {
       await camperChan.config.debugHook.send(
         "Cannot find 100 days of code channel.",
       );
       return;
     }

     await channel.send({
       content: `## 100 Days of Code~!

Heya <@&1189043630489473074> friends! This is your daily reminder to post your progress update.

- Tell us what you did today! Did you write code? Read documentation? Something else?
- Are you stuck on something? Ask in <#718214639669870683> for help with the freeCodeCamp curriculum or <#1535346359711039498> for general programming questions.
- Want to chat with your fellow developers? Head over to https://canary.discord.com/channels/692816967895220344/693145545878929499!
- Make sure to encourage and support your fellow https://canary.discord.com/channels/692816967895220344/697124514982527086 participants!

To opt in/out of these notifications, visit <id:customize>.`,
     });
   } catch (error) {
     await errorHandler(camperChan, "send 100 days of code module", error);
   }
 };
