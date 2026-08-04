import {
  ChannelType,
  InteractionContextType,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { errorHandler } from "../utils/errorHandler.js";
import { handleAssignRole } from "./subcommands/management/handleAssignRole.js";
import { handlePrivate } from "./subcommands/management/handlePrivate.js";
import { handleRole } from "./subcommands/management/handleRole.js";
import { handleTickets } from "./subcommands/management/handleTickets.js";
import type { Command } from "../interfaces/command.js";
import type { Subcommand } from "../interfaces/subcommand.js";

/* eslint-disable @typescript-eslint/naming-convention -- These keys are subcommand names, which Discord requires to be kebab-case. */
const handlers: Record<string, Subcommand> = {
  "assign-role": handleAssignRole,
  "private":     handlePrivate,
  "role":        handleRole,
  "tickets":     handleTickets,
};
/* eslint-enable @typescript-eslint/naming-convention -- Re-enabled after the subcommand map. */

export const management: Command = {
  autocomplete: async(camperChan, interaction) => {
    try {
      const handler = handlers[interaction.options.getSubcommand(true)];
      if (!handler?.autocomplete
        || !handler.permissionValidator(interaction.member)) {
        await interaction.respond([]);
        return;
      }
      await handler.autocomplete(camperChan, interaction);
    } catch (error) {
      await errorHandler(camperChan, "management autocomplete", error);
      await interaction.respond([]).catch(() => {
        return null;
      });
    }
  },
  data: new SlashCommandBuilder().
    setName("management").
    setDescription("Commands related to server management.").
    setContexts(InteractionContextType.Guild).
    addSubcommand(
      new SlashCommandSubcommandBuilder().
        setName("private").
        setDescription("Creates a private discussion channel with a user.").
        addUserOption((option) => {
          return option.
            setName("target").
            setDescription("The user to create a private channel with.").
            setRequired(true);
        }),
    ).
    addSubcommand(
      new SlashCommandSubcommandBuilder().
        setName("role").
        setDescription(
          "Creates a post with buttons for self-assignable roles.",
        ).
        addChannelOption((option) => {
          return option.
            setName("channel").
            setDescription("Channel to create the post in.").
            setRequired(true);
        }).
        addStringOption((option) => {
          return option.
            setName("header").
            setDescription("Text to include at the top of the post.").
            setRequired(true);
        }).
        addRoleOption((option) => {
          return option.
            setName("role1").
            setDescription("Role to create a button for.").
            setRequired(true);
        }).
        addRoleOption((option) => {
          return option.setName("role2").
            setDescription("Role to create a button for.");
        }).
        addRoleOption((option) => {
          return option.setName("role3").
            setDescription("Role to create a button for.");
        }).
        addRoleOption((option) => {
          return option.setName("role4").
            setDescription("Role to create a button for.");
        }).
        addRoleOption((option) => {
          return option.setName("role5").
            setDescription("Role to create a button for.");
        }),
    ).
    addSubcommand(
      new SlashCommandSubcommandBuilder().
        setName("assign-role").
        setDescription("Adds or removes a role for a user on their behalf.").
        addUserOption((option) => {
          return option.
            setName("target").
            setDescription("The user to update the roles of.").
            setRequired(true);
        }).
        addStringOption((option) => {
          return option.
            setName("role").
            setDescription("The role to add to, or remove from, the user.").
            setRequired(true).
            setAutocomplete(true);
        }),
    ).
    addSubcommand(
      new SlashCommandSubcommandBuilder().
        setName("tickets").
        setDescription("Create a ticket post in the specified channel").
        addChannelOption((o) => {
          return o.
            setName("channel").
            setDescription("The channel to create the ticket post in.").
            addChannelTypes(ChannelType.GuildText);
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
      await errorHandler(camperChan, "management command", error);
    }
  },
};
