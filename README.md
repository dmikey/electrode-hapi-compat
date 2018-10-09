# electrode-hapi-compat

Utilities to help in the migration from Hapi 16 to Hapi 17.

## Usage

To create a wrapper that detects the Hapi version and return the appropriate plugin.

```
const {universalHapiPlugin} = require("@walmart/electrode-hapi-compat");

const registers = {
  hapi16: (server, options) => {...},
  hapi17: (server, options) => {...}
};
const pkg = {
  name: "MyPackage",
  version: "1.0.0"
};

module.exports = universalHapiPlugin(registers, pkg);
```

---

To test if Hapi 17 is installed

```
const { isHapi17 } = require("@walmart/electrode-hapi-compat");

console.log("Hapi 17 is installed:", isHapi17());
```

