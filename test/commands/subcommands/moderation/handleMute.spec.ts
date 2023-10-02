import { assert } from "chai";
import { PermissionFlagsBits } from "discord.js";

import { handleMute } from "../../../../src/commands/subcommands/moderation/handleMute";

suite("mute handler", () => {
  test("does not allow non-moderators permission", () => {
    assert.isFalse(
      handleMute.permissionValidator({
        permissions: new Set([PermissionFlagsBits.SendMessages]),
      } as never)
    );
  });

  test("allows moderate members permission", () => {
    assert.isTrue(
      handleMute.permissionValidator({
        permissions: new Set([PermissionFlagsBits.ModerateMembers]),
      } as never)
    );
  });

  test("does not allow kick members permission", () => {
    assert.isFalse(
      handleMute.permissionValidator({
        permissions: new Set([PermissionFlagsBits.KickMembers]),
      } as never)
    );
  });

  test("does not allow ban members permission", () => {
    assert.isFalse(
      handleMute.permissionValidator({
        permissions: new Set([PermissionFlagsBits.BanMembers]),
      } as never)
    );
  });
});
