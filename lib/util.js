"use strict";
/* eslint-disable global-require */

const HAPI16 = 16;
const HAPI17 = 17;

function hapiMajor() {
  let hapiPkg;
  try {
    hapiPkg = require("hapi/package");
  } catch (err) {
    // ignore
  }
  return hapiPkg ? +hapiPkg.version.split(".")[0] : HAPI16;
}
let _isHapi17 = hapiMajor() >= HAPI17;

function isHapi17() {
  return _isHapi17;
}

function _testSetHapi17(isHapi17Flag) {
  _isHapi17 = isHapi17Flag;
}

function wrapTo16(hapi17Plugin) {
  return function(server16, options, next) {
    const fakeServer17 = {
      events: {
        on: server16.on
      },
      ext: function(event, handler17) {
        server16.ext(event, (request, reply) => {
          const continueSym = Symbol("CONTINUE");
          const h = {
            continue: continueSym
          };
          const resp = handler17(request, h);
          // istanbul ignore else
          if (resp === continueSym) {
            reply.continue();
          }
        });
      }
    };

    hapi17Plugin(fakeServer17, options);
    next();
  };
}

function supportHapi16(hapi17Plugin) {
  if (isHapi17()) {
    return hapi17Plugin;
  } else {
    const register16 = wrapTo16(hapi17Plugin.register);
    register16.attributes = {
      pkg: hapi17Plugin.pkg
    };
    return register16;
  }
}

/**
 * Detects the installed Hapi version and use the appropriate plugin
 *
 * @param {*} registers: { hapi16, hapi17 } contains registers for hapi16, hapi17
 * @param {*} pkg : package for a hapi plugin
 * @returns {*}: Hapi plugin appropriate for installed version
 *
 */
function universalHapiPlugin(registers, pkg) {
  if (isHapi17()) {
    return {
      register: registers.hapi17,
      pkg
    };
  } else {
    registers.hapi16.attributes = {
      pkg
    };
    return registers.hapi16;
  }
}

module.exports = {
  isHapi17,
  supportHapi16,
  universalHapiPlugin,
  _testSetHapi17
};
