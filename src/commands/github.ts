import { InteractionContextType,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder } from "discord.js";
import { pullComments } from "../config/pullComments.js";
import { errorHandler } from "../utils/errorHandler.js";
import { handleAddLabels } from "./subcommands/github/handleAddLabels.js";
import { handleClose } from "./subcommands/github/handleClose.js";
import { handleComment } from "./subcommands/github/handleComment.js";
import { handleSyncLabels } from "./subcommands/github/handleSyncLabels.js";
import type { Command } from "../interfaces/command.js";
import type { Subcommand } from "../interfaces/subcommand.js";

const handlers: Record<string, Subcommand> = {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- Discord command names can't use uppercase characters.
  "add-labels":  handleAddLabels,
  "close":       handleClose,
  "comment":     handleComment,
  // eslint-disable-next-line @typescript-eslint/naming-convention -- Discord command names can't use uppercase characters.
  "sync-labels": handleSyncLabels,
};

export const github: Command = {
  data: new SlashCommandBuilder().
    setName("github").
    setDescription("Commands related to managing github").
    setContexts(InteractionContextType.Guild).
    addSubcommand(
      new SlashCommandSubcommandBuilder().
        setName("close").
        setDescription(
          "Close an issue or pull request under the freeCodeCamp organisation.",
        ).
        addStringOption((option) => {
          return option.
            setName("repository").
            setDescription(
              `The name of the repository, under freeCodeCamp's GitHub org, to comment on`,
            ).
            setRequired(true);
        }).
        addIntegerOption((option) => {
          return option.
            setName("number").
            setDescription("The number of the issue or pull to close.").
            setRequired(true);
        }).
        addStringOption((option) => {
          return option.
            setName("comment").
            setDescription(
              `The comment to leave when closing. Defaults to the standard close message.`,
            ).
            addChoices(
              ...pullComments.map((c) => {
                return { name: c.key, value: c.key };
              }),
            );
        }).
        addBooleanOption((option) => {
          return option.
            setName("spam").
            setDescription("Label the PR as spam for Hacktoberfest?");
        }).
        addStringOption((option) => {
          return option.
            setName("reason").
            setDescription(
              `Why the issue is being closed. Defaults to not planned. Ignored for pull requests.`,
            ).
            addChoices(
              { name: "completed", value: "completed" },
              { name: "not planned", value: "not_planned" },
              { name: "duplicate", value: "duplicate" },
            );
        }).
        addIntegerOption((option) => {
          return option.
            setName("duplicate-of").
            setDescription(
              `The number of the issue or pull this is a duplicate of. Used when reason is duplicate.`,
            );
        }),
    ).
    addSubcommand(
      new SlashCommandSubcommandBuilder().
        setName("comment").
        setDescription(
          `Adds a friendly comment to an issue or pull request. Scoped to the freeCodeCamp organisation.`,
        ).
        addStringOption((option) => {
          return option.
            setName("repository").
            setDescription(
              `The name of the repository, under freeCodeCamp's GitHub org, to comment on`,
            ).
            setRequired(true);
        }).
        addIntegerOption((option) => {
          return option.
            setName("number").
            setDescription("The number of the pull request to comment on.").
            setRequired(true);
        }).
        addStringOption((option) => {
          return option.
            setName("message").
            setDescription("The message to post.").
            setRequired(true).
            addChoices(
              ...pullComments.map((c) => {
                return { name: c.key, value: c.key };
              }),
            );
        }),
    ).
    addSubcommand(
      new SlashCommandSubcommandBuilder().
        setName("sync-labels").
        setDescription(
          `Specify the exact list of labels an issue/PR should have. Labels not on the list will be removed.`,
        ).
        addStringOption((option) => {
          return option.
            setName("repository").
            setDescription(
              `The name of the repository, under freeCodeCamp's GitHub org, to label`,
            ).
            setRequired(true);
        }).
        addIntegerOption((option) => {
          return option.
            setName("number").
            setDescription("The number of the pull request to label.").
            setRequired(true);
        }).
        addStringOption((option) => {
          return option.
            setName("labels").
            setDescription("The comma separated list of labels to sync").
            setRequired(true);
        }),
    ).
    addSubcommand(
      new SlashCommandSubcommandBuilder().
        setName("add-labels").
        setDescription(
          `Specify a list of labels to add to an issue/PR. Existing labels will not be removed.`,
        ).
        addStringOption((option) => {
          return option.
            setName("repository").
            setDescription(
              `The name of the repository, under freeCodeCamp's GitHub org, to label`,
            ).
            setRequired(true);
        }).
        addIntegerOption((option) => {
          return option.
            setName("number").
            setDescription("The number of the pull request to label.").
            setRequired(true);
        }).
        addStringOption((option) => {
          return option.
            setName("labels").
            setDescription("The comma separated list of labels to add").
            setRequired(true);
        }),
    ),
  run: async(camperChan, interaction) => {
    try {
      const handler = handlers[interaction.options.getSubcommand(true)];
      if (!handler) {
        await interaction.reply("Invalid subcommand.");
        return;
      }
      if (!handler.permissionValidator(interaction.member)) {
        await interaction.reply("You do not have permission to do this.");
        return;
      }
      await handler.execute(camperChan, interaction);
    } catch (error) {
      await errorHandler(camperChan, "github command", error);
    }
  },
};
