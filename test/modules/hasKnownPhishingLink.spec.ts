import { afterEach, assert, describe, it, vi } from "vitest";
import {
  hasKnownPhishingLink,
  isTrustedLink,
} from "../../src/modules/automod/hasKnownPhishingLink.js";
import { errorHandler } from "../../src/utils/errorHandler.js";
import type { ExtendedClient } from "../../src/interfaces/extendedClient.js";

vi.mock("../../src/utils/errorHandler.js", () => {
  return { errorHandler: vi.fn() };
});

const bot = {} as unknown as ExtendedClient;

const mockWalshyApi = (
  walshyFlagsDomain: boolean,
): ReturnType<typeof vi.fn> => {
  const fetchMock = vi.fn(() => {
    return Promise.resolve({
      json: () => {
        return Promise.resolve({ badDomain: walshyFlagsDomain });
      },
      ok:     true,
      status: 200,
    });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

const mockWalshyResponse = (
  status: number,
  body: unknown,
): void => {
  const isSuccessful = status >= 200 && status < 300;
  vi.stubGlobal("fetch", vi.fn(() => {
    return Promise.resolve({
      json: () => {
        return Promise.resolve(body);
      },
      ok:     isSuccessful,
      status: status,
    });
  }));
};

describe("isTrustedLink", () => {
  it("trusts klipy.com links", () => {
    assert.isTrue(
      isTrustedLink("https://klipy.com/gifs/anime-my-dress-up-darling-4"),
    );
  });

  it("trusts klipy.com subdomains", () => {
    assert.isTrue(isTrustedLink("https://static.klipy.com/image.gif"));
  });

  it("is case insensitive", () => {
    assert.isTrue(isTrustedLink("https://KLIPY.com/gifs/test"));
  });

  it("does not trust lookalike domains", () => {
    assert.isFalse(isTrustedLink("https://notklipy.com/gifs/test"));
    assert.isFalse(isTrustedLink("https://klipy.com.evil.example/gifs/test"));
  });

  it("does not trust userinfo spoofing", () => {
    assert.isFalse(isTrustedLink("https://klipy.com@evil.example/gifs/test"));
  });

  it("does not trust unparseable links", () => {
    assert.isFalse(isTrustedLink("https://example.com:99999/"));
  });
});

describe("hasKnownPhishingLink", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("skips the phishing API for klipy.com links", async() => {
    const fetchMock = mockWalshyApi(true);
    const result = await hasKnownPhishingLink(
      bot,
      "look https://klipy.com/gifs/anime-my-dress-up-darling-4",
    );
    assert.isFalse(result);
    assert.equal(fetchMock.mock.calls.length, 0);
  });

  it("still flags a spoofed klipy.com link", async() => {
    mockWalshyApi(true);
    const result = await hasKnownPhishingLink(
      bot,
      "https://klipy.com@evil.example/free-nitro",
    );
    assert.isTrue(result);
  });

  it("returns false when there are no links", async() => {
    mockWalshyApi(true);
    assert.isFalse(await hasKnownPhishingLink(bot, "no links here"));
  });

  it("flags domains reported by the Walshy API", async() => {
    mockWalshyApi(true);
    assert.isTrue(await hasKnownPhishingLink(bot, "https://bad.example/x"));
  });

  it("passes domains that the API does not report", async() => {
    mockWalshyApi(false);
    assert.isFalse(await hasKnownPhishingLink(bot, "https://good.example/x"));
  });

  it("does not flag links when the API returns an error status", async() => {
    mockWalshyResponse(500, { message: "Internal Server Error" });
    const result = await hasKnownPhishingLink(bot, "https://good.example/x");
    assert.isFalse(result);
    assert.equal(vi.mocked(errorHandler).mock.calls.length, 1);
  });

  it("does not flag links when the verdict is not a boolean", async() => {
    mockWalshyResponse(200, { badDomain: { message: "rate limited" } });
    assert.isFalse(await hasKnownPhishingLink(bot, "https://good.example/x"));
  });
});
