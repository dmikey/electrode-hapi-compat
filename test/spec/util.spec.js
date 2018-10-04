"use strict";

const hapi = require("hapi");
const mockRequire = require("mock-require");

describe("Util", () => {
  let index;
  let hapiServer;
  let extCalled;

  const hapi17Plugin = {
    register: () => {},
    pkg: {
      name: "My Sample",
      version: "1.0.0"
    }
  };
  const hapi17PluginWithExt = {
    register: function(server) {
      server.ext("onPreHandler", function(request, h) {
        extCalled.onPreHandler = true;
        return h.continue;
      });
    },
    pkg: {
      name: "PluginForExt",
      version: "1.0.1"
    }
  };

  beforeEach(() => {
    extCalled = [];
    hapiServer = new hapi.Server();
    hapiServer.connection({ port: 80 });
    hapiServer.route({
      method: "GET",
      path: "/test",
      handler: (req, reply) => {
        return reply("ok");
      }
    });
  });

  afterEach(() => {
    hapiServer.stop();
    delete require.cache[require.resolve("../../lib/util")];
    mockRequire.stopAll();
  });

  it("test index", () => {
    index = require("../..");
    expect(index.isHapi17).false;
  });

  it("test is hapi 17", () => {
    mockRequire("hapi/package", { version: "17.2.2" });
    index = require("../../lib/util");
    expect(index.isHapi17).true;
  });

  it("test is not hapi 17", () => {
    index = require("../../lib/util");
    expect(index.isHapi17).false;
  });

  it("test no hapi defaults hapi 16", () => {
    mockRequire("hapi/package", null);
    index = require("../../lib/util");
    expect(index.isHapi17).false;
  });

  it("test supportHapi16 handles Hapi17 plugin on Hapi 17", () => {
    mockRequire("hapi/package", { version: "17.0.0" });
    index = require("../../lib/util");
    const plugin = index.supportHapi16(hapi17Plugin);
    expect(plugin).equal(hapi17Plugin);
  });

  it("test supportHapi16 converts Hapi17 plugin with ext", done => {
    index = require("../../lib/util");
    const plugin16 = index.supportHapi16(hapi17PluginWithExt);

    hapiServer.register(plugin16);

    hapiServer.inject("/test", res => {
      expect(plugin16).a("function");
      expect(plugin16.attributes.pkg).equal(hapi17PluginWithExt.pkg);
      expect(extCalled.onPreHandler).true;
      expect(res.result).eq("ok");
      done();
    });
  });
});
