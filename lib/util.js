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

function wrap16(hapi17Plugin) {
  return function(server, options, next) {
    hapi17Plugin(server, options);
    next();
  };
}
function supportHapi16(hapi17Plugin) {
  if (isHapi17) {
    return hapi17Plugin;
  } else {
    const register16 = wrap16(hapi17Plugin.register);
    register16.attributes = {
      pkg: hapi17Plugin.pkg
    };
    return register16;
  }
}

const isHapi17 = hapiMajor() >= HAPI17;

module.exports = {
  isHapi17,
  supportHapi16
};
