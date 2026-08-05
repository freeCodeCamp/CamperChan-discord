import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  AttachmentBuilder,
  ChannelType,
  EmbedBuilder,
  type Message,
  MessageMentions,
  PermissionFlagsBits,
} from "discord.js";
import { hasKnownPhishingLink }
  from "../../modules/automod/hasKnownPhishingLink.js";
import { hasNonApprovedInvite }
  from "../../modules/automod/hasNonApprovedInvite.js";
import { messageCounter } from "../../modules/messageCounter.js";
import { sendModerationDm } from "../../modules/sendModerationDm.js";
import { updateHistory } from "../../modules/updateHistory.js";
import { customSubstring } from "../../utils/customSubstring.js";
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
  if (message.author.bot || message.system || !message.inGuild()) {
    return;
  }
  if (message.author.id === "465650873650118659") {
    if (message.content.startsWith("~cachebust")) {
      const [ , id ] = message.content.split(/\s+/g);
      if (id !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- Dynamic delete is required here.
        delete camperChan.learnAccounts[id];
      }
      await message.reply(`Cache cleared for ${String(id)}`);
    }
    if (message.content === "~contributors") {
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
      await message.reply(
        `Found ${String(above1000.length)} qualifying records.`,
      );
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
    && message.attachments.some((file) => {
      return (
        file.contentType !== null
        && !file.contentType.startsWith("image/")
        && !file.contentType.startsWith("video/")
      );
    })
    && message.channel.parentId !== "1381662314540957787"
  ) {
    await message.delete();
    await message.channel.send({
      content: `Hey <@!${message.author.id}>, it looks like you tried uploading something that wasn't an image or video. Please do not upload other files, to ensure the safety of our users.`,
    });
    return;
  }

  const inviteWithPing
    = MessageMentions.EveryonePattern.test(message.content)
    && await hasNonApprovedInvite(camperChan, message.content);
  const hasPhishingLink
    = await hasKnownPhishingLink(camperChan, message.content);
  // This channel is the "honeypot" channel. Regular members should never post in here.
  const isHoneypotPost = message.channel.id === "1286391728919810150";
  const triggers = [
    hasPhishingLink && "Known phishing link",
    inviteWithPing && "Unapproved invite with a mass ping",
    isHoneypotPost && "Posted in the honeypot channel",
  ].filter((trigger): trigger is string => {
    return typeof trigger === "string";
  });
  const isCompromised = triggers.length > 0;

  const isBannable = Boolean(message.member?.bannable);

  if (isCompromised && isBannable) {
    const reason = "Your account appears to be compromised.";
    // Recorded before the ban, as banning prunes the message itself.
    const stickerNames = message.stickers.map((sticker) => {
      return sticker.name;
    }).join(" ");
    const messageText
      = message.content === ""
        ? "no content"
        : message.content;
    const loggedContent = customSubstring(
      [ messageText, stickerNames ].filter(Boolean).join(" "),
      1000,
    );
    const sentNotice = await sendModerationDm(
      camperChan,
      {
        action:    "ban",
        guildName: message.guild.name,
        reason:    customSubstring(reason, 1000),
        user:      message.author,
      },
    );

    await message.member?.ban({
      deleteMessageDays: 1,
      reason:            customSubstring(reason, 1000),
    });

    await updateHistory(camperChan, "ban", message.member?.id ?? "");

    const banLogEmbed = new EmbedBuilder();
    banLogEmbed.setTitle("Member banned.");
    banLogEmbed.setDescription(`Member ban was requested by automoderation`);
    banLogEmbed.addFields([
      {
        name:  "Reason",
        value: customSubstring(reason, 1000),
      },
      {
        name:  "Trigger",
        value: triggers.join("\n"),
      },
      {
        inline: true,
        name:   "Channel",
        value:  `<#${message.channel.id}>`,
      },
      {
        inline: true,
        name:   "Message",
        value:  message.url,
      },
      {
        name:  "Content",
        value: loggedContent,
      },
      {
        name:  "User notified?",
        value: String(sentNotice),
      },
    ]);
    const attached = message.attachments.first();
    if (attached) {
      banLogEmbed.setImage(attached.proxyURL);
    }

    /*
     * The log message carries its own timestamp, so this preserves when the
     * offending message was sent instead.
     */
    banLogEmbed.setTimestamp(message.createdAt);
    banLogEmbed.setAuthor({
      iconURL: message.author.displayAvatarURL(),
      name:    message.author.tag,
    });
    banLogEmbed.setFooter({
      text: `ID: ${message.author.id} | Message sent`,
    });

    await camperChan.config.modHook.send({ embeds: [ banLogEmbed ] });

    if (message.embeds.length > 0) {
      await Promise.all(message.embeds.map(async(embed) => {
        return await camperChan.config.modHook.send({ embeds: [ embed ] });
      }));
    }
  }

  await messageCounter(camperChan, message);

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
