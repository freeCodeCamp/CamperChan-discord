import type { ExtendedClient } from "./extendedClient.js";
import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

export interface Command {
  data: SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder;
  run: (
    camperChan: ExtendedClient,
    interaction: ChatInputCommandInteraction<"cached">
  )=> Promise<void>;
  autocomplete?: (
    camperChan: ExtendedClient,
    interaction: AutocompleteInteraction<"cached">
  )=> Promise<void>;
}
