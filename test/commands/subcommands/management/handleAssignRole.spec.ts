import { PermissionFlagsBits } from "discord.js";
import { describe, assert, it, vi } from "vitest";
import { handleAssignRole }
  from "../../../../src/commands/subcommands/management/handleAssignRole.js";
import type { ExtendedClient }
  from "../../../../src/interfaces/extendedClient.js";

interface MockRole {
  id:       string;
  name:     string;
  position: number;
  managed:  boolean;
}

const guildId = "1";
const botPosition = 10;

const makeRole = (role: Partial<MockRole> & { id: string; name: string }):
MockRole => {
  return { managed: false, position: 1, ...role };
};

const roles = [
  makeRole({ id: guildId, name: "@everyone", position: 0 }),
  makeRole({ id: "2", name: "AI" }),
  makeRole({ id: "3", managed: true, name: "Booster" }),
  makeRole({ id: "4", name: "Contributors" }),
  makeRole({ id: "5", name: "Moderators", position: 20 }),
  makeRole({ id: "6", name: "Tied With Bot", position: botPosition }),
];

const makeInteraction = (
  query: string,
  roleList: Array<MockRole>,
): { respond: ReturnType<typeof vi.fn> } => {
  return {
    guild: {
      id:      guildId,
      members: {
        me: {
          roles: {
            highest: {
              comparePositionTo: (role: MockRole): number => {
                return botPosition - role.position;
              },
            },
          },
        },
      },
      roles: {
        cache: new Map(roleList.map((role) => {
          return [ role.id, role ];
        })),
      },
    },
    options: {
      getFocused: (): string => {
        return query;
      },
    },
    respond: vi.fn(),
  } as unknown as { respond: ReturnType<typeof vi.fn> };
};

const suggest = async(
  query: string,
  roleList: Array<MockRole> = roles,
): Promise<Array<{ name: string; value: string }>> => {
  const interaction = makeInteraction(query, roleList);
  await handleAssignRole.autocomplete?.(
    {} as ExtendedClient,
    interaction as never,
  );
  return interaction.respond.mock.calls[0]?.[0] as Array<{
    name:  string;
    value: string;
  }>;
};

describe("handleAssignRole command", () => {
  it("does not allow members without moderation permissions", () => {
    assert.isFalse(
      handleAssignRole.permissionValidator({
        permissions: new Set([ PermissionFlagsBits.SendMessages ]),
      } as never),
    );
  });

  it("allows moderate members permission", () => {
    assert.isTrue(
      handleAssignRole.permissionValidator({
        permissions: new Set([ PermissionFlagsBits.ModerateMembers ]),
      } as never),
    );
  });

  it("allows kick members permission", () => {
    assert.isTrue(
      handleAssignRole.permissionValidator({
        permissions: new Set([ PermissionFlagsBits.KickMembers ]),
      } as never),
    );
  });

  it("allows ban members permission", () => {
    assert.isTrue(
      handleAssignRole.permissionValidator({
        permissions: new Set([ PermissionFlagsBits.BanMembers ]),
      } as never),
    );
  });

  it("only suggests roles the camperChan can assign", async() => {
    assert.deepEqual(
      await suggest(""),
      [
        { name: "AI", value: "2" },
        { name: "Contributors", value: "4" },
      ],
      "everyone, managed, and too-high roles should be excluded",
    );
  });

  it("filters the suggestions by what was typed", async() => {
    assert.deepEqual(
      await suggest("contrib"),
      [ { name: "Contributors", value: "4" } ],
      "only roles matching the query should be suggested",
    );
  });

  it("never suggests more than the twenty five Discord allows", async() => {
    const many = Array.from({ length: 30 }, (_unused, index) => {
      return makeRole({ id: String(index + 100), name: `Role ${index}` });
    });
    assert.lengthOf(
      await suggest("role", many),
      25,
      "the suggestion list should be capped at twenty five",
    );
  });
});
