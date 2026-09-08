import { EmbedBuilder } from "discord.js";
import { errorHandler } from "../../../utils/errorHandler.js";
import type { Subcommand } from "../../../interfaces/subcommand.js";

export const handleContribute: Subcommand = {
  execute: async(camperChan, interaction) => {
    try {
      await interaction.deferReply();
      const moduleEmbed = new EmbedBuilder().setTitle("Helpful Links!").
        addFields(
          {
            name:  "Code of Conduct",
            value: "https://freecodecamp.org/news/code-of-conduct",
          },
          {
            name: "Moderator Handbook",
            value:
            `https://contribute.freecodecamp.org/moderator-handbook/`,
          },
          {
            name:  "Contributing Guidelines",
            value: "https://contribute.freecodecamp.org/",
          },
          {
            name: "News Contributing",
            value:
            "https://www.freecodecamp.org/news/developer-news-style-guide/",
          },
          {
            name: "Pull Request Reviews",
            value:
            `[PRs Ready for Review](https://github.com/freeCodeCamp/freeCodeCamp/pulls?q=is%3Aopen+is%3Apr+-label%3A%22status%3A+blocked%22+-label%3A%22MERGE+CONFLICT%21%22+status%3Asuccess+draft%3Afalse)`,
          },
        );
      await interaction.editReply({ embeds: [ moduleEmbed ] });
    } catch (error) {
      await errorHandler(camperChan, "contribute subcommand", error);
      await interaction.editReply("Something went wrong.");
    }
  },
  permissionValidator: () => {
    return true;
  },
};
