import { EmbedBuilder, type Interaction } from "discord.js";
import { closePrivateChannel } from "../../modules/closePrivateChannel.js";
import { reactionRoleClick } from "../../modules/reactionRoleClick.js";
import { closeTicket } from "../../modules/tickets/closeTicket.js";
import { openTicket } from "../../modules/tickets/openTicket.js";
import type { ExtendedClient } from "../../interfaces/extendedClient.js";

/**
 * Handles the interaction events from Discord.
 * @param camperChan - The camperChan's Discord instance.
 * @param interaction - The interaction payload from Discord.
 */
export const handleInteractionCreate = async(
  camperChan: ExtendedClient,
  interaction: Interaction,
): Promise<void> => {
  if (interaction.isChatInputCommand()) {
    if (!interaction.inCachedGuild()) {
      await interaction.reply({
        content:   "This command can only be used in a server, not a DM.",
        ephemeral: true,
      });
      return;
    }
    const target = camperChan.commands.find((command) => {
      return command.data.name === interaction.commandName;
    });
    if (!target) {
      await interaction.reply(
        "That does not appear to be a valid slash command...",
      );
      return;
    }
    await target.run(camperChan, interaction);
  }

  if (interaction.isContextMenuCommand()) {
    if (!interaction.inCachedGuild()) {
      await interaction.reply({
        content:   "This command can only be used in a server, not a DM.",
        ephemeral: true,
      });
      return;
    }
    const target = camperChan.contexts.find((context) => {
      return context.data.name === interaction.commandName;
    });
    if (!target) {
      await interaction.reply(
        "That does not appear to be a valid context command...",
      );
      return;
    }
    await target.run(camperChan, interaction);
    return;
  }

  if (interaction.isButton()) {
    if (interaction.customId === "ticket-open") {
      if (!interaction.inCachedGuild()) {
        throw new Error("uncached interaction????");
      }
      await openTicket(camperChan, interaction);
    }
    if (interaction.customId === "ticket-close") {
      if (!interaction.inCachedGuild()) {
        throw new Error("uncached interaction????");
      }
      await closeTicket(camperChan, interaction);
    }

    if (interaction.customId === "delete-bookmark") {
      await interaction.message.delete();
    }
    if (interaction.customId === "close-channel") {
      await closePrivateChannel(camperChan, interaction);
    }
    if (interaction.customId.startsWith("rr-")) {
      await reactionRoleClick(camperChan, interaction);
    }
    if (interaction.customId === "acknowledge") {
      const [ embed ] = interaction.message.embeds;
      if (!embed) {
        await interaction.reply({
          content:   "Error loading message embed. Please contact Naomi.",
          ephemeral: true,
        });
        return;
      }
      const updatedEmbed = new EmbedBuilder(embed.toJSON());
      updatedEmbed.addFields({
        name:  "Acknowledged by",
        value: `<@!${interaction.user.id}>`,
      });
      await interaction.update({
        components: [],
        embeds:     [ updatedEmbed ],
      });
    }
  }

  if (
    interaction.isModalSubmit()
    && interaction.customId.startsWith(`report-`)
  ) {
    const messageId = interaction.customId.split("-").at(1);
    if (messageId === undefined) {
      await interaction.reply({
        content:   "Error loading message. Please notify Naomi.",
        ephemeral: true,
      });
      return;
    }
    const { reportChannel } = camperChan;
    const message = await reportChannel.messages.fetch(messageId);
    const [ embed ] = message.embeds;
    if (!embed) {
      await interaction.reply({
        content:   "Error loading embed in message. Please notify Naomi.",
        ephemeral: true,
      });
      return;
    }
    const reason = interaction.fields.getTextInputValue("reason");
    const updatedEmbed = new EmbedBuilder(embed.toJSON());
    updatedEmbed.setFields(
      { name: "Reason", value: reason },
      ...embed.fields.filter((f) => {
        return f.name !== "Reason";
      }),
    );
    await message.edit({
      embeds: [ updatedEmbed ],
    });
    await interaction.reply({
      content:   "Thank you for reporting!",
      ephemeral: true,
    });
  }
};
