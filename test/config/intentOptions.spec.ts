import { GatewayIntentBits } from "discord.js";
import { describe, assert, test } from "vitest";
import { intentOptions } from "../../src/config/intentOptions.js";

describe("intentOptions", () => {
  test("All necessary intents should be declared.", () => {
    assert.include(intentOptions, GatewayIntentBits.Guilds);
    assert.include(intentOptions, GatewayIntentBits.GuildMembers);
    assert.include(intentOptions, GatewayIntentBits.GuildModeration);
    assert.include(intentOptions, GatewayIntentBits.GuildMessages);
    assert.include(intentOptions, GatewayIntentBits.GuildMessageReactions);
    assert.include(intentOptions, GatewayIntentBits.MessageContent);
    assert.include(intentOptions, GatewayIntentBits.GuildVoiceStates);
  });
});
