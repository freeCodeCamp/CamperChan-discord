import { PermissionFlagsBits } from "discord.js";
import {
  issueClose,
  pullClose,
  pullComments,
} from "../../../config/pullComments.js";
import { errorHandler } from "../../../utils/errorHandler.js";
import type { Subcommand } from "../../../interfaces/subcommand.js";

const commentBody = (isPull: boolean, comment: string | null): string => {
  return (
    pullComments.find((c) => {
      return c.key === comment;
    })?.message
    ?? (isPull
      ? pullClose
      : issueClose)
  );
};

export const handleClose: Subcommand = {
  execute: async(camperChan, interaction) => {
    try {
      await interaction.deferReply();
      const repo = interaction.options.getString("repository", true);
      const number = interaction.options.getInteger("number", true);
      const comment = interaction.options.getString("comment") ?? null;
      const isSpam = interaction.options.getBoolean("spam") ?? false;

      const data = await camperChan.octokit.rest.issues.get({
        // eslint-disable-next-line @typescript-eslint/naming-convention -- Github API name.
        issue_number: number,
        owner:        "freeCodeCamp",
        repo:         repo,
      });

      if (data.data.state === "closed") {
        await interaction.editReply({
          content: `The [${
            data.data.pull_request
              ? "pull request"
              : "issue"
          }](<${data.data.html_url}>) is already closed.`,
        });
        return;
      }
      const isPull = Boolean(data.data.pull_request);
      await camperChan.octokit.rest.issues.createComment({
        body:         commentBody(isPull, comment),
        // eslint-disable-next-line @typescript-eslint/naming-convention -- Github API name.
        issue_number: number,
        owner:        "freeCodeCamp",
        repo:         repo,
      });
      await camperChan.octokit.rest.issues.update({
        // eslint-disable-next-line @typescript-eslint/naming-convention -- Github API name.
        issue_number: number,
        owner:        "freeCodeCamp",
        repo:         repo,
        state:        "closed",
        // eslint-disable-next-line @typescript-eslint/naming-convention, camelcase -- Github API name.
        state_reason: isPull
          ? undefined
          : "not_planned",
      });
      if (isPull && isSpam) {
        await camperChan.octokit.rest.issues.addLabels({
          // eslint-disable-next-line @typescript-eslint/naming-convention -- Github API name.
          issue_number: number,
          labels:       [ "spam" ],
          owner:        "freeCodeCamp",
          repo:         repo,
        });
      }
      await interaction.editReply({
        content: `Successfully closed the [${
          isPull
            ? "pull request"
            : "issue"
        }](<${data.data.html_url}>).`,
      });
    } catch (error) {
      await errorHandler(camperChan, "close subcommand", error);
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
