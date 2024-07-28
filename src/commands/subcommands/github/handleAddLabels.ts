import { PermissionFlagsBits } from "discord.js";
import { errorHandler } from "../../../utils/errorHandler.js";
import type { Subcommand } from "../../../interfaces/subcommand.js";

export const handleAddLabels: Subcommand = {
  execute: async(camperChan, interaction) => {
    try {
      await interaction.deferReply();
      const repo = interaction.options.getString("repository", true);
      const number = interaction.options.getInteger("number", true);
      const labels = interaction.options.getString("labels", true);
      const labelNames = labels.split(",").map((l) => {
        return l.trim();
      });

      const response = await camperChan.octokit.rest.issues.listLabelsForRepo({
        owner: "freeCodeCamp",
        repo:  repo,
      });

      const presentLabels = new Set(response.data.map((x) => {
        return x.name.trim();
      }));

      if (
        !labelNames.every((requestedLabel) => {
          return presentLabels.has(requestedLabel);
        })
      ) {
        await interaction.editReply({
          content: `${labelNames.join(", ")} were not found in the [Issue Labels List](<https://github.com/freeCodeCamp/${repo}/labels>) and will not be added to the issue.`,
        });
        return;
      }

      await camperChan.octokit.rest.issues.addLabels({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        issue_number: number,
        labels:       labelNames,
        owner:        "freeCodeCamp",
        repo:         repo,
      });

      await interaction.editReply({
        content: `[Issue labels](<https://github.com/freeCodeCamp/${repo}/issues/${String(number)}>) have been added: ${labelNames.join(
          ", ",
        )}`,
      });
    } catch (error) {
      await errorHandler(camperChan, "add labels subcommand", error);
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
    });
  },
};
