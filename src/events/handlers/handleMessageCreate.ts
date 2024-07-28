import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  AttachmentBuilder,
  ChannelType,
  type Message,
  PermissionFlagsBits,
} from "discord.js";
import { levelListener } from "../../modules/levelListener.js";
import { loadRoles } from "../../modules/loadRoles.js";
import { messageCounter } from "../../modules/messageCounter.js";
import type { ExtendedClient } from "../../interfaces/extendedClient.js";

/**
 * Handles the message create events.
 * @param camperChan - The camperChan's Discord instance.
 * @param message - The message payload from Discord.
 */
export const handleMessageCreate = async(
  camperChan: ExtendedClient,
  message: Message,
): Promise<void> => {
  if (message.author.bot || message.system) {
    return;
  }
  if (message.author.id === "465650873650118659") {
    if (message.content.startsWith("~cachebust")) {
      const [ , id ] = message.content.split(/\s+/g);
      if (id !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete camperChan.learnAccounts[id];
      }
      await message.reply(`Cache cleared for ${String(id)}`);
    }
    if (message.content === "~roles") {
      await message.reply("Loading language roles.");
      await loadRoles(camperChan);
      await message.reply("Done~!");
    }
    if (message.content === "~contributors" && message.guild) {
      await message.reply("Fetching records.");
      const allRecords = await camperChan.db.messages.findMany({});
      const above1000 = allRecords.
        filter((r) => {
          return r.messages >= 1000;
        }).
        sort((a, b) => {
          return b.messages - a.messages;
        }).
        map((r) => {
          return `${r.userTag},${String(r.messages)}`;
        });
      await message.reply(`Found ${String(above1000.length)} qualifying records.`);
      const fileContents = `username,messages\n${above1000.join("\n")}`;
      const file = new AttachmentBuilder(Buffer.from(fileContents, "utf-8"), {
        name: "contributors.csv",
      });
      await message.reply({
        files: [ file ],
      });
    }
  }

  if (
    message.member !== null
    // Safe to make optional here, as member should only be null for a DM.
    && !message.member.permissions.has(PermissionFlagsBits.ManageMessages)
    && message.attachments.size > 0
    && message.attachments.some(
      (file) => {
        return file.contentType !== null
        && !file.contentType.startsWith("image/")
        && !file.contentType.startsWith("video/");
      },
    )
  ) {
    await message.delete();
    await message.channel.send({
      content: `Hey <@!${message.author.id}>, it looks like you tried uploading something that wasn't an image or video. Please do not upload other files, to ensure the safety of our users.`,
    });
    return;
  }

  await messageCounter(camperChan, message);
  await levelListener(camperChan, message);

  if (
    message.channel.type !== ChannelType.GuildText
    || !message.channel.name.startsWith("private-")
  ) {
    return;
  }
  const logId = camperChan.privateLogs[message.channel.id];
  if (logId === undefined) {
    return;
  }
  const logFile = await readFile(
    join(process.cwd(), "logs", `${logId}.txt`),
    "utf8",
  );

  const parsedString = `[${new Date(
    message.createdTimestamp,
  ).toLocaleString()}] - ${message.author.tag}: ${message.content}\n`;

  await writeFile(
    join(process.cwd(), "logs", `${logId}.txt`),
    logFile + parsedString,
  );
};
