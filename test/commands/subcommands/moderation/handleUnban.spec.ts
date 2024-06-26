import { PermissionFlagsBits } from "discord.js";
import { describe, assert, test } from "vitest";

import { handleUnban } from "../../../../src/commands/subcommands/moderation/handleUnban.js";

describe("unban handler", () => {
  test("does not allow non-moderators permission", () => {
    assert.isFalse(
      handleUnban.permissionValidator({
        permissions: new Set([PermissionFlagsBits.SendMessages])
      } as never)
    );
  });

  test("does not allow moderate members permission", () => {
    assert.isFalse(
      handleUnban.permissionValidator({
        permissions: new Set([PermissionFlagsBits.ModerateMembers])
      } as never)
    );
  });

  test("does not allow kick members permission", () => {
    assert.isFalse(
      handleUnban.permissionValidator({
        permissions: new Set([PermissionFlagsBits.KickMembers])
      } as never)
    );
  });

  test("allows ban members permission", () => {
    assert.isTrue(
      handleUnban.permissionValidator({
        permissions: new Set([PermissionFlagsBits.BanMembers])
      } as never)
    );
  });
});
