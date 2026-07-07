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
      const reasonInput = interaction.options.getString("reason");
      const reason = reasonInput ?? "not_planned";
      const duplicateOf
        = interaction.options.getInteger("duplicate-of") ?? null;

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

      if (isPull && (reasonInput !== null || duplicateOf !== null)) {
        await interaction.editReply({
          content:
            `The \`reason\` and \`duplicate-of\` options only apply to issues, not pull requests.`,
        });
        return;
      }

      const isDuplicate = !isPull && reason === "duplicate";

      let duplicateNodeId: string | null = null;
      if (isDuplicate) {
        if (duplicateOf === null) {
          await interaction.editReply({
            content:
              `Please provide the \`duplicate-of\` number when closing an issue as a duplicate.`,
          });
          return;
        }
        const duplicate = await camperChan.octokit.rest.issues.get({
          // eslint-disable-next-line @typescript-eslint/naming-convention -- Github API name.
          issue_number: duplicateOf,
          owner:        "freeCodeCamp",
          repo:         repo,
        });
        if (duplicate.data.pull_request) {
          await interaction.editReply({
            content:
              `The \`duplicate-of\` number must be an issue, but [#${String(duplicateOf)}](<${duplicate.data.html_url}>) is a pull request.`,
          });
          return;
        }
        duplicateNodeId = duplicate.data.node_id;
      }

      await camperChan.octokit.rest.issues.createComment({
        body:         commentBody(isPull, comment),
        // eslint-disable-next-line @typescript-eslint/naming-convention -- Github API name.
        issue_number: number,
        owner:        "freeCodeCamp",
        repo:         repo,
      });

      if (duplicateNodeId === null) {
        await camperChan.octokit.rest.issues.update({
          // eslint-disable-next-line @typescript-eslint/naming-convention -- Github API name.
          issue_number: number,
          owner:        "freeCodeCamp",
          repo:         repo,
          state:        "closed",
          ...isPull
            ? {}
            : {
              // eslint-disable-next-line @typescript-eslint/naming-convention -- Github API name.
              state_reason: reason === "completed"
                ? "completed"
                : "not_planned",
            },
        });
      } else {
        await camperChan.octokit.graphql(
          `mutation($issueId: ID!, $duplicateIssueId: ID!) {
            closeIssue(input: {
              issueId: $issueId,
              stateReason: DUPLICATE,
              duplicateIssueId: $duplicateIssueId
            }) {
              issue { id }
            }
          }`,
          {
            duplicateIssueId: duplicateNodeId,
            issueId:          data.data.node_id,
          },
        );
      }
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
