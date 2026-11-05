import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`productos_opciones_valores\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`valor\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`productos_opciones\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`productos_opciones_valores_order_idx\` ON \`productos_opciones_valores\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`productos_opciones_valores_parent_id_idx\` ON \`productos_opciones_valores\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`productos_opciones\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`nombre\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`productos\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`productos_opciones_order_idx\` ON \`productos_opciones\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`productos_opciones_parent_id_idx\` ON \`productos_opciones\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`productos_variantes\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`titulo\` text NOT NULL,
  	\`precio\` numeric NOT NULL,
  	\`precio_antes\` numeric,
  	\`existencias\` numeric,
  	\`opcion1\` text,
  	\`codigo_barras\` text,
  	\`sku\` text,
  	\`imagen_id\` integer,
  	\`id_variante\` numeric,
  	FOREIGN KEY (\`imagen_id\`) REFERENCES \`medios\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`productos\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`productos_variantes_order_idx\` ON \`productos_variantes\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`productos_variantes_parent_id_idx\` ON \`productos_variantes\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`productos_variantes_imagen_idx\` ON \`productos_variantes\` (\`imagen_id\`);`)
  await db.run(sql`CREATE TABLE \`productos_imagenes\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`imagen_id\` integer NOT NULL,
  	\`alt\` text,
  	\`ancho\` numeric,
  	\`alto\` numeric,
  	FOREIGN KEY (\`imagen_id\`) REFERENCES \`medios\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`productos\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`productos_imagenes_order_idx\` ON \`productos_imagenes\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`productos_imagenes_parent_id_idx\` ON \`productos_imagenes\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`productos_imagenes_imagen_idx\` ON \`productos_imagenes\` (\`imagen_id\`);`)
  await db.run(sql`CREATE TABLE \`productos_videos\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`video_id\` integer NOT NULL,
  	\`portada_id\` integer NOT NULL,
  	\`posicion\` numeric NOT NULL,
  	FOREIGN KEY (\`video_id\`) REFERENCES \`medios\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`portada_id\`) REFERENCES \`medios\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`productos\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`productos_videos_order_idx\` ON \`productos_videos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`productos_videos_parent_id_idx\` ON \`productos_videos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`productos_videos_video_idx\` ON \`productos_videos\` (\`video_id\`);`)
  await db.run(sql`CREATE INDEX \`productos_videos_portada_idx\` ON \`productos_videos\` (\`portada_id\`);`)
  await db.run(sql`CREATE TABLE \`productos\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`titulo\` text NOT NULL,
  	\`nombre\` text NOT NULL,
  	\`plantilla\` text DEFAULT 'basica',
  	\`descripcion_html\` text,
  	\`proveedor\` text,
  	\`tipo\` text,
  	\`etiquetas\` text,
  	\`orden\` numeric,
  	\`id_producto\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`productos_nombre_idx\` ON \`productos\` (\`nombre\`);`)
  await db.run(sql`CREATE INDEX \`productos_updated_at_idx\` ON \`productos\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`productos_created_at_idx\` ON \`productos\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`resenas_fotos\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`foto_id\` integer NOT NULL,
  	FOREIGN KEY (\`foto_id\`) REFERENCES \`medios\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`resenas\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`resenas_fotos_order_idx\` ON \`resenas_fotos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`resenas_fotos_parent_id_idx\` ON \`resenas_fotos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`resenas_fotos_foto_idx\` ON \`resenas_fotos\` (\`foto_id\`);`)
  await db.run(sql`CREATE TABLE \`resenas\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`nombre\` text NOT NULL,
  	\`calificacion\` numeric NOT NULL,
  	\`texto\` text,
  	\`varias_fotos\` integer,
  	\`producto_id\` integer,
  	\`publicada\` integer DEFAULT true,
  	\`orden\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`producto_id\`) REFERENCES \`productos\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`resenas_producto_idx\` ON \`resenas\` (\`producto_id\`);`)
  await db.run(sql`CREATE INDEX \`resenas_updated_at_idx\` ON \`resenas\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`resenas_created_at_idx\` ON \`resenas\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`colecciones\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`titulo\` text NOT NULL,
  	\`nombre\` text NOT NULL,
  	\`descripcion_html\` text,
  	\`imagen_id\` integer,
  	\`imagen_compartir_id\` integer,
  	\`orden_predeterminado\` text,
  	\`ordenes\` text,
  	\`precio_maximo\` numeric,
  	\`en_lista\` numeric,
  	\`orden\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`imagen_id\`) REFERENCES \`medios\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`imagen_compartir_id\`) REFERENCES \`medios\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`colecciones_nombre_idx\` ON \`colecciones\` (\`nombre\`);`)
  await db.run(sql`CREATE INDEX \`colecciones_imagen_idx\` ON \`colecciones\` (\`imagen_id\`);`)
  await db.run(sql`CREATE INDEX \`colecciones_imagen_compartir_idx\` ON \`colecciones\` (\`imagen_compartir_id\`);`)
  await db.run(sql`CREATE INDEX \`colecciones_updated_at_idx\` ON \`colecciones\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`colecciones_created_at_idx\` ON \`colecciones\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`colecciones_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`productos_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`colecciones\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`productos_id\`) REFERENCES \`productos\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`colecciones_rels_order_idx\` ON \`colecciones_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`colecciones_rels_parent_idx\` ON \`colecciones_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`colecciones_rels_path_idx\` ON \`colecciones_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`colecciones_rels_productos_id_idx\` ON \`colecciones_rels\` (\`productos_id\`);`)
  await db.run(sql`CREATE TABLE \`plantillas\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`titulo\` text NOT NULL,
  	\`archivo\` text NOT NULL,
  	\`secciones\` text,
  	\`orden\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`plantillas_archivo_idx\` ON \`plantillas\` (\`archivo\`);`)
  await db.run(sql`CREATE INDEX \`plantillas_updated_at_idx\` ON \`plantillas\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`plantillas_created_at_idx\` ON \`plantillas\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`paginas\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`titulo\` text NOT NULL,
  	\`nombre\` text NOT NULL,
  	\`titulo_visible\` text,
  	\`cuerpo\` text,
  	\`orden\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`paginas_nombre_idx\` ON \`paginas\` (\`nombre\`);`)
  await db.run(sql`CREATE INDEX \`paginas_updated_at_idx\` ON \`paginas\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`paginas_created_at_idx\` ON \`paginas\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`politicas\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`titulo\` text NOT NULL,
  	\`nombre\` text NOT NULL,
  	\`titulo_visible\` text,
  	\`cuerpo\` text,
  	\`orden\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`politicas_nombre_idx\` ON \`politicas\` (\`nombre\`);`)
  await db.run(sql`CREATE INDEX \`politicas_updated_at_idx\` ON \`politicas\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`politicas_created_at_idx\` ON \`politicas\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`articulos\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`titulo\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`resumen\` text,
  	\`cuerpo\` text,
  	\`imagen_foto_id\` integer,
  	\`imagen_alt\` text,
  	\`imagen_ancho\` numeric,
  	\`imagen_alto\` numeric,
  	\`autor\` text,
  	\`fecha\` text,
  	\`publicado\` text,
  	\`etiquetas\` text,
  	\`anterior\` text,
  	\`siguiente\` text,
  	\`seo_titulo\` text,
  	\`seo_descripcion\` text,
  	\`orden\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`imagen_foto_id\`) REFERENCES \`medios\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`articulos_slug_idx\` ON \`articulos\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`articulos_imagen_imagen_foto_idx\` ON \`articulos\` (\`imagen_foto_id\`);`)
  await db.run(sql`CREATE INDEX \`articulos_updated_at_idx\` ON \`articulos\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`articulos_created_at_idx\` ON \`articulos\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`fichas_seo\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`ruta\` text NOT NULL,
  	\`titulo\` text NOT NULL,
  	\`descripcion\` text,
  	\`canonica\` text,
  	\`og_tipo\` text,
  	\`og_titulo\` text,
  	\`og_descripcion\` text,
  	\`og_imagen_id\` integer,
  	\`og_ancho\` numeric,
  	\`og_alto\` numeric,
  	\`twitter_tarjeta\` text,
  	\`twitter_titulo\` text,
  	\`twitter_descripcion\` text,
  	\`orden\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`og_imagen_id\`) REFERENCES \`medios\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`fichas_seo_ruta_idx\` ON \`fichas_seo\` (\`ruta\`);`)
  await db.run(sql`CREATE INDEX \`fichas_seo_og_og_imagen_idx\` ON \`fichas_seo\` (\`og_imagen_id\`);`)
  await db.run(sql`CREATE INDEX \`fichas_seo_updated_at_idx\` ON \`fichas_seo\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`fichas_seo_created_at_idx\` ON \`fichas_seo\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`medios\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text,
  	\`ruta\` text,
  	\`_objectkey\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric
  );
  `)
  await db.run(sql`CREATE INDEX \`medios_updated_at_idx\` ON \`medios\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`medios_created_at_idx\` ON \`medios\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`medios_filename_idx\` ON \`medios\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`usuarios_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`usuarios\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`usuarios_sessions_order_idx\` ON \`usuarios_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`usuarios_sessions_parent_id_idx\` ON \`usuarios_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`usuarios\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`nombre\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`reset_password_requested_at\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`usuarios_updated_at_idx\` ON \`usuarios\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`usuarios_created_at_idx\` ON \`usuarios\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`usuarios_email_idx\` ON \`usuarios\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
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
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`usuarios_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`usuarios_id\`) REFERENCES \`usuarios\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_usuarios_id_idx\` ON \`payload_preferences_rels\` (\`usuarios_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`menus_principal_enlaces\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`texto\` text NOT NULL,
  	\`url\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`menus\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`menus_principal_enlaces_order_idx\` ON \`menus_principal_enlaces\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`menus_principal_enlaces_parent_id_idx\` ON \`menus_principal_enlaces\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`menus_pie_enlaces\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`texto\` text NOT NULL,
  	\`url\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`menus\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`menus_pie_enlaces_order_idx\` ON \`menus_pie_enlaces\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`menus_pie_enlaces_parent_id_idx\` ON \`menus_pie_enlaces\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`menus_redes\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`red\` text,
  	\`url\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`menus\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`menus_redes_order_idx\` ON \`menus_redes\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`menus_redes_parent_id_idx\` ON \`menus_redes\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`menus\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`principal_titulo\` text,
  	\`pie_titulo\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`carrusel_resenas_fila1\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`resena_id\` integer NOT NULL,
  	\`foto_id\` integer,
  	FOREIGN KEY (\`resena_id\`) REFERENCES \`resenas\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`foto_id\`) REFERENCES \`medios\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`carrusel_resenas\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`carrusel_resenas_fila1_order_idx\` ON \`carrusel_resenas_fila1\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`carrusel_resenas_fila1_parent_id_idx\` ON \`carrusel_resenas_fila1\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`carrusel_resenas_fila1_resena_idx\` ON \`carrusel_resenas_fila1\` (\`resena_id\`);`)
  await db.run(sql`CREATE INDEX \`carrusel_resenas_fila1_foto_idx\` ON \`carrusel_resenas_fila1\` (\`foto_id\`);`)
  await db.run(sql`CREATE TABLE \`carrusel_resenas_fila2\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`resena_id\` integer NOT NULL,
  	\`foto_id\` integer,
  	FOREIGN KEY (\`resena_id\`) REFERENCES \`resenas\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`foto_id\`) REFERENCES \`medios\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`carrusel_resenas\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`carrusel_resenas_fila2_order_idx\` ON \`carrusel_resenas_fila2\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`carrusel_resenas_fila2_parent_id_idx\` ON \`carrusel_resenas_fila2\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`carrusel_resenas_fila2_resena_idx\` ON \`carrusel_resenas_fila2\` (\`resena_id\`);`)
  await db.run(sql`CREATE INDEX \`carrusel_resenas_fila2_foto_idx\` ON \`carrusel_resenas_fila2\` (\`foto_id\`);`)
  await db.run(sql`CREATE TABLE \`carrusel_resenas\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`resumen_texto\` text,
  	\`resumen_calificacion\` numeric,
  	\`resumen_total\` numeric,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`ajustes_tema\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`claves\` text,
  	\`sale_badge_text\` text,
  	\`sold_out_text\` text,
  	\`product_information_low_stock_threshold\` numeric,
  	\`variant_swatches_option\` text,
  	\`product_card_image_type\` text,
  	\`enable_product_card_sold_out_badge\` integer,
  	\`quick_buy_show_stock_number\` integer,
  	\`quick_buy_variant_picker_type\` text,
  	\`show_collection_product_quantity\` integer,
  	\`search_type\` text,
  	\`cart_notification_type\` text,
  	\`empty_state_link\` text,
  	\`cart_show_free_shipping_notification\` integer,
  	\`cart_minimum_order_price_for_free_shipping\` text,
  	\`social_facebook_link\` text,
  	\`social_instagram_link\` text,
  	\`social_youtube_link\` text,
  	\`social_linkedin_link\` text,
  	\`favicon_id\` integer,
  	\`currency_code_enabled\` integer,
  	\`page_background\` text,
  	\`color_scheme_drawer_popover\` text,
  	\`primary_blurry_color\` text,
  	\`secondary_blurry_color\` text,
  	\`sale_badge_background\` text,
  	\`sold_out_background\` text,
  	\`type_body_font\` text,
  	\`body_font_base\` numeric,
  	\`type_header_font\` text,
  	\`heading_font_size\` text,
  	\`highlighted_heading_style\` text,
  	\`type_prominent_heading_font\` text,
  	\`highlighted_color\` text,
  	\`highlighted_underline_style\` text,
  	\`highlighted_underline_thickness\` text,
  	\`highlighted_underline_color\` text,
  	\`button_font_style\` text,
  	\`button_font_size\` text,
  	\`menu_item_font_style\` text,
  	\`menu_item_font_size\` text,
  	\`tabs_heading_font_style\` text,
  	\`tabs_heading_font_size\` text,
  	\`card_heading_font_style\` text,
  	\`card_heading_font_size\` text,
  	\`page_max_width\` numeric,
  	\`corner_radius_container\` text,
  	\`corner_radius_drawer\` text,
  	\`corner_radius_button\` text,
  	\`common_component_radius\` text,
  	\`icon_thickness\` text,
  	\`product_card_style\` text,
  	\`product_card_position\` text,
  	\`product_card_color_scheme\` text,
  	\`product_card_image_ratio\` text,
  	\`product_card_image_background\` text,
  	\`product_card_sale_badge_style\` text,
  	\`quickshop_image_ratio\` text,
  	\`collection_card_color_scheme\` text,
  	\`collection_mask_overlay_opacity\` numeric,
  	\`collection_card_position\` text,
  	\`collection_image_ratio\` text,
  	\`blog_card_style\` text,
  	\`blog_card_color_scheme\` text,
  	\`blog_card_image_ratio\` text,
  	\`product_result_image_background\` text,
  	\`color_free_shipping\` text,
  	\`color_schemes\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`favicon_id\`) REFERENCES \`medios\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`ajustes_tema_favicon_idx\` ON \`ajustes_tema\` (\`favicon_id\`);`)
  await db.run(sql`CREATE TABLE \`datos_google\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`organizacion\` text,
  	\`sitio_web\` text,
  	\`articulos\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`fuentes\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`datos\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`productos_opciones_valores\`;`)
  await db.run(sql`DROP TABLE \`productos_opciones\`;`)
  await db.run(sql`DROP TABLE \`productos_variantes\`;`)
  await db.run(sql`DROP TABLE \`productos_imagenes\`;`)
  await db.run(sql`DROP TABLE \`productos_videos\`;`)
  await db.run(sql`DROP TABLE \`productos\`;`)
  await db.run(sql`DROP TABLE \`resenas_fotos\`;`)
  await db.run(sql`DROP TABLE \`resenas\`;`)
  await db.run(sql`DROP TABLE \`colecciones\`;`)
  await db.run(sql`DROP TABLE \`colecciones_rels\`;`)
  await db.run(sql`DROP TABLE \`plantillas\`;`)
  await db.run(sql`DROP TABLE \`paginas\`;`)
  await db.run(sql`DROP TABLE \`politicas\`;`)
  await db.run(sql`DROP TABLE \`articulos\`;`)
  await db.run(sql`DROP TABLE \`fichas_seo\`;`)
  await db.run(sql`DROP TABLE \`medios\`;`)
  await db.run(sql`DROP TABLE \`usuarios_sessions\`;`)
  await db.run(sql`DROP TABLE \`usuarios\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`menus_principal_enlaces\`;`)
  await db.run(sql`DROP TABLE \`menus_pie_enlaces\`;`)
  await db.run(sql`DROP TABLE \`menus_redes\`;`)
  await db.run(sql`DROP TABLE \`menus\`;`)
  await db.run(sql`DROP TABLE \`carrusel_resenas_fila1\`;`)
  await db.run(sql`DROP TABLE \`carrusel_resenas_fila2\`;`)
  await db.run(sql`DROP TABLE \`carrusel_resenas\`;`)
  await db.run(sql`DROP TABLE \`ajustes_tema\`;`)
  await db.run(sql`DROP TABLE \`datos_google\`;`)
  await db.run(sql`DROP TABLE \`fuentes\`;`)
}
