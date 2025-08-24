import { type Message, EmbedBuilder, type PartialMessage } from "discord.js";
import { customSubstring } from "../../utils/customSubstring.js";
import { errorHandler } from "../../utils/errorHandler.js";
import { generateDiff } from "../../utils/generateDiff.js";
import type { ExtendedClient } from "../../interfaces/extendedClient.js";

/**
 * Handles the message edit event from Discord.
 * @param camperChan - The camperChan's Discord instance.
 * @param oldMessage - The old message data.
 * @param updatedMessage - The new message data.
 */
export const handleMessageEdit = async(
  camperChan: ExtendedClient,
  oldMessage: Message | PartialMessage,
  updatedMessage: Message | PartialMessage,
): Promise<void> => {
  try {
    const { author, content: updatedContent, channel, url }
     = updatedMessage;
    const { content: oldContent } = oldMessage;

    if (author === null || author.bot) {
      return;
    }

    if (oldContent !== null
      && updatedContent !== null
      && oldContent === updatedContent) {
      return;
    }

    if (oldContent === null && updatedContent === null) {
      return;
    }

    const diffContent
      = (oldContent ?? updatedContent) === null
        ? "This message appears to have no content."
        : generateDiff(oldContent ?? "", updatedContent ?? "");

    const updateEmbed = new EmbedBuilder();
    updateEmbed.setTitle("Message Updated");
    updateEmbed.setAuthor({
      iconURL:
        author.displayAvatarURL(),
      name: author.tag,
    });
    updateEmbed.setDescription(
      `\`\`\`diff\n${customSubstring(diffContent, 4000)}\`\`\``,
    );
    updateEmbed.addFields(
      {
        name:  "Channel",
        value: `<#${channel.id}>`,
      },
      {
        name:  "Message Link",
        value: url,
      },
    );
    updateEmbed.setFooter({
      text: `ID: ${author.id}`,
    });

    await camperChan.config.messageHook.send({ embeds: [ updateEmbed ] });
  } catch (error) {
    await errorHandler(camperChan, "message edit event", error);
  }
};
