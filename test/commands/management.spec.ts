import {
  ApplicationCommandOptionType,
  type SlashCommandSubcommandBuilder,
} from "discord.js";
import { describe, assert, it } from "vitest";
import { management } from "../../src/commands/management.js";

describe("management command", () => {
  const subcommands = management.data.options.filter(
    (opt) => {
      return opt.toJSON().type === ApplicationCommandOptionType.Subcommand;
    },
  ) as Array<SlashCommandSubcommandBuilder>;

  it("has correct data", () => {
    assert.strictEqual(management.data.name, "management");
    assert.strictEqual(
      management.data.description,
      "Commands related to server management.",
    );
    assert.lengthOf(subcommands, 4);
  });

  it("has correct assign-role", () => {
    const assignRole = subcommands.find((sub) => {
      return sub.name === "assign-role";
    });
    assert.strictEqual(
      assignRole?.description,
      "Adds or removes a role for a user on their behalf.",
    );
    assert.lengthOf(assignRole?.options || "hi", 2);
    assert.strictEqual(assignRole?.options[0].name, "target");
    assert.strictEqual(
      assignRole?.options[0].description,
      "The user to update the roles of.",
    );
    assert.isTrue(assignRole?.options[0].required);
    assert.strictEqual(
      assignRole?.options[0].type,
      ApplicationCommandOptionType.User,
    );
    assert.strictEqual(assignRole?.options[1].name, "role");
    assert.strictEqual(
      assignRole?.options[1].description,
      "The role to add to, or remove from, the user.",
    );
    assert.isTrue(assignRole?.options[1].required);
    assert.strictEqual(
      assignRole?.options[1].type,
      ApplicationCommandOptionType.String,
    );
    assert.isTrue(
      (assignRole?.options[1] as { autocomplete?: boolean }).autocomplete,
    );
  });

  it("has correct private", () => {
    const privateC = subcommands.find((sub) => {
      return sub.name === "private";
    });
    assert.strictEqual(
      privateC?.description,
      "Creates a private discussion channel with a user.",
    );
    assert.lengthOf(privateC?.options || "hi", 1);
    assert.strictEqual(privateC?.options[0].name, "target");
    assert.strictEqual(
      privateC?.options[0].description,
      "The user to create a private channel with.",
    );
    assert.isTrue(privateC?.options[0].required);
    assert.strictEqual(
      privateC?.options[0].type,
      ApplicationCommandOptionType.User,
    );
  });

  it("has correct role", () => {
    const role = subcommands.find((sub) => {
      return sub.name === "role";
    });
    assert.strictEqual(
      role?.description,
      "Creates a post with buttons for self-assignable roles.",
    );
    assert.lengthOf(role?.options || "hi", 7);
    assert.strictEqual(role?.options[0].name, "channel");
    assert.strictEqual(
      role?.options[0].description,
      "Channel to create the post in.",
    );
    assert.isTrue(role?.options[0].required);
    assert.strictEqual(role?.options[1].name, "header");
    assert.strictEqual(
      role?.options[1].description,
      "Text to include at the top of the post.",
    );
    assert.isTrue(role?.options[1].required);
    assert.strictEqual(
      role?.options[1].type,
      ApplicationCommandOptionType.String,
    );
    assert.strictEqual(role?.options[2].name, "role1");
    assert.strictEqual(
      role?.options[2].description,
      "Role to create a button for.",
    );
    assert.isTrue(role?.options[2].required);
    assert.strictEqual(
      role?.options[2].type,
      ApplicationCommandOptionType.Role,
    );
    assert.strictEqual(role?.options[3].name, "role2");
    assert.strictEqual(
      role?.options[3].description,
      "Role to create a button for.",
    );
    assert.isFalse(role?.options[3].required);
    assert.strictEqual(
      role?.options[3].type,
      ApplicationCommandOptionType.Role,
    );
    assert.strictEqual(role?.options[4].name, "role3");
    assert.strictEqual(
      role?.options[4].description,
      "Role to create a button for.",
    );
    assert.isFalse(role?.options[4].required);
    assert.strictEqual(
      role?.options[4].type,
      ApplicationCommandOptionType.Role,
    );
    assert.strictEqual(role?.options[5].name, "role4");
    assert.strictEqual(
      role?.options[5].description,
      "Role to create a button for.",
    );
    assert.isFalse(role?.options[5].required);
    assert.strictEqual(
      role?.options[5].type,
      ApplicationCommandOptionType.Role,
    );
    assert.strictEqual(role?.options[6].name, "role5");
    assert.strictEqual(
      role?.options[6].description,
      "Role to create a button for.",
    );
    assert.isFalse(role?.options[6].required);
    assert.strictEqual(
      role?.options[6].type,
      ApplicationCommandOptionType.Role,
    );
  });
});
