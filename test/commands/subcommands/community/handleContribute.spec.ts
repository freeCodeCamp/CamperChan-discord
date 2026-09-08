import { ChannelType, type EmbedBuilder } from "discord.js";
import {
  MockChannel,
  MockChatInputCommandInteraction,
  MockGuild,
  MockMember,
  MockUser,
} from "discordjs-testing";
import { describe, assert, it } from "vitest";
import { handleContribute }
  from "../../../../src/commands/subcommands/community/handleContribute.js";

const guild = new MockGuild({
  name: "it Guild",
});
const bot = new MockUser({
  avatar:        "it",
  bot:           true,
  discriminator: 1234,
  system:        false,
  username:      "it Bot",
});
const user = new MockUser({
  avatar:        "it",
  bot:           false,
  discriminator: 1234,
  system:        false,
  username:      "it User",
});
const member = new MockMember({
  guild,
  user,
});
const channel = new MockChannel({
  guild: guild,
  name:  "it-channel",
  type:  ChannelType.GuildText,
});

describe("contribute Handler", () => {
  it("should send an embed with contributing information", async() => {
    const command = new MockChatInputCommandInteraction({
      bot:            bot,
      channel:        channel,
      commandName:    "community",
      guild:          guild,
      member:         member,
      subcommandName: "contribute",
      user:           user,
    });
    await handleContribute.execute({} as never, command as never);
    assert.equal(command.replies.length, 1);
    const embed = command.replies?.[0]?.embeds?.[0] as EmbedBuilder;
    assert.equal(embed.data.title, "Helpful Links!");
    const [ first, second, third, fourth, fifth ] = embed.data.fields || [];
    assert.equal(first.name, "Code of Conduct");
    assert.equal(first.value, "https://freecodecamp.org/news/code-of-conduct");
    assert.equal(second.name, "Moderator Handbook");
    assert.equal(
      second.value,
      "https://contribute.freecodecamp.org/moderator-handbook/",
    );
    assert.equal(third.name, "Contributing Guidelines");
    assert.equal(third.value, "https://contribute.freecodecamp.org/");
    assert.equal(fourth.name, "News Contributing");
    assert.equal(
      fourth.value,
      "https://www.freecodecamp.org/news/developer-news-style-guide/",
    );
    assert.equal(fifth.name, "Pull Request Reviews");
    assert.equal(
      fifth.value,
      `[PRs Ready for Review](https://github.com/freeCodeCamp/freeCodeCamp/pulls?q=is%3Aopen+is%3Apr+-label%3A%22status%3A+blocked%22+-label%3A%22MERGE+CONFLICT%21%22+status%3Asuccess+draft%3Afalse)`,
    );
  });
});
