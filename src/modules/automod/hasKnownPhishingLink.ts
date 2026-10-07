/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { errorHandler } from "../../utils/errorHandler.js";
import type { ExtendedClient } from "../../interfaces/extendedClient.js";

const trustedDomains = [ "klipy.com" ];

/**
 * Determines whether a link points at a trusted domain (or one of its
 * subdomains), so it can skip the phishing APIs.
 * Parses the full URL rather than trusting the regex capture, as a link like
 * `https://klipy.com@evil.com` would otherwise be treated as trusted.
 * @param link - The full link, as found in the message.
 * @returns Whether the link's real hostname is a trusted domain.
 */
const isTrustedLink = (link: string): boolean => {
  try {
    const { hostname } = new URL(link);
    return trustedDomains.some((trustedDomain) => {
      return hostname === trustedDomain
      || hostname.endsWith(`.${trustedDomain}`);
    });
  } catch {
    return false;
  }
};

/**
 * Module to check if links in messages are phishing sites.
 * Links to trusted domains are skipped, as the phishing API
 * produces false positives for them. Otherwise, uses an API developed by
 * Walshy.
 * @param bot - The bot's Discord instance.
 * @param content - The message content payload from Discord.
 * @returns Whether a phishing link was found.
 */
const hasKnownPhishingLink = async(
  bot: ExtendedClient,
  content: string,
): Promise<boolean> => {
  try {
    const linkRegex
      = /https?:\/\/(?<domain>(?:(?:[\da-z-]+\.)+[a-z]{2,}))(?::\d{1,5})?\S*/gi;

    const linksInMessage = content.matchAll(linkRegex);

    const linkResults = await Promise.all(
      [ ...linksInMessage ].map(async(link) => {
        const rawDomain = link.groups?.domain;
        if (rawDomain === undefined) {
          return false;
        }
        if (isTrustedLink(link[0])) {
          return false;
        }
        const domain = encodeURI(rawDomain);
        const walshyRequest

      = await fetch("https://bad-domains.walshy.dev/check", {
        body:    JSON.stringify({ domain }),
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention -- Header name requires dash.
          "X-Identity": "Rythm Moderation - built by naomi_lgbt",
          "accept":     "application/json",
        },
        method: "POST",
      });
        if (!walshyRequest.ok) {
          throw new Error(
            `Walshy API responded with status ${String(walshyRequest.status)}`,
          );
        }
        const walshyResponse
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- .json() doesn't accept a generic.
      = (await walshyRequest.json()) as { badDomain: unknown };
        return walshyResponse.badDomain === true;
      }),
    );
    return linkResults.includes(true);
  } catch (error) {
    await errorHandler(bot, "phishing listener", error);
    return false;
  }
};

export { hasKnownPhishingLink, isTrustedLink };
