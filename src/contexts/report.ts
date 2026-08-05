import {
  EmbedBuilder,
  ApplicationCommandType,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  ModalBuilder,
} from "discord.js";
import { errorHandler } from "../utils/errorHandler.js";
import type { Context } from "../interfaces/context.js";

export const report: Context = {
  data: {
    name: "report",
    type: ApplicationCommandType.Message,
  },
  run: async(camperChan, interaction) => {
    try {
      if (!interaction.isMessageContextMenuCommand()) {
        await interaction.reply({
          content:
            "This command is improperly configured. Please contact Naomi.",
          ephemeral: true,
        });
        return;
      }
      const { options, user } = interaction;
      const message = options.getMessage("message", true);

      const { reportChannel } = camperChan;

      const { author, url, content, channel, attachments, stickers, embeds }
        = message;

      const linkButton = new ButtonBuilder().
        setStyle(ButtonStyle.Link).
        setLabel("Message Link").
        setURL(url);
      const acknowledgeButton = new ButtonBuilder().
        setStyle(ButtonStyle.Success).
        setLabel("Acknowledge").
        setCustomId("acknowledge").
        setEmoji("✅");
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents([
        linkButton,
        acknowledgeButton,
      ]);

      /*
       * A message may have no text at all, but the embed description cannot
       * be an empty string. Summarise the non-text payload instead.
       */
      const descriptionParts = [ content ];
      if (stickers.size > 0) {
        descriptionParts.push(`**Stickers:** ${stickers.map((sticker) => {
          return sticker.name;
        }).join(", ")}`);
      }
      if (attachments.size > 0) {
        descriptionParts.push(`**Attachments:** ${attachments.
          map((attachment) => {
            return attachment.proxyURL;
          }).join("\n")}`);
      }
      if (embeds.length > 0) {
        descriptionParts.push(`**Embeds:** ${String(embeds.length)}`);
      }
      const description = descriptionParts.
        filter(Boolean).
        join("\n\n").
        slice(0, 4000);

      const reportEmbed = new EmbedBuilder();
      reportEmbed.setTitle("A message was flagged for review!");
      reportEmbed.setDescription(
        description === ""
          ? "*This message has no text. Use the message link to view it.*"
          : description,
      );
      const image = attachments.find((attachment) => {
        return attachment.contentType?.startsWith("image/") ?? false;
      });
      if (image) {
        reportEmbed.setImage(image.proxyURL);
      }
      reportEmbed.setAuthor({
        iconURL: author.displayAvatarURL(),
        name:    author.tag,
      });
      reportEmbed.addFields(
        { inline: true, name: "Channel", value: `<#${channel.id}>` },
        {
          inline: true,
          name:   "Reported By",
          value:  `<@${user.id}>`,
        },
      );
      reportEmbed.setFooter({
        text: `ID: ${author.id}`,
      });

      const log = await reportChannel.send({
        components: [ row ],
        embeds:     [ reportEmbed ],
      });

      const reason = new TextInputBuilder().
        setLabel("Why are you reporting this message?").
        setCustomId("reason").
        setStyle(TextInputStyle.Paragraph).
        setRequired(true);
      const modalRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
        reason,
      );
      const modal = new ModalBuilder().
        setCustomId(`report-${log.id}`).
        setTitle("Message Report").
        addComponents(modalRow);
      await interaction.showModal(modal);
    } catch (error) {
      await errorHandler(camperChan, "report context command", error);
    }
  },
};
