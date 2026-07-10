import { PermissionFlagsBits } from "discord.js";
import { sprintReviewerRoleId } from "../../../config/roles.js";
import { errorHandler } from "../../../utils/errorHandler.js";
import type { Subcommand } from "../../../interfaces/subcommand.js";

export const handleSyncLabels: Subcommand = {
  execute: async(camperChan, interaction) => {
    try {
      await interaction.deferReply();
      const repo = interaction.options.getString("repository", true);
      const number = interaction.options.getInteger("number", true);
      const labels = interaction.options.getString("labels", true);
      const labelNames = labels.split(",").map((l) => {
        return l.trim();
      });

      await camperChan.octokit.rest.issues.setLabels({
        // eslint-disable-next-line @typescript-eslint/naming-convention -- Github API name.
        issue_number: number,
        labels:       labelNames,
        owner:        "freeCodeCamp",
        repo:         repo,
      });

      await interaction.editReply({
        content: `[Issue labels](<https://github.com/freeCodeCamp/${repo}/issues/${String(number)}>) have been synced to: ${labelNames.join(
          ", ",
        )}`,
      });
    } catch (error) {
      await errorHandler(camperChan, "sync labels subcommand", error);
      await interaction.editReply(
        `Something went wrong: ${
          error instanceof Error
            ? error.message
            : "Unable to parse error. Please check the logs."
        }`,
      );
    }
  },
  permissionValidator: (member) => {
    return [
      PermissionFlagsBits.ModerateMembers,
      PermissionFlagsBits.KickMembers,
      PermissionFlagsBits.BanMembers,
    ].some((p) => {
      return member.permissions.has(p);
      // Explicit override so the sprint reviewers can manage labels without needing perms.
    }) || member.roles.cache.has(sprintReviewerRoleId);
  },
};
