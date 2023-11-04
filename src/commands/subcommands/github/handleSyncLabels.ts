import { PermissionFlagsBits } from "discord.js";

import { Subcommand } from "../../../interfaces/Subcommand";
import { errorHandler } from "../../../utils/errorHandler";

export const handleSyncLabels: Subcommand = {
  permissionValidator: (member) =>
    [
      PermissionFlagsBits.ModerateMembers,
      PermissionFlagsBits.KickMembers,
      PermissionFlagsBits.BanMembers,
    ].some((p) => member.permissions.has(p)),
  execute: async (Bot, interaction) => {
    try {
      await interaction.deferReply();
      const repo = interaction.options.getString("repository", true);
      const number = interaction.options.getInteger("number", true);
      const labels = interaction.options.getString("labels", true);
      const labelNames = labels.split(",").map((l) => l.trim());

      await Bot.octokit.issues.setLabels({
        owner: "freeCodeCamp",
        issue_number: number,
        repo,
        labels: labelNames,
      });

      await interaction.editReply({
        content: `[Issue labels](<https://github.com/freeCodeCamp/${repo}/issues/${number}>) have been synced to: ${labelNames.join(
          ", "
        )}`,
      });
    } catch (err) {
      await errorHandler(Bot, err);
      await interaction.editReply(
        `Something went wrong: ${
          (err as Error).message ??
          "Unable to parse error. Please check the logs."
        }`
      );
    }
  },
};
