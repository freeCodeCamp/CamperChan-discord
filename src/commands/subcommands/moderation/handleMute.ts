import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { sendModerationDm } from "../../../modules/sendModerationDm.js";
import { updateHistory } from "../../../modules/updateHistory.js";
import {
  calculateMilliseconds,
  isValidTimeUnit,
} from "../../../utils/calculateMilliseconds.js";
import { customSubstring } from "../../../utils/customSubstring.js";
import { errorHandler } from "../../../utils/errorHandler.js";
import type { Subcommand } from "../../../interfaces/subcommand.js";

export const handleMute: Subcommand = {
  execute: async(camperChan, interaction) => {
    try {
      await interaction.deferReply();
      const { guild, member, options } = interaction;
      const target = options.getUser("target", true);
      const duration = options.getInteger("duration", true);
      const durationUnit = options.getString("unit", true);
      const reason = options.getString("reason", true);

      if (!isValidTimeUnit(durationUnit)) {
        await interaction.editReply({
          content: `${durationUnit} is not a valid duration unit.`,
        });
        return;
      }

      const durationMilliseconds = calculateMilliseconds(
        duration,
        durationUnit,
      );

      if (durationMilliseconds === 0) {
        await interaction.editReply({
          content: `${String(duration)}${durationUnit} is not a valid duration.`,
        });
        return;
      }

      if (durationMilliseconds > 2_419_200_000) {
        await interaction.editReply({
          content: "You cannot mute someone for longer than 28 days.",
        });
        return;
      }

      if (target.id === member.user.id) {
        await interaction.editReply("You cannot mute yourself.");
        return;
      }
      if (target.id === camperChan.user?.id) {
        await interaction.editReply("You cannot mute the camperChan.");
        return;
      }

      const targetMember = await guild.members.
        fetch(target.id).
        catch(() => {
          return null;
        });

      if (!targetMember) {
        await interaction.editReply("They don't seem to be in this server.");
        return;
      }

      const sentNotice = await sendModerationDm(
        camperChan,
        {
          action:    "mute",
          guildName: guild.name,
          reason:    customSubstring(reason, 1000),
          user:      target,
        },
      );

      await targetMember.timeout(durationMilliseconds, reason);

      await updateHistory(camperChan, "mute", target.id);

      const muteEmbed = new EmbedBuilder();
      muteEmbed.setTitle("A user has been muted!");
      muteEmbed.setDescription(`They were muted by ${member.user.username}`);
      muteEmbed.addFields(
        {
          name:  "Reason",
          value: customSubstring(reason, 1000),
        },
        {
          name:  "Duration",
          value: `${String(duration)} ${durationUnit}`,
        },
        {
          name:  "User Notified?",
          value: String(sentNotice),
        },
      );
      muteEmbed.setTimestamp();
      muteEmbed.setAuthor({
        iconURL: target.displayAvatarURL(),
        name:    target.tag,
      });
      muteEmbed.setFooter({
        text: `ID: ${target.id}`,
      });

      await camperChan.config.modHook.send({ embeds: [ muteEmbed ] });

      await interaction.editReply({
        content: "They have been muted!",
      });
    } catch (error) {
      await errorHandler(camperChan, "mute subcommand", error);
      await interaction.editReply("Something went wrong.");
    }
  },
  permissionValidator: (member) => {
    return member.permissions.has(PermissionFlagsBits.ModerateMembers);
  },
};
