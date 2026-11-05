import * as migration_20261105_183915_inicial from './20261105_183915_inicial';

export const migrations = [
  {
    up: migration_20261105_183915_inicial.up,
    down: migration_20261105_183915_inicial.down,
    name: '20261105_183915_inicial'
  },
];
