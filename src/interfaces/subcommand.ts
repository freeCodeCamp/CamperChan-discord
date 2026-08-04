import type { ExtendedClient } from "./extendedClient.js";
import type { GuildCommandInteraction } from "./guildCommandInteraction.js";
import type { AutocompleteInteraction, GuildMember } from "discord.js";

export interface Subcommand {
  permissionValidator: (member: GuildMember)=> boolean;
  execute: (
    camperChan: ExtendedClient,
    interaction: GuildCommandInteraction
  )=> Promise<void>;
  autocomplete?: (
    camperChan: ExtendedClient,
    interaction: AutocompleteInteraction<"cached">
  )=> Promise<void>;
}
