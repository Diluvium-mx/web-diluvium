import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`correos\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`para\` text NOT NULL,
  	\`tipo\` text,
  	\`asunto\` text NOT NULL,
  	\`estado\` text DEFAULT 'pendiente',
  	\`fecha\` text,
  	\`pedido\` numeric,
  	\`error\` text,
  	\`html\` text,
  	\`texto\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`correos_updated_at_idx\` ON \`correos\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`correos_created_at_idx\` ON \`correos\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`correos_id\` integer REFERENCES correos(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_correos_id_idx\` ON \`payload_locked_documents_rels\` (\`correos_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`correos\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pedidos_id\` integer,
  	\`descuentos_id\` integer,
  	\`mensajes_id\` integer,
  	\`suscriptores_id\` integer,
  	\`productos_id\` integer,
  	\`resenas_id\` integer,
  	\`colecciones_id\` integer,
  	\`plantillas_id\` integer,
  	\`paginas_id\` integer,
  	\`politicas_id\` integer,
  	\`articulos_id\` integer,
  	\`fichas_seo_id\` integer,
  	\`medios_id\` integer,
  	\`usuarios_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pedidos_id\`) REFERENCES \`pedidos\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`descuentos_id\`) REFERENCES \`descuentos\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`mensajes_id\`) REFERENCES \`mensajes\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`suscriptores_id\`) REFERENCES \`suscriptores\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`productos_id\`) REFERENCES \`productos\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`resenas_id\`) REFERENCES \`resenas\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`colecciones_id\`) REFERENCES \`colecciones\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`plantillas_id\`) REFERENCES \`plantillas\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`paginas_id\`) REFERENCES \`paginas\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`politicas_id\`) REFERENCES \`politicas\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`articulos_id\`) REFERENCES \`articulos\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`fichas_seo_id\`) REFERENCES \`fichas_seo\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`medios_id\`) REFERENCES \`medios\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`usuarios_id\`) REFERENCES \`usuarios\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "pedidos_id", "descuentos_id", "mensajes_id", "suscriptores_id", "productos_id", "resenas_id", "colecciones_id", "plantillas_id", "paginas_id", "politicas_id", "articulos_id", "fichas_seo_id", "medios_id", "usuarios_id") SELECT "id", "order", "parent_id", "path", "pedidos_id", "descuentos_id", "mensajes_id", "suscriptores_id", "productos_id", "resenas_id", "colecciones_id", "plantillas_id", "paginas_id", "politicas_id", "articulos_id", "fichas_seo_id", "medios_id", "usuarios_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pedidos_id_idx\` ON \`payload_locked_documents_rels\` (\`pedidos_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_descuentos_id_idx\` ON \`payload_locked_documents_rels\` (\`descuentos_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_mensajes_id_idx\` ON \`payload_locked_documents_rels\` (\`mensajes_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_suscriptores_id_idx\` ON \`payload_locked_documents_rels\` (\`suscriptores_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_productos_id_idx\` ON \`payload_locked_documents_rels\` (\`productos_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_resenas_id_idx\` ON \`payload_locked_documents_rels\` (\`resenas_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_colecciones_id_idx\` ON \`payload_locked_documents_rels\` (\`colecciones_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_plantillas_id_idx\` ON \`payload_locked_documents_rels\` (\`plantillas_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_paginas_id_idx\` ON \`payload_locked_documents_rels\` (\`paginas_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_politicas_id_idx\` ON \`payload_locked_documents_rels\` (\`politicas_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_articulos_id_idx\` ON \`payload_locked_documents_rels\` (\`articulos_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_fichas_seo_id_idx\` ON \`payload_locked_documents_rels\` (\`fichas_seo_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_medios_id_idx\` ON \`payload_locked_documents_rels\` (\`medios_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_usuarios_id_idx\` ON \`payload_locked_documents_rels\` (\`usuarios_id\`);`)
}
