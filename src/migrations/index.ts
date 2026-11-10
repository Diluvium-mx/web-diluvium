import * as migration_20261105_183915_inicial from './20261105_183915_inicial';
import * as migration_20261106_161852_pedidos from './20261106_161852_pedidos';
import * as migration_20261110_172155_formularios from './20261110_172155_formularios';
import * as migration_20261110_172507_correos from './20261110_172507_correos';

export const migrations = [
  {
    up: migration_20261105_183915_inicial.up,
    down: migration_20261105_183915_inicial.down,
    name: '20261105_183915_inicial',
  },
  {
    up: migration_20261106_161852_pedidos.up,
    down: migration_20261106_161852_pedidos.down,
    name: '20261106_161852_pedidos',
  },
  {
    up: migration_20261110_172155_formularios.up,
    down: migration_20261110_172155_formularios.down,
    name: '20261110_172155_formularios',
  },
  {
    up: migration_20261110_172507_correos.up,
    down: migration_20261110_172507_correos.down,
    name: '20261110_172507_correos'
  },
];
