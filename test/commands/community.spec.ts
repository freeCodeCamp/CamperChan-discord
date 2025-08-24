import {
  ApplicationCommandOptionType,
  type SlashCommandSubcommandBuilder,
} from "discord.js";
import { describe, assert, it } from "vitest";
import { community } from "../../src/commands/community.js";

describe("community command", () => {
  const subcommands = community.data.options.filter(
    (opt) => {
      return opt.toJSON().type === ApplicationCommandOptionType.Subcommand;
    },
  ) as Array<SlashCommandSubcommandBuilder>;

  it("has correct data", () => {
    assert.strictEqual(community.data.name, "community");
    assert.strictEqual(
      community.data.description,
      "Commands related to our community.",
    );
    assert.lengthOf(subcommands, 5);
  });

  it("has correct code of conduct", () => {
    const codeOfConduct = subcommands.find(
      (sub) => {
        return sub.name === "code-of-conduct";
      },
    );
    assert.exists(codeOfConduct);
    assert.equal(codeOfConduct?.name, "code-of-conduct");
    assert.equal(
      codeOfConduct?.description,
      "Returns information on freeCodeCamp's Code of Conduct.",
    );
    assert.lengthOf(codeOfConduct?.options || "hi", 0);
  });

  it("has correct contribute", () => {
    const contribute = subcommands.find((sub) => {
      return sub.name === "contribute";
    });
    assert.exists(contribute);
    assert.equal(contribute?.name, "contribute");
    assert.equal(
      contribute?.description,
      "Returns helpful links for folks interested in contributing.",
    );
    assert.lengthOf(contribute?.options || "hi", 0);
  });

  it("has correct forum", () => {
    const forum = subcommands.find((sub) => {
      return sub.name === "forum";
    });
    assert.exists(forum);
    assert.equal(forum?.name, "forum");
    assert.equal(
      forum?.description,
      "Returns the latest activity on the forum.",
    );
    assert.lengthOf(forum?.options || "hi", 0);
  });

  it("has correct quote", () => {
    const quote = subcommands.find((sub) => {
      return sub.name === "quote";
    });
    assert.exists(quote);
    assert.equal(quote?.name, "quote");
    assert.equal(quote?.description, "Returns a motivational quote.");
    assert.lengthOf(quote?.options || "hi", 0);
  });

  it("has correct truism", () => {
    const truism = subcommands.find((sub) => {
      return sub.name === "truism";
    });
    assert.equal(truism?.name, "truism");
    assert.equal(
      truism?.description,
      "Provides a random difficult-to-swallow truth about coding.",
    );
    assert.lengthOf(truism?.options || "hi", 0);
  });
});
