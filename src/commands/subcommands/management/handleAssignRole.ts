import {
  type Guild,
  type GuildMember,
  PermissionFlagsBits,
  type Role,
} from "discord.js";
import { errorHandler } from "../../../utils/errorHandler.js";
import type { Subcommand } from "../../../interfaces/subcommand.js";

/**
 * Determines if the camperChan is allowed to hand out a role. Everything
 * below the camperChan's own highest role is fair game, except the everyone
 * role and roles owned by an integration, such as the booster role.
 * @param guild - The guild the role belongs to.
 * @param bot - The camperChan's member record in that guild.
 * @param role - The role to check.
 * @returns True when the role may be assigned.
 */
const isAssignable = (guild: Guild, bot: GuildMember, role: Role): boolean => {
  return (
    role.id !== guild.id
    && !role.managed
    && bot.roles.highest.comparePositionTo(role) > 0
  );
};

export const handleAssignRole: Subcommand = {
  autocomplete: async(camperChan, interaction) => {
    try {
      const { guild, options } = interaction;
      const bot = guild.members.me ?? await guild.members.fetchMe();
      const query = options.getFocused().toLowerCase();
      const roles = [ ...guild.roles.cache.values() ].
        filter((role) => {
          return (
            isAssignable(guild, bot, role)
            && role.name.toLowerCase().includes(query)
          );
        }).
        sort((a, b) => {
          return a.name.localeCompare(b.name);
        }).
        slice(0, 25).
        map((role) => {
          return { name: role.name, value: role.id };
        });
      await interaction.respond(roles);
    } catch (error) {
      await errorHandler(camperChan, "assign role autocomplete", error);
      await interaction.respond([]).catch(() => {
        return null;
      });
    }
  },
  execute: async(camperChan, interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true });
      const { guild, member, options } = interaction;
      const target = options.getUser("target", true);
      const roleId = options.getString("role", true);

      const targetMember = await guild.members.fetch(target.id).catch(() => {
        return null;
      });

      if (!targetMember) {
        await interaction.editReply("They do not seem to be in the server.");
        return;
      }

      const role = guild.roles.cache.get(roleId);

      if (!role) {
        await interaction.editReply("Cannot find that role.");
        return;
      }

      const bot = guild.members.me ?? await guild.members.fetchMe();

      if (!isAssignable(guild, bot, role)) {
        await interaction.editReply(
          `I cannot manage the ${role.name} role. I can only hand out roles that sit below my own highest role, and that are not owned by an integration.`,
        );
        return;
      }

      const hadRole = targetMember.roles.cache.has(role.id);

      if (hadRole) {
        await targetMember.roles.remove(role);
      } else {
        await targetMember.roles.add(role);
      }

      const action = hadRole
        ? "removed"
        : "added";
      const preposition = hadRole
        ? "from"
        : "to";

      /*
       * The role is named rather than mentioned, so that this log does not
       * ping everyone holding a mentionable role.
       */
      await camperChan.config.modHook.send({
        content: `<@${member.user.id}> has ${action} the \`${role.name}\` role ${preposition} <@${target.id}>.`,
      });

      await interaction.editReply(
        `I have ${action} the ${role.name} role ${preposition} ${target.username}.`,
      );
    } catch (error) {
      await errorHandler(camperChan, "assign role subcommand", error);
      await interaction.editReply("Something went wrong!");
    }
  },
  permissionValidator: (member) => {
    return [
      PermissionFlagsBits.ModerateMembers,
      PermissionFlagsBits.KickMembers,
      PermissionFlagsBits.BanMembers,
    ].some((p) => {
      return member.permissions.has(p);
    });
  },
};
