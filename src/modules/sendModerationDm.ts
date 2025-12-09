import { EmbedBuilder, type User } from "discord.js";
import { customSubstring } from "../utils/customSubstring.js";
import { errorHandler } from "../utils/errorHandler.js";
import type { ExtendedClient } from "../interfaces/extendedClient.js";
import type { ModerationActions } from "../interfaces/moderationActions.js";

/**
 * Generates a moderation embed notice and sends it to the user.
 * @param camperChan - CamperChan's Discord instance.
 * @param parameters - The parameters for the moderation action.
 * @param parameters.action - The moderation action taken.
 * @param parameters.user - The Discord user being moderated.
 * @param parameters.guildName - The name of the guild the moderation occurred in.
 * @param parameters.reason - The reason for the moderation action.
 * @returns True if the message was sent, false otherwise.
 */
export const sendModerationDm = async(
  camperChan: ExtendedClient,
  parameters: {
    action:    ModerationActions;
    user:      User;
    guildName: string;
    reason:    string;
  },
): Promise<boolean> => {
  try {
    const { action, user, guildName, reason } = parameters;
    const embed = new EmbedBuilder();
    embed.setTitle(`${action} Notification!`);
    embed.setDescription(
      `You have received a ${action} in ${guildName} for: \n\n${customSubstring(
        reason,
        2000,
      )}`,
    );

    if (action === "ban") {
      embed.addFields({
        name:  "Appeals",
        value: `You can use [this form](https://forms.nhcarrigan.com/o/docs/forms/k7fPZmhgCS4RRKbStq8AcW/4) to appeal your ban after you have [read our code of conduct](https://www.freecodecamp.org/news/code-of-conduct).`,
      });
    }

    const sent = await user.
      send({ embeds: [ embed ] }).
      then(() => {
        return true;
      }).
      catch(() => {
        return false;
      });
    return sent;
  } catch (error) {
    await errorHandler(camperChan, "send moderation dm module", error);
    return false;
  }
};
