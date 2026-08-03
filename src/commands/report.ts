import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import { errorHandler } from "../utils/errorHandler.js";
import type { Command } from "../interfaces/command.js";

export const report: Command = {
  data: new SlashCommandBuilder().
    setName("report").
    setDescription("Report inappropriate conduct in your voice channel.").
    setContexts(InteractionContextType.Guild).
    addUserOption((o) => {
      return o.
        setName("user").
        setDescription("The user you need to report.").
        setRequired(true);
    }).
    addStringOption((o) => {
      return o.
        setName("reason").
        setDescription("The reason for reporting the user.").
        setRequired(true).
        setMaxLength(1000);
    }),
  run: async(camperChan, interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true });

      const voice = interaction.member.voice.channel;
      if (!voice) {
        await interaction.editReply({
          content: "You must be in a voice channel to do this.",
        });
        return;
      }
      await voice.fetch();
      const target = interaction.options.getUser("user", true);
      const reason = interaction.options.getString("reason", true);

      if (!voice.members.has(target.id)) {
        await interaction.editReply({
          content: "That user does not appear to be in the voice channel.",
        });
        return;
      }

      const reportChannel = await interaction.guild.channels.fetch(
        camperChan.config.reportChannel,
      );
      if (!reportChannel || !("send" in reportChannel)) {
        await interaction.editReply({
          content: "Could not find report channel. Please notify Naomi.",
        });
        return;
      }

      await reportChannel.send({
        content: `<@${interaction.user.id}> has reported <@${target.id}> for the following behaviour in <#${voice.id}>:\n${reason}`,
      });
      await interaction.editReply({
        content:
          `Your report has been submitted. Thank you for keeping our community safe~!`,
      });
    } catch (error) {
      await errorHandler(camperChan, "report command", error);
    }
  },
};
