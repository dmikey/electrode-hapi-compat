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
const isHapi17 = hapiMajor() >= HAPI17;

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
  if (isHapi17) {
    return hapi17Plugin;
  } else {
    const register16 = wrapTo16(hapi17Plugin.register);
    register16.attributes = {
      pkg: hapi17Plugin.pkg
    };
    return register16;
  }
}

module.exports = {
  isHapi17,
  supportHapi16
};
