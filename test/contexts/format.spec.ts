import { assert } from "chai";
import { ApplicationCommandType } from "discord.js";

import { format } from "../../src/contexts/format";

suite("format context", () => {
  test("format context should be a context object.", () => {
    assert.isDefined(format.data);
    assert.isObject(format.data);
    assert.isDefined(format.run);
    assert.isFunction(format.run);
  });
  test("format context should be formatted correctly.", () => {
    assert.equal(format.data.name, "format");
    assert.equal(format.data.type, ApplicationCommandType.Message);
  });
});
