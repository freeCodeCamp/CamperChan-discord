import { type Message, EmbedBuilder, type PartialMessage } from "discord.js";
import { customSubstring } from "../../utils/customSubstring.js";
import { errorHandler } from "../../utils/errorHandler.js";
import type { ExtendedClient } from "../../interfaces/extendedClient.js";

/**
 * Handles the message delete event in Discord.
 * @param camperChan - The camperChan's Discord instance.
 * @param message - The message payload from Discord.
 */
export const handleMessageDelete = async(
  camperChan: ExtendedClient,
  message: Message | PartialMessage,
): Promise<void> => {
  try {
    const {
      author,
      channel,
      content,
      guild,
      embeds,
      attachments,
      stickers,
      createdTimestamp,
    } = message;

    if (!guild) {
      return;
    }

    const deleteEmbed = new EmbedBuilder();
    deleteEmbed.setTitle("Message Deleted");
    deleteEmbed.setDescription("Here is my record of that message.");
    deleteEmbed.addFields(
      {
        name:  "Channel",
        value: `<#${channel.id}>`,
      },
      {
        name:  "Sent",
        value: `<t:${String(Math.floor(createdTimestamp / 1000))}:f>`,
      },
      {
        name:  "Content",
        value: customSubstring(
          (content ?? "no content") + stickers.map((element) => {
            return element.name;
          }).join(" "),
          1000,
        ),
      },
    );

    if (author) {
      deleteEmbed.setAuthor({
        iconURL: author.displayAvatarURL(),
        name:    author.tag,
      });
      deleteEmbed.setFooter({
        text: `ID: ${author.id}`,
      });
    }

    const attached = attachments.first();
    if (attached) {
      deleteEmbed.setImage(attached.proxyURL);
    }

    await camperChan.config.messageHook.send({ embeds: [ deleteEmbed ] });

    if (embeds.length > 0) {
      await Promise.all(embeds.map(async(embed) => {
        return await camperChan.config.messageHook.send({ embeds: [ embed ] });
      }));
    }
  } catch (error) {
    await errorHandler(camperChan, "message delete event", error);
  }
};
