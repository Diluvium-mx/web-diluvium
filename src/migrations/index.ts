import * as migration_20261105_183915_inicial from './20261105_183915_inicial';
import * as migration_20261106_161852_pedidos from './20261106_161852_pedidos';

export const migrations = [
  {
    up: migration_20261105_183915_inicial.up,
    down: migration_20261105_183915_inicial.down,
    name: '20261105_183915_inicial',
  },
  {
    up: migration_20261106_161852_pedidos.up,
    down: migration_20261106_161852_pedidos.down,
    name: '20261106_161852_pedidos'
  },
];
