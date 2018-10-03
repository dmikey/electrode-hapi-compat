"use strict";

const mockRequire = require("mock-require");

describe("Util", () => {
  let index;

  const hapi17Plugin = {
    register: (server, options) => {},
    pkg: {
      name: "My Sample",
      version: "1.0.0"
    }
  };

  afterEach(() => {
    delete require.cache[require.resolve("../../lib/util")];
    mockRequire.stopAll();
  });

  it("test index", () => {
    index = require("../..");
    expect(index.isHapi17).false;
  });

  it("test is hapi 17", () => {
    mockRequire("hapi/package", { version: "16.2.1" });
    index = require("../../lib/util");
    expect(index.isHapi17).false;
  });

  it("test is not hapi 17", () => {
    mockRequire("hapi/package", { version: "17.2.2" });
    index = require("../../lib/util");
    expect(index.isHapi17).true;
  });

  it("test no hapi", () => {
    mockRequire("hapi/package", null);
    index = require("../../lib/util");
    expect(index.isHapi17).false;
  });

  it("test supportHapi16 returns Hapi17 plugin for Hapi17", () => {
    mockRequire("hapi/package", { version: "17.0.0" });
    index = require("../../lib/util");
    const plugin = index.supportHapi16(hapi17Plugin);
    expect(plugin).equal(hapi17Plugin);
  });

  it("test supportHapi16 return Hapi16 plugin on Hapi16", () => {
    mockRequire("hapi/package", { version: "16.0.0" });
    index = require("../../lib/util");
    const plugin = index.supportHapi16(hapi17Plugin);
    expect(plugin).a("function");
    expect(plugin.attributes.pkg).equal(hapi17Plugin.pkg);
  });
});
