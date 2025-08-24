import { InteractionContextType,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder } from "discord.js";
import { errorHandler } from "../utils/errorHandler.js";
import { handleCodeOfConduct }
  from "./subcommands/community/handleCodeOfConduct.js";
import { handleContribute } from "./subcommands/community/handleContribute.js";
import { handleForum } from "./subcommands/community/handleForum.js";
import { handleQuote } from "./subcommands/community/handleQuote.js";
import { handleTruism } from "./subcommands/community/handleTruism.js";
import type { Command } from "../interfaces/command.js";
import type { Subcommand } from "../interfaces/subcommand.js";

const handlers: Record<string, Subcommand> = {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- Discord command names can't use uppercase characters.
  "code-of-conduct": handleCodeOfConduct,
  "contribute":      handleContribute,
  "forum":           handleForum,
  "quote":           handleQuote,
  "truism":          handleTruism,
};

export const community: Command = {
  data: new SlashCommandBuilder().
    setName("community").
    setDescription("Commands related to our community.").
    setContexts(InteractionContextType.Guild).
    addSubcommand(
      new SlashCommandSubcommandBuilder().
        setName("code-of-conduct").
        setDescription(
          "Returns information on freeCodeCamp's Code of Conduct.",
        ),
    ).
    addSubcommand(
      new SlashCommandSubcommandBuilder().
        setName("contribute").
        setDescription(
          "Returns helpful links for folks interested in contributing.",
        ),
    ).
    addSubcommand(
      new SlashCommandSubcommandBuilder().
        setName("forum").
        setDescription("Returns the latest activity on the forum."),
    ).
    addSubcommand(
      new SlashCommandSubcommandBuilder().
        setName("quote").
        setDescription("Returns a motivational quote."),
    ).
    addSubcommand(
      new SlashCommandSubcommandBuilder().
        setName("truism").
        setDescription(
          "Provides a random difficult-to-swallow truth about coding.",
        ),
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
      await errorHandler(camperChan, "community command", error);
    }
  },
};
