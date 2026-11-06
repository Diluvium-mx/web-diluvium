import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`pedidos_articulos\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`titulo\` text,
  	\`opcion\` text,
  	\`cantidad\` numeric,
  	\`precio\` numeric,
  	\`id_variante\` numeric,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pedidos\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pedidos_articulos_order_idx\` ON \`pedidos_articulos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pedidos_articulos_parent_id_idx\` ON \`pedidos_articulos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pedidos_envios\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`guia\` text NOT NULL,
  	\`paqueteria\` text,
  	\`notificar\` integer DEFAULT true,
  	\`notificado\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pedidos\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pedidos_envios_order_idx\` ON \`pedidos_envios\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pedidos_envios_parent_id_idx\` ON \`pedidos_envios\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pedidos_historial\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`fecha\` text,
  	\`evento\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pedidos\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pedidos_historial_order_idx\` ON \`pedidos_historial\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pedidos_historial_parent_id_idx\` ON \`pedidos_historial\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pedidos\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`titulo\` text,
  	\`numero\` numeric NOT NULL,
  	\`clave\` text,
  	\`estado_pago\` text DEFAULT 'pendiente',
  	\`estado_preparacion\` text DEFAULT 'no-preparado',
  	\`totales_subtotal\` numeric,
  	\`totales_descuento\` numeric,
  	\`totales_codigo_descuento\` text,
  	\`totales_envio\` numeric,
  	\`totales_metodo_envio\` text,
  	\`total\` numeric,
  	\`pago_metodo\` text,
  	\`pago_meses\` numeric,
  	\`pago_id_pago\` text,
  	\`pago_detalle\` text,
  	\`cliente\` text,
  	\`correo\` text,
  	\`novedades\` integer,
  	\`entrega_nombre\` text,
  	\`entrega_apellidos\` text,
  	\`entrega_direccion\` text,
  	\`entrega_interior\` text,
  	\`entrega_codigo_postal\` text,
  	\`entrega_ciudad\` text,
  	\`entrega_estado\` text,
  	\`entrega_telefono\` text,
  	\`facturacion_nombre\` text,
  	\`facturacion_apellidos\` text,
  	\`facturacion_direccion\` text,
  	\`facturacion_interior\` text,
  	\`facturacion_codigo_postal\` text,
  	\`facturacion_ciudad\` text,
  	\`facturacion_estado\` text,
  	\`facturacion_telefono\` text,
  	\`notas\` text,
  	\`comentarios\` text,
  	\`etiquetas\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pedidos_numero_idx\` ON \`pedidos\` (\`numero\`);`)
  await db.run(sql`CREATE INDEX \`pedidos_clave_idx\` ON \`pedidos\` (\`clave\`);`)
  await db.run(sql`CREATE INDEX \`pedidos_updated_at_idx\` ON \`pedidos\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`pedidos_created_at_idx\` ON \`pedidos\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`descuentos\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`codigo\` text NOT NULL,
  	\`tipo\` text DEFAULT 'porcentaje' NOT NULL,
  	\`valor\` numeric NOT NULL,
  	\`minimo\` numeric,
  	\`desde\` text,
  	\`hasta\` text,
  	\`usos_maximos\` numeric,
  	\`usos\` numeric DEFAULT 0,
  	\`activo\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`descuentos_codigo_idx\` ON \`descuentos\` (\`codigo\`);`)
  await db.run(sql`CREATE INDEX \`descuentos_updated_at_idx\` ON \`descuentos\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`descuentos_created_at_idx\` ON \`descuentos\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`ajustes_venta\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`envio_nombre\` text DEFAULT 'Terrestre 3–5 días',
  	\`envio_gratis_desde\` numeric DEFAULT 499,
  	\`envio_costo\` numeric DEFAULT 0,
  	\`siguiente_numero\` numeric DEFAULT 1362,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`pedidos_id\` integer REFERENCES pedidos(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`descuentos_id\` integer REFERENCES descuentos(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pedidos_id_idx\` ON \`payload_locked_documents_rels\` (\`pedidos_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_descuentos_id_idx\` ON \`payload_locked_documents_rels\` (\`descuentos_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`pedidos_articulos\`;`)
  await db.run(sql`DROP TABLE \`pedidos_envios\`;`)
  await db.run(sql`DROP TABLE \`pedidos_historial\`;`)
  await db.run(sql`DROP TABLE \`pedidos\`;`)
  await db.run(sql`DROP TABLE \`descuentos\`;`)
  await db.run(sql`DROP TABLE \`ajustes_venta\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
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
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "productos_id", "resenas_id", "colecciones_id", "plantillas_id", "paginas_id", "politicas_id", "articulos_id", "fichas_seo_id", "medios_id", "usuarios_id") SELECT "id", "order", "parent_id", "path", "productos_id", "resenas_id", "colecciones_id", "plantillas_id", "paginas_id", "politicas_id", "articulos_id", "fichas_seo_id", "medios_id", "usuarios_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
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
