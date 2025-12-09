/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import { ChannelType } from "discord.js";
import fastify from "fastify";
import { errorHandler } from "../utils/errorHandler.js";
import { logHandler } from "../utils/logHandler.js";
import type { Appeal } from "../interfaces/appeal.js";
import type { ExtendedClient } from "../interfaces/extendedClient.js";

/**
 * Mounts a fastify server to allow for data analytics.
 * @param camperChan - The bot's Discord instance.
 */
export const instantiateServer = async(
  camperChan: ExtendedClient,
): Promise<void> => {
  try {
    const options: { logger: false; https?: { key: string; cert: string } } = {
      logger: false,
    };
    options.https = {
      cert: await readFile(
        "/etc/letsencrypt/live/camperchan.nhcarrigan.com/cert.pem",
        "utf-8",
      ),
      key: await readFile(
        "/etc/letsencrypt/live/camperchan.nhcarrigan.com/privkey.pem",
        "utf-8",
      ),
    };
    const server = fastify(options);

    server.get("/", (_request, response) => {
      response.status(200).send("Health Check!");
    });

    server.post("/github", async(request, response) => {
      const githubSecret = process.env.GITHUB_WEBHOOK_SECRET;
      if (githubSecret === undefined) {
        await response.status(500).send("No secret provided.");
        return;
      }
      const event = request.headers["x-github-event"];
      const signature = request.headers["x-hub-signature-256"];
      if (typeof event !== "string") {
        await response.
          status(400).
          send(`Invalid value ${String(event)} for X-GitHub-Event`);
        return;
      }
      if (typeof signature !== "string") {
        await response.
          status(400).
          send(`Invalid value ${String(signature)} for X-Hub-Signature-256`);
        return;
      }
      const sig = createHmac("sha256", githubSecret).
        update(JSON.stringify(request.body)).
        digest("hex");
      const trusted = Buffer.from(`sha256=${sig}`, "ascii");
      const sent = Buffer.from(signature, "ascii");
      const safe = timingSafeEqual(trusted, sent);
      if (!safe) {
        await response.
          status(401).
          send("Failed to verify webhook secret hash.");
        return;
      }
      // It's valid, so send an ok response immediately
      await response.status(200).send("OK~!");

      if (event === "pull_request") {
        // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/consistent-type-assertions -- I'll make a type guard at some point.
        const { action, pull_request, label } = request.body as {
          action:       string;
          // eslint-disable-next-line @typescript-eslint/naming-convention -- Github API name.
          pull_request: { title: string; html_url: string; number: number };
          label?:       { name: string };
        };
        if (
          label?.name !== "DO NOT MERGE"
          || ![ "labeled", "unlabeled" ].includes(action)
        ) {
          return;
        }
        await camperChan.octokit.rest.pulls.createReview({
          body:
            action === "labeled"
            // eslint-disable-next-line stylistic/max-len -- It's a string.
              ? "This PR has been marked as DO NOT MERGE. When you are ready to merge it, remove the label and I'll unblock the PR."
              // eslint-disable-next-line stylistic/max-len -- It's a string.
              : "This PR has been unmarked as DO NOT MERGE. You may now merge this PR.",
          event: action === "labeled"
            ? "REQUEST_CHANGES"
            : "APPROVE",
          owner:       "nhcarrigan",
          // eslint-disable-next-line @typescript-eslint/naming-convention -- Github API.
          pull_number: pull_request.number,
          repo:        "camperchan",
        });
      }

      if (event === "issues") {
        const channel = await camperChan.channels.fetch("1267979916964794530");
        if (channel === null || channel.type !== ChannelType.GuildText) {
          await errorHandler(
            camperChan,
            "fetch channel",
            new Error("Channel not found"),
          );
          return;
        }
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- I'll make a type guard at some point.
        const { action, issue, label } = request.body as {
          action: string;
          // eslint-disable-next-line @typescript-eslint/naming-convention -- Github API name.
          issue:  { title: string; html_url: string; number: number };
          label:  { name: string };
        };
        if (action === "labeled") {
          if (label.name === "help wanted") {
            await channel.send({
              content: `[#${issue.number.toString()} ${issue.title}](${issue.html_url}) is open for contribution!`,
            });
          }
          if (label.name === "first timers only") {
            await channel.send({
              content: `[#${issue.number.toString()} ${issue.title}](${issue.html_url}) is available for first-time contributors!`,
            });
          }
        }
      }
    });

    server.post("/appeal", async(request, response) => {
      const appealSecret = process.env.APPEAL_WEBHOOK_SECRET;
      if (appealSecret === undefined) {
        await response.status(500).send("No secret provided.");
        return;
      }
      const secretHeader = request.headers.Authorization;
      if (typeof secretHeader !== "string") {
        await response.
          status(400).
          send(`Invalid value ${String(secretHeader)} for Authorization`);
        return;
      }
      if (secretHeader !== appealSecret) {
        await response.status(401).send("Failed to verify appeal secret.");
        return;
      }
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- I'll make a type guard at some point.
      const { body } = request as { body: Array<Appeal> };
      if (body.length === 0) {
        await response.status(400).send("No appeal data provided.");
        return;
      }
      await Promise.all(
        body.map(async(appeal) => {
          // It's valid, so send an ok response immediately
          await response.status(200).send("OK~!");
          logHandler.log(
            "info",
            `New appeal received from ${appeal.Username} (${appeal.Discord_ID})`,
          );

          await fetch(
            "https://discord.com/api/v10/channels/987408145863307334/messages",
            {
              body: JSON.stringify({
                components: [
                  {
                    content: "# NEW BAN APPEAL",
                    type:    10,
                  },
                  {
                    // eslint-disable-next-line @typescript-eslint/naming-convention -- Discord API name.
                    accent_color: null,
                    components:   [
                      {
                        content: "**User Name and ID**",
                        type:    10,
                      },
                      {
                        content: `${appeal.Username} (${appeal.Discord_ID})`,
                        type:    10,
                      },
                    ],
                    spoiler: false,
                    type:    17,
                  },
                  {
                    // eslint-disable-next-line @typescript-eslint/naming-convention -- Discord API name.
                    accent_color: null,
                    components:   [
                      {
                        content:
                          "**I have read and will follow Code of Conduct**",
                        type: 10,
                      },
                      {
                        content: String(appeal.Code_of_Conduct),
                        type:    10,
                      },
                    ],
                    spoiler: false,
                    type:    17,
                  },
                  {
                    // eslint-disable-next-line @typescript-eslint/naming-convention -- Discord API name.
                    accent_color: null,
                    components:   [
                      {
                        content: "**Why were you banned?**",
                        type:    10,
                      },
                      {
                        content: appeal.Reason,
                        type:    10,
                      },
                    ],
                    spoiler: false,
                    type:    17,
                  },
                  {
                    // eslint-disable-next-line @typescript-eslint/naming-convention -- Discord API name.
                    accent_color: null,
                    components:   [
                      {
                        content: "**Was the ban fair? Why or why not?**",
                        type:    10,
                      },
                      {
                        content: appeal.Fairness,
                        type:    10,
                      },
                    ],
                    spoiler: false,
                    type:    17,
                  },
                  {
                    // eslint-disable-next-line @typescript-eslint/naming-convention -- Discord API name.
                    accent_color: null,
                    components:   [
                      {
                        content: "**How will your behaviour improve?**",
                        type:    10,
                      },
                      {
                        content: appeal.Improvement,
                        type:    10,
                      },
                    ],
                    spoiler: false,
                    type:    17,
                  },
                ],
                flags: 32_768,
              }),
              headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention -- Discord API name.
                "Authorization": `Bot ${process.env.TOKEN ?? ""}`,
                // eslint-disable-next-line @typescript-eslint/naming-convention -- Discord API name.
                "Content-Type":  "application/json",
              },
              method: "POST",
            },
          ).
            // eslint-disable-next-line max-nested-callbacks -- Necessary to handle the nested callback.
            then((responseInner) => {
              if (!responseInner.ok) {
                throw new Error(
                  `Failed to send appeal message: ${responseInner.statusText}`,
                );
              }
            }).
            catch(
              // eslint-disable-next-line max-nested-callbacks -- Necessary to handle the nested callback.
              (error: unknown) => {
                logHandler.error(JSON.stringify(error));
                return void errorHandler(
                  camperChan,
                  "send appeal message",
                  error,
                );
              },
            );
        }),
      );
    });

    server.listen({ port: 1443 }, (error) => {
      if (error) {
        void errorHandler(camperChan, "mount server instance", error);
        return;
      }
      void camperChan.config.debugHook.send({
        avatarURL:
          camperChan.user?.displayAvatarURL()
          ?? "https://cdn.nhcarrigan.com/profile.png",
        content:  "Fastify server live on port 1443~!",
        username: camperChan.user?.username ?? "Camperchan",
      });
    });
  } catch (error) {
    await errorHandler(camperChan, "instantiate server", error);
  }
};
