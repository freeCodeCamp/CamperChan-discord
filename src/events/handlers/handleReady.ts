import { ChannelType } from "discord.js";
import { scheduleJob } from "node-schedule";
import { send100DaysOfCode } from "../../modules/send100DaysOfCode.js";
import { instantiateServer } from "../../server/serve.js";
import { errorHandler } from "../../utils/errorHandler.js";
import type { ExtendedClient } from "../../interfaces/extendedClient.js";

/**
 * Logs a message to the debug hook when the camperChan is online.
 * @param camperChan - The camperChan's Discord instance.
 */
export const handleReady = async(
  camperChan: ExtendedClient,
): Promise<void> => {
  try {
    await camperChan.config.debugHook.send("camperChan Ready!");
    const homeGuild = await camperChan.guilds.
      fetch(camperChan.config.homeGuild).
      catch(() => {
        return null;
      });
    if (!homeGuild) {
      await camperChan.config.debugHook.send(
        "The home guild could not be loaded.",
      );
      return;
    }
    if (camperChan.homeGuild !== homeGuild) {
      camperChan.homeGuild = homeGuild;
    }
    const reportChannel = await homeGuild.channels.
      fetch(camperChan.config.reportChannel).
      catch(() => {
        return null;
      });
    if (!reportChannel) {
      await camperChan.config.debugHook.send(
        "The report channel could not be loaded.",
      );
      return;
    }
    if (!reportChannel.isTextBased()) {
      await camperChan.config.debugHook.send(
        "The report channel is not text based.",
      );
      return;
    }
    if (camperChan.reportChannel !== reportChannel) {
      camperChan.reportChannel = reportChannel;
    }
    const privateCategory = await homeGuild.channels.
      fetch(camperChan.config.privateCategory).
      catch(() => {
        return null;
      });
    if (!privateCategory) {
      await camperChan.config.debugHook.send(
        "The private category could not be loaded.",
      );
      return;
    }
    if (privateCategory.type !== ChannelType.GuildCategory) {
      await camperChan.config.debugHook.send(
        "The private category is not a category.",
      );
      return;
    }
    if (camperChan.privateCategory !== privateCategory) {
      camperChan.privateCategory = privateCategory;
    }
    await camperChan.config.debugHook.send("All channels loaded.");

    scheduleJob("0 9 * * *", async() => {
      await send100DaysOfCode(camperChan);
    });
    await instantiateServer(camperChan);
  } catch (error) {
    await errorHandler(camperChan, "client ready event", error);
  }
};
