import {
  ApplicationCommandOptionType,
  type SlashCommandSubcommandBuilder,
} from "discord.js";
import { describe, assert, it } from "vitest";
import { github } from "../../src/commands/github.js";

describe("github command", () => {
  const subcommands = github.data.options.filter(
    (opt) => {
      return opt.toJSON().type === ApplicationCommandOptionType.Subcommand;
    },
  ) as Array<SlashCommandSubcommandBuilder>;

  it("has correct data", () => {
    assert.strictEqual(github.data.name, "github");
    assert.strictEqual(
      github.data.description,
      "Commands related to managing github",
    );
    assert.lengthOf(subcommands, 4);
  });

  it("has correct close", () => {
    const close = subcommands.find((sub) => {
      return sub.name === "close";
    });
    assert.exists(close);
    assert.strictEqual(close?.name, "close");
    assert.strictEqual(
      close?.description,
      "Close an issue or pull request under the freeCodeCamp organisation.",
    );
    assert.lengthOf(close?.options || "hi", 6);
    assert.strictEqual(close?.options?.[0].name, "repository");
    assert.strictEqual(
      close?.options?.[0].description,
      `The name of the repository, under freeCodeCamp's GitHub org, to comment on`,
    );
    assert.isTrue(close?.options?.[0].required);
    assert.strictEqual(
      close?.options?.[0].type,
      ApplicationCommandOptionType.String,
    );
    assert.strictEqual(close?.options?.[1].name, "number");
    assert.strictEqual(
      close?.options?.[1].description,
      "The number of the issue or pull to close.",
    );
    assert.isTrue(close?.options?.[1].required);
    assert.strictEqual(
      close?.options?.[1].type,
      ApplicationCommandOptionType.Integer,
    );
    assert.strictEqual(close?.options?.[2].name, "comment");
    assert.strictEqual(
      close?.options?.[2].description,
      `The comment to leave when closing. Defaults to the standard close message.`,
    );
    assert.isFalse(close?.options?.[2].required);
    assert.strictEqual(
      close?.options?.[2].type,
      ApplicationCommandOptionType.String,
    );
    assert.strictEqual(close?.options?.[3].name, "spam");
    assert.strictEqual(
      close?.options?.[3].description,
      "Label the PR as spam for Hacktoberfest?",
    );
    assert.isFalse(close?.options?.[3].required);
    assert.strictEqual(
      close?.options?.[3].type,
      ApplicationCommandOptionType.Boolean,
    );
    assert.strictEqual(close?.options?.[4].name, "reason");
    assert.strictEqual(
      close?.options?.[4].description,
      `Why the issue is being closed. Defaults to not planned. Ignored for pull requests.`,
    );
    assert.isFalse(close?.options?.[4].required);
    assert.strictEqual(
      close?.options?.[4].type,
      ApplicationCommandOptionType.String,
    );
    assert.strictEqual(close?.options?.[5].name, "duplicate-of");
    assert.strictEqual(
      close?.options?.[5].description,
      `The number of the issue or pull this is a duplicate of. Used when reason is duplicate.`,
    );
    assert.isFalse(close?.options?.[5].required);
    assert.strictEqual(
      close?.options?.[5].type,
      ApplicationCommandOptionType.Integer,
    );
  });

  it("has correct comment", () => {
    const comment = subcommands.find((sub) => {
      return sub.name === "comment";
    });
    assert.exists(comment);
    assert.strictEqual(comment?.name, "comment");
    assert.strictEqual(
      comment?.description,
      `Adds a friendly comment to an issue or pull request. Scoped to the freeCodeCamp organisation.`,
    );
    assert.lengthOf(comment?.options || "hi", 3);
    assert.strictEqual(comment?.options?.[0].name, "repository");
    assert.strictEqual(
      comment?.options?.[0].description,
      `The name of the repository, under freeCodeCamp's GitHub org, to comment on`,
    );
    assert.isTrue(comment?.options?.[0].required);
    assert.strictEqual(
      comment?.options?.[0].type,
      ApplicationCommandOptionType.String,
    );
    assert.strictEqual(comment?.options?.[1].name, "number");
    assert.strictEqual(
      comment?.options?.[1].description,
      "The number of the pull request to comment on.",
    );
    assert.isTrue(comment?.options?.[1].required);
    assert.strictEqual(
      comment?.options?.[1].type,
      ApplicationCommandOptionType.Integer,
    );
    assert.strictEqual(comment?.options?.[2].name, "message");
    assert.strictEqual(
      comment?.options?.[2].description,
      "The message to post.",
    );
    assert.isTrue(comment?.options?.[2].required);
    assert.strictEqual(
      comment?.options?.[2].type,
      ApplicationCommandOptionType.String,
    );
  });

  it("has correct add labels", () => {
    const command = subcommands.find((sub) => {
      return sub.name === "add-labels";
    });
    assert.exists(command);
    assert.strictEqual(command?.name, "add-labels");
    assert.strictEqual(
      command?.description,
      `Specify a list of labels to add to an issue/PR. Existing labels will not be removed.`,
    );
    assert.lengthOf(command?.options || "hi", 3);
    assert.strictEqual(command?.options?.[0].name, "repository");
    assert.strictEqual(
      command?.options?.[0].description,
      "The name of the repository, under freeCodeCamp's GitHub org, to label",
    );
    assert.isTrue(command?.options?.[0].required);
    assert.strictEqual(
      command?.options?.[0].type,
      ApplicationCommandOptionType.String,
    );
    assert.strictEqual(command?.options?.[1].name, "number");
    assert.strictEqual(
      command?.options?.[1].description,
      "The number of the pull request to label.",
    );
    assert.isTrue(command?.options?.[1].required);
    assert.strictEqual(
      command?.options?.[1].type,
      ApplicationCommandOptionType.Integer,
    );
    assert.strictEqual(command?.options?.[2].name, "labels");
    assert.strictEqual(
      command?.options?.[2].description,
      "The comma separated list of labels to add",
    );
    assert.isTrue(command?.options?.[2].required);
    assert.strictEqual(
      command?.options?.[2].type,
      ApplicationCommandOptionType.String,
    );
  });

  it("has correct sync labels", () => {
    const command = subcommands.find((sub) => {
      return sub.name === "sync-labels";
    });
    assert.exists(command);
    assert.strictEqual(command?.name, "sync-labels");
    assert.strictEqual(
      command?.description,
      `Specify the exact list of labels an issue/PR should have. Labels not on the list will be removed.`,
    );
    assert.lengthOf(command?.options || "hi", 3);
    assert.strictEqual(command?.options?.[0].name, "repository");
    assert.strictEqual(
      command?.options?.[0].description,
      "The name of the repository, under freeCodeCamp's GitHub org, to label",
    );
    assert.isTrue(command?.options?.[0].required);
    assert.strictEqual(
      command?.options?.[0].type,
      ApplicationCommandOptionType.String,
    );
    assert.strictEqual(command?.options?.[1].name, "number");
    assert.strictEqual(
      command?.options?.[1].description,
      "The number of the pull request to label.",
    );
    assert.isTrue(command?.options?.[1].required);
    assert.strictEqual(
      command?.options?.[1].type,
      ApplicationCommandOptionType.Integer,
    );
    assert.strictEqual(command?.options?.[2].name, "labels");
    assert.strictEqual(
      command?.options?.[2].description,
      "The comma separated list of labels to sync",
    );
    assert.isTrue(command?.options?.[2].required);
    assert.strictEqual(
      command?.options?.[2].type,
      ApplicationCommandOptionType.String,
    );
  });
});
