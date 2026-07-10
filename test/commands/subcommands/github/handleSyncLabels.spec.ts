import { PermissionFlagsBits } from "discord.js";
import { describe, assert, it } from "vitest";
import { handleSyncLabels }
  from "../../../../src/commands/subcommands/github/handleSyncLabels.js";
import { sprintReviewerRoleId } from "../../../../src/config/roles.js";

describe("sync labels handler", () => {
  it("does not allow non-moderators permission", () => {
    assert.isFalse(
      handleSyncLabels.permissionValidator({
        permissions: new Set([ PermissionFlagsBits.SendMessages ]),
        roles:       { cache: new Set([ ]) },
      } as never),
    );
  });

  it("allows sprint reviewers permission", () => {
    assert.isTrue(
      handleSyncLabels.permissionValidator({
        permissions: new Set([ PermissionFlagsBits.SendMessages ]),
        roles:       { cache: new Set([ sprintReviewerRoleId ]) },
      } as never),
    );
  });

  it("allows moderate members permission", () => {
    assert.isTrue(
      handleSyncLabels.permissionValidator({
        permissions: new Set([ PermissionFlagsBits.ModerateMembers ]),
        roles:       { cache: new Set([ sprintReviewerRoleId ]) },
      } as never),
    );
  });

  it("allows kick members permission", () => {
    assert.isTrue(
      handleSyncLabels.permissionValidator({
        permissions: new Set([ PermissionFlagsBits.KickMembers ]),
        roles:       { cache: new Set([ sprintReviewerRoleId ]) },
      } as never),
    );
  });

  it("allows ban members permission", () => {
    assert.isTrue(
      handleSyncLabels.permissionValidator({
        permissions: new Set([ PermissionFlagsBits.BanMembers ]),
        roles:       { cache: new Set([ sprintReviewerRoleId ]) },
      } as never),
    );
  });
});
