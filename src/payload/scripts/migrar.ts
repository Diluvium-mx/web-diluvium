// Crea o actualiza las tablas del administrador en D1 con migraciones (src/migrations). Si las colecciones cambian,
// «--nueva <nombre>» escribe la migración con los cambios; sin eso, aplica las que falten.
//
// Uso: npm run admin:migrar                    (aplica las migraciones pendientes; en esta Mac, a la copia local)
//      npm run admin:migrar -- --nueva <nombre> (escribe una migración nueva con lo que cambió)

import { getPayload } from "payload";
import config from "../../payload.config";

const payload = await getPayload({ config });
const i = process.argv.indexOf("--nueva");
if (i > 0) {
  await payload.db.createMigration({ payload, migrationName: process.argv[i + 1] ?? "cambios", skipEmpty: true, forceAcceptWarning: true });
} else {
  await payload.db.migrate();
}
process.exit(0);
