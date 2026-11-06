"use client";

// Pantalla de pago (/checkout), igual a la de Shopify: pago exprés, contacto, entrega, métodos de envío, pago (tarjeta,
// PayPal o Mercado Pago), «Pagar ahora» y el resumen del pedido (columna gris en computadora; plegado arriba y con el
// total abajo en celular y tableta). Medidas: docs/sitio-actual/medidas/pago-*.json.
//
// El navegador NUNCA manda ni cree precios: manda solo «variante y piezas» y los datos del cliente; el resumen (precio,
// descuento, envío, total) lo calcula el servidor con cotizar() y el pedido lo vuelve a calcular crearPedido()
// (src/lib/pago/acciones.ts, docs/seguridad.md §2).

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { cotizar, crearPedido } from "@/lib/pago/acciones";
import { ESTADOS, type DatosPago, type Direccion, type ErrorCampo, type MetodoPago, type Resumen } from "@/lib/pago/tipos";
import { useLineas, vaciar } from "@/components/carrito/estado";
import { Ayuda, Campo, Casilla, MensajeError, Selector } from "./Campos";
import { EncabezadoPago } from "./Encabezado";
import { guardar, leerGuardado, olvidar } from "./guardado";
import {
  IconoAyuda,
  IconoCandado,
  IconoEtiqueta,
  IconoFlecha,
  LogoAmex,
  LogoMastercard,
  LogoMercadoPago,
  LogoPaypal,
  LogoVisa,
} from "./Iconos";
import { AvisoOpcion, GrupoOpciones, type Opcion } from "./Opciones";
import { estadoPorIp } from "./region";
import { Costos, Lineas, dinero } from "./Resumen";

type Cotizacion = Resumen & { codigoInvalido: boolean };
type Errores = Partial<Record<ErrorCampo, string>>;

const DIRECCION_VACIA: Direccion = {
  pais: "MX",
  nombre: "",
  apellidos: "",
  direccion: "",
  interior: "",
  codigoPostal: "",
  ciudad: "",
  estado: "",
  telefono: "",
};

const OPCIONES_ESTADO = [{ valor: "", texto: "Estado" }, ...ESTADOS.map((e) => ({ valor: e.clave, texto: e.nombre }))];
const OPCIONES_PAIS = [{ valor: "MX", texto: "México" }];

/** La misma regla del servidor para saber si ya se puede calcular el envío (calcular.ts › direccionCompleta). */
function claveDireccion(d: Direccion): string {
  const cp = d.codigoPostal.trim();
  const ciudad = d.ciudad.trim();
  return /^\d{5}$/.test(cp) && d.estado && ciudad ? JSON.stringify([cp, ciudad, d.estado]) : "";
}

function direccionDeClave(clave: string): Partial<Direccion> | undefined {
  if (!clave) return undefined;
  const [codigoPostal, ciudad, estado] = JSON.parse(clave) as string[];
  return { codigoPostal, ciudad, estado };
}

/** Un valor que cambia hasta que deja de moverse un rato (para no cotizar con cada letra de la ciudad). */
function useCalmado<T>(valor: T, ms: number): T {
  const [calmado, setCalmado] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setCalmado(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return calmado;
}

const nada = () => () => {};
/** true ya en el navegador (el carrito y lo guardado viven en localStorage: no hay nada que pintar en el servidor). */
function useEnNavegador() {
  return useSyncExternalStore(
    nada,
    () => true,
    () => false,
  );
}

export function PantallaPago() {
  const enNavegador = useEnNavegador();
  return (
    <>
      <EncabezadoPago />
      {enNavegador && <Formulario />}
    </>
  );
}

// ——— Piezas de la pantalla ———

function Titulo({ id, children, chico = false }: { id?: string; children: ReactNode; chico?: boolean }) {
  return (
    <h2 id={id} className={chico ? "text-[16px] leading-[19.2px] font-semibold" : "text-[20px] leading-[24px] font-semibold"}>
      {children}
    </h2>
  );
}

/** Botón amarillo de PayPal (pago exprés y, con PayPal elegido, en lugar de «Pagar ahora»). */
function BotonPaypal({ className = "", alto = 48, alPulsar }: { className?: string; alto?: number; alPulsar?: () => void }) {
  return (
    <button
      type="button"
      aria-label="Pagar con PayPal"
      onClick={alPulsar}
      style={{ height: alto }}
      className={`flex cursor-pointer items-center justify-center rounded-[8px] bg-paypal outline-acento hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 ${className}`}
    >
      <LogoPaypal className="text-[21px]" />
    </button>
  );
}

/** Caja de un campo seguro de la tarjeta (todavía vacía, con su texto de ayuda). */
function CajaTarjeta({ campo, texto, icono, className = "" }: { campo: string; texto: string; icono?: ReactNode; className?: string }) {
  return (
    <div
      // Paso 3: campos seguros de Mercado Pago (llave pública): aquí se monta el campo «campo» y el número de tarjeta
      // nunca pasa por nuestra página ni por nuestro servidor.
      data-mp-campo={campo}
      role="group"
      aria-label={texto}
      className={`relative flex h-12 items-center rounded-[12px] border border-borde bg-white px-[10px] text-[14px] leading-[18.9px] text-tenue ${className}`}
    >
      <span className="truncate pr-7">{texto}</span>
      {icono && <span className="absolute top-1/2 right-[14px] flex -translate-y-1/2 text-tenue">{icono}</span>}
    </div>
  );
}

/** «Código de descuento» + «Aplicar», con el error y el código aplicado debajo. */
function CajaDescuento({
  texto,
  alCambiarTexto,
  aplicar,
  aplicando,
  error,
  aplicado,
  quitar,
}: {
  texto: string;
  alCambiarTexto: (v: string) => void;
  aplicar: () => void;
  aplicando: boolean;
  error?: string;
  aplicado: string;
  quitar: () => void;
}) {
  const vacio = texto.trim() === "";
  return (
    <section aria-label="Descuento">
      <h3 className="solo-lector">Descuento</h3>
      <div className="relative">
        <Campo
          etiqueta="Código de descuento"
          valor={texto}
          alCambiar={alCambiarTexto}
          error={error}
          autoComplete="off"
          name="codigoDescuento"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              aplicar();
            }
          }}
          className="[&_input]:pr-[86px]"
        />
        <button
          type="button"
          aria-label="Aplicar código de descuento"
          disabled={vacio || aplicando}
          onClick={aplicar}
          className="absolute top-[7px] right-[7px] h-[35px] cursor-pointer rounded-[8px] bg-gris px-[10px] text-[14px] leading-[18.9px] font-semibold text-black outline-acento focus-visible:outline-2 disabled:cursor-default disabled:text-tenue"
        >
          Aplicar
        </button>
      </div>
      {aplicado && (
        <div className="mt-[10px] flex">
          <span className="flex items-center gap-[6px] rounded-[8px] bg-black/[0.06] py-[5px] pr-[6px] pl-[10px] text-[14px] leading-[18.9px]">
            <IconoEtiqueta className="size-3.5" />
            {aplicado}
            <button
              type="button"
              onClick={quitar}
              aria-label={`Quitar el código ${aplicado}`}
              className="flex size-5 cursor-pointer items-center justify-center rounded-full text-tenue outline-acento hover:text-black focus-visible:outline-2"
            >
              <svg viewBox="0 0 14 14" className="size-2.5" aria-hidden="true" focusable="false">
                <path d="m3 3 8 8m0-8-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </span>
        </div>
      )}
    </section>
  );
}

/** Los campos de una dirección (entrega o facturación). */
function CamposDireccion({
  prefijo,
  datos,
  cambiar,
  errores,
  conAyudaTelefono,
}: {
  prefijo: "shipping" | "billing";
  datos: Direccion;
  cambiar: (campo: keyof Direccion, valor: string) => void;
  errores: Errores;
  conAyudaTelefono: boolean;
}) {
  const auto = (campo: string) => `${prefijo} ${campo}`;
  return (
    <div className="flex flex-col gap-[10px]">
      <Selector
        etiqueta="País / Región"
        valor="MX"
        alCambiar={() => {}}
        opciones={OPCIONES_PAIS}
        name={`${prefijo}-pais`}
        autoComplete={auto("country-name")}
        required
      />
      <div className="flex flex-col gap-[10px] t:flex-row">
        <Campo
          className="t:flex-1"
          etiqueta="Nombre"
          valor={datos.nombre}
          alCambiar={(v) => cambiar("nombre", v)}
          error={errores.nombre}
          name={`${prefijo}-nombre`}
          autoComplete={auto("given-name")}
          required
        />
        <Campo
          className="t:flex-1"
          etiqueta="Apellidos"
          valor={datos.apellidos}
          alCambiar={(v) => cambiar("apellidos", v)}
          error={errores.apellidos}
          name={`${prefijo}-apellidos`}
          autoComplete={auto("family-name")}
          required
        />
      </div>
      <Campo
        etiqueta="Dirección"
        valor={datos.direccion}
        alCambiar={(v) => cambiar("direccion", v)}
        error={errores.direccion}
        name={`${prefijo}-direccion`}
        autoComplete={auto("address-line1")}
        required
      />
      <Campo
        etiqueta="Casa, apartamento, etc. (opcional)"
        valor={datos.interior}
        alCambiar={(v) => cambiar("interior", v)}
        name={`${prefijo}-interior`}
        autoComplete={auto("address-line2")}
      />
      <div className="flex flex-col gap-[10px] t:flex-row">
        <Campo
          className="t:flex-1"
          etiqueta="Código postal"
          valor={datos.codigoPostal}
          alCambiar={(v) => cambiar("codigoPostal", v.replace(/\D/g, "").slice(0, 5))}
          error={errores.codigoPostal}
          name={`${prefijo}-cp`}
          inputMode="numeric"
          autoComplete={auto("postal-code")}
          required
        />
        <Campo
          className="t:flex-1"
          etiqueta="Ciudad"
          valor={datos.ciudad}
          alCambiar={(v) => cambiar("ciudad", v)}
          error={errores.ciudad}
          name={`${prefijo}-ciudad`}
          autoComplete={auto("address-level2")}
          required
        />
        <Selector
          className="t:flex-1"
          etiqueta="Estado"
          valor={datos.estado}
          alCambiar={(v) => cambiar("estado", v)}
          opciones={OPCIONES_ESTADO}
          error={errores.estado}
          name={`${prefijo}-estado`}
          autoComplete={auto("address-level1")}
          required
        />
      </div>
      <Campo
        etiqueta="Teléfono"
        valor={datos.telefono}
        alCambiar={(v) => cambiar("telefono", v)}
        error={errores.telefono}
        name={`${prefijo}-telefono`}
        type="tel"
        autoComplete={auto("tel")}
        required
        accesorio={
          conAyudaTelefono ? <Ayuda etiqueta="Más información sobre Teléfono" texto="En caso de que tengamos que contactarte sobre tu pedido." /> : undefined
        }
      />
    </div>
  );
}

// ——— El formulario ———

function Formulario() {
  const router = useRouter();
  const lineas = useLineas();
  // Lo guardado con «Guardar mi información» (solo en este navegador): se lee una vez, al abrir.
  const [guardado] = useState(leerGuardado);

  const [correo, setCorreo] = useState(guardado?.correo ?? "");
  const [novedades, setNovedades] = useState(guardado?.novedades ?? false);
  const [entrega, setEntrega] = useState<Direccion>(guardado?.entrega ?? DIRECCION_VACIA);
  const [guardarInfo, setGuardarInfo] = useState(Boolean(guardado));
  const [metodo, setMetodo] = useState<MetodoPago>("tarjeta");
  const [facturacionIgualTarjeta, setFacturacionIgualTarjeta] = useState(true);
  const [facturacionOpcion, setFacturacionOpcion] = useState<"misma" | "distinta">("misma");
  const [facturacion, setFacturacion] = useState<Direccion>(DIRECCION_VACIA);

  const [resumen, setResumen] = useState<Cotizacion | null>(null);
  const [codigoTexto, setCodigoTexto] = useState("");
  const [codigoAplicado, setCodigoAplicado] = useState("");
  const [errorCodigo, setErrorCodigo] = useState("");
  const [aplicando, setAplicando] = useState(false);

  const [errores, setErrores] = useState<Errores>({});
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [intento, setIntento] = useState(0);
  const [resumenAbierto, setResumenAbierto] = useState(false);
  const [descuentoAbajo, setDescuentoAbajo] = useState(false);
  const [politicasAbiertas, setPoliticasAbiertas] = useState(false);

  const terminado = useRef(false);
  const secuencia = useRef(0);

  const facturacionIgual = metodo === "tarjeta" ? facturacionIgualTarjeta : facturacionOpcion === "misma";

  // Carrito vacío: de regreso al carrito (como en vivo). Después de pagar el carrito se vacía a propósito.
  useEffect(() => {
    if (!lineas.length && !terminado.current) router.replace("/cart");
  }, [lineas.length, router]);

  // Estado propuesto por la ubicación aproximada, solo si no hay uno guardado.
  useEffect(() => {
    if (guardado?.entrega.estado) return;
    const control = new AbortController();
    estadoPorIp(control.signal).then((clave) => {
      if (clave) setEntrega((d) => (d.estado ? d : { ...d, estado: clave }));
    });
    return () => control.abort();
  }, [guardado]);

  // Resumen del servidor: al cambiar el carrito, el código aplicado o la dirección (ya completa).
  const claveLineas = JSON.stringify(lineas);
  const direccionLista = useCalmado(claveDireccion(entrega), 450);
  useEffect(() => {
    if (terminado.current) return;
    const actuales = JSON.parse(claveLineas) as { id: number; cantidad: number }[];
    if (!actuales.length) return;
    const n = ++secuencia.current;
    cotizar(actuales, codigoAplicado || undefined, direccionDeClave(direccionLista))
      .then((r) => {
        if (n === secuencia.current) setResumen(r);
      })
      .catch(() => {
        // Sin conexión: se queda el último resumen; «Pagar ahora» vuelve a calcular todo en el servidor.
      });
  }, [claveLineas, codigoAplicado, direccionLista]);

  // Tras un intento con errores: al primer campo con error (o arriba, al aviso general).
  useEffect(() => {
    if (!intento) return;
    const primero = [...document.querySelectorAll<HTMLElement>('[aria-invalid="true"], [data-error-pago]')].find(
      (e) => e.offsetParent !== null,
    );
    if (primero) {
      primero.scrollIntoView({ behavior: "smooth", block: "center" });
      if (primero.matches("input, select")) primero.focus({ preventScroll: true });
    }
  }, [intento]);

  const quitarError = (campo: ErrorCampo) => setErrores((e) => (e[campo] ? { ...e, [campo]: undefined } : e));

  function cambiarEntrega(campo: keyof Direccion, valor: string) {
    setEntrega((d) => ({ ...d, [campo]: valor }));
    if (campo !== "pais" && campo !== "interior") quitarError(campo);
  }

  function cambiarFacturacion(campo: keyof Direccion, valor: string) {
    setFacturacion((d) => ({ ...d, [campo]: valor }));
    quitarError("facturacion");
  }

  async function aplicarCodigo() {
    const codigo = codigoTexto.trim();
    if (!codigo || aplicando) return;
    setAplicando(true);
    const n = ++secuencia.current;
    try {
      const r = await cotizar(lineas, codigo, direccionDeClave(claveDireccion(entrega)));
      if (r.codigoInvalido) {
        setErrorCodigo("Ingresa un código de descuento válido");
      } else {
        if (n === secuencia.current) setResumen(r);
        setCodigoAplicado(r.descuento?.codigo ?? codigo);
        setCodigoTexto("");
        setErrorCodigo("");
        quitarError("codigoDescuento");
      }
    } catch {
      setErrorCodigo("No se pudo aplicar el código. Inténtalo de nuevo.");
    } finally {
      setAplicando(false);
    }
  }

  async function pagar(e?: FormEvent) {
    e?.preventDefault();
    if (enviando) return;
    setEnviando(true);
    setMensaje("");
    const datos: DatosPago = {
      correo,
      novedades,
      entrega,
      guardarInfo,
      metodo,
      facturacionIgual,
      facturacion: facturacionIgual ? undefined : facturacion,
      codigoDescuento: codigoAplicado || undefined,
      lineas,
      // Paso 3: con tarjeta, aquí va lo que entregan los campos seguros de Mercado Pago (token, método, emisor, meses).
    };
    try {
      const r = await crearPedido(datos);
      if (r.ok) {
        if (guardarInfo) guardar({ correo: correo.trim(), novedades, entrega });
        else olvidar();
        terminado.current = true;
        vaciar();
        if (r.siguiente.tipo === "redirigir") window.location.assign(r.siguiente.url);
        else router.push(r.siguiente.url);
        return;
      }
      setErrores(r.errores);
      if (r.errores.codigoDescuento) setErrorCodigo(r.errores.codigoDescuento);
      setMensaje(r.mensaje ?? "");
      setIntento((i) => i + 1);
    } catch {
      setMensaje("No pudimos procesar tu pedido. Revisa tu conexión e inténtalo de nuevo.");
      setIntento((i) => i + 1);
    }
    setEnviando(false);
  }

  const descuento = {
    texto: codigoTexto,
    alCambiarTexto: (v: string) => {
      setCodigoTexto(v);
      setErrorCodigo("");
    },
    aplicar: aplicarCodigo,
    aplicando,
    error: errorCodigo || undefined,
    aplicado: codigoAplicado,
    quitar: () => setCodigoAplicado(""),
  };

  const vistaLineas = resumen?.lineas ?? [];
  const costos = resumen && (
    <Costos subtotal={resumen.subtotal} descuento={resumen.descuento} envio={resumen.envio} total={resumen.total} />
  );

  const opcionesPago: Opcion<MetodoPago>[] = [
    {
      valor: "tarjeta",
      etiqueta: "Tarjeta de crédito",
      alto: 52,
      derecha: (
        <span className="flex gap-1">
          <LogoVisa />
          <LogoMastercard />
          <LogoAmex />
        </span>
      ),
      contenido: (
        <div className="p-[14px]">
          <div className="flex flex-col gap-[10px]">
            <CajaTarjeta campo="cardNumber" texto="Número de tarjeta" icono={<IconoCandado />} />
            <div className="flex flex-col gap-[10px] t:flex-row">
              <CajaTarjeta className="t:flex-1" campo="expirationDate" texto="Fecha de vencimiento (MM / AA)" />
              <CajaTarjeta className="t:flex-1" campo="securityCode" texto="Código de seguridad" icono={<IconoAyuda />} />
            </div>
            <CajaTarjeta campo="cardholderName" texto="Nombre del titular como aparece en la tarjeta" />
          </div>
          {/* Paso 3: campos seguros de Mercado Pago (llave pública): las opciones de meses las da Mercado Pago. */}
          <Selector
            className="mt-[14px]"
            etiqueta="Meses"
            valor="1"
            alCambiar={() => {}}
            opciones={[{ valor: "1", texto: "" }]}
            name="meses"
            datos={{ "data-mp-campo": "installments" }}
          />
          <MensajeError id="tarjeta-error" texto={errores.tarjeta} />
          <Casilla
            className="mt-[13px]"
            id="facturacion-igual"
            name="facturacionIgual"
            etiqueta="Usar la dirección de envío como dirección de facturación"
            marcada={facturacionIgualTarjeta}
            alCambiar={(v) => {
              setFacturacionIgualTarjeta(v);
              quitarError("facturacion");
            }}
          />
          {!facturacionIgualTarjeta && (
            <div className="mt-[14px]">
              <h3 className="mb-[14px] text-[16px] leading-[19.2px] font-semibold">Dirección de facturación</h3>
              <CamposDireccion prefijo="billing" datos={facturacion} cambiar={cambiarFacturacion} errores={{}} conAyudaTelefono={false} />
              <MensajeError id="facturacion-error" texto={errores.facturacion} />
            </div>
          )}
        </div>
      ),
    },
    {
      valor: "paypal",
      etiqueta: "PayPal",
      // En vivo mide 46–47 px junto a la tarjeta abierta y 47 px en los demás casos (redondeo de su diseño).
      alto: metodo === "tarjeta" ? 46.5 : 47,
      derecha: <LogoPaypal />,
      contenido: <AvisoOpcion>Se te redirigirá a PayPal para que completes la compra</AvisoOpcion>,
    },
    {
      valor: "mercadopago",
      etiqueta: "Mercado Pago",
      alto: 50,
      derecha: (
        <span className="flex gap-1" aria-label="Mercado Pago, American Express, Oxxo, Maestro, Visa Electron y 7-Eleven">
          <LogoMercadoPago />
          <LogoVisa />
          <LogoMastercard />
          <span className="flex h-6 w-[23px] items-center justify-center rounded-[3px] border border-black/[0.07] bg-white text-[10px] leading-[13.5px] text-acento">
            +5
          </span>
        </span>
      ),
      contenido: <AvisoOpcion>Se te redirigirá a Mercado Pago para completar tu compra</AvisoOpcion>,
    },
  ];

  const piezas = resumen?.piezas ?? lineas.reduce((s, l) => s + l.cantidad, 0);
  const primeraFoto = vistaLineas[0]?.imagen ?? null;

  return (
    <>
      {/* Celular y tableta: el resumen plegado arriba (barra gris con el total). */}
      <aside className="bg-gris c:hidden" aria-label="Resumen del pedido">
        <button
          type="button"
          aria-expanded={resumenAbierto}
          aria-controls="resumen-arriba"
          onClick={() => setResumenAbierto((a) => !a)}
          className="block w-full cursor-pointer outline-acento focus-visible:outline-2 focus-visible:-outline-offset-2"
        >
          <span className="mx-auto flex h-[63px] max-w-[580px] items-center justify-between gap-4 px-[14px]">
            <span className="flex items-center gap-2 text-acento">
              Resumen del pedido
              <IconoFlecha arriba={resumenAbierto} />
            </span>
            <span>
              <span className="solo-lector">Precio total</span>
              <strong className="text-[18px] leading-[24.3px] font-semibold">{resumen ? dinero(resumen.total) : ""}</strong>
            </span>
          </span>
        </button>
        <div id="resumen-arriba" hidden={!resumenAbierto}>
          <div className="mx-auto flex max-w-[580px] flex-col gap-5 px-[14px] pt-[16px] pb-[2.5px]">
            <h2 className="solo-lector">Resumen del pedido</h2>
            <Lineas lineas={vistaLineas} />
            <CajaDescuento {...descuento} />
            <div className="pt-[14px]">{costos}</div>
          </div>
        </div>
      </aside>

      <div className="c:grid c:min-h-[calc(100vh-121px)] c:grid-cols-[calc(50%+50px)_calc(50%-50px)]">
        <div className="c:flex c:justify-end c:pr-10 c:pl-[14px]">
          <main id="checkout-main" className="mx-auto w-full max-w-[580px] px-[14px] pt-5 pb-10 t:pb-[19px] c:mx-0 c:max-w-[500px] c:px-0 c:pt-10 c:pb-10">
            <h1 className="solo-lector">Diluvium Pantalla de pago</h1>

            {(mensaje || (resumen?.avisos.length ?? 0) > 0) && (
              <div className="mb-5 flex flex-col gap-[10px]" role="status">
                {mensaje && (
                  <p data-error-pago className="rounded-[12px] border border-error bg-[#fff4f4] px-[14px] py-[12px] text-error">
                    {mensaje}
                  </p>
                )}
                {resumen?.avisos.map((a) => (
                  <p key={a} className="rounded-[12px] border border-[#e8c96b] bg-[#fff8e5] px-[14px] py-[12px]">
                    {a}
                  </p>
                ))}
              </div>
            )}

            <form noValidate onSubmit={pagar} aria-label="Pago">
              <section aria-labelledby="pago-expres">
                <h2 id="pago-expres" className="text-center text-tenue">
                  Pago exprés
                </h2>
                {/* Paso 3: PayPal (pago exprés). */}
                <BotonPaypal className="mx-[5px] mt-[14px] w-[calc(100%-10px)] c:mx-auto c:w-[262px]" />
              </section>
              <div className="mt-[14px] flex items-center gap-[13px] text-tenue t:mt-5" aria-hidden="true">
                <span className="h-px flex-1 bg-borde" />
                <span className="leading-[19px]">O</span>
                <span className="h-px flex-1 bg-borde" />
              </div>

              <section aria-labelledby="contacto" className="mt-[14px] t:mt-5">
                <div className="flex items-baseline justify-between gap-4">
                  <Titulo id="contacto">Contacto</Titulo>
                  <button
                    type="button"
                    onClick={() => {
                      // Paso 3: cuentas de cliente («Iniciar sesión»).
                    }}
                    className="cursor-pointer text-acento underline outline-acento focus-visible:outline-2"
                  >
                    Iniciar sesión
                  </button>
                </div>
                <Campo
                  className="mt-[14px]"
                  id="email"
                  etiqueta="Correo electrónico"
                  valor={correo}
                  alCambiar={(v) => {
                    setCorreo(v);
                    quitarError("correo");
                  }}
                  error={errores.correo}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="shipping email"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                  accesorio={
                    <Ayuda
                      etiqueta="Más información sobre cómo se usa tu información de contacto"
                      texto="Se usa para la confirmación del pedido y los recordatorios del carrito"
                    />
                  }
                />
                <Casilla
                  className="mt-[9px]"
                  id="marketing_opt_in"
                  name="marketing_opt_in"
                  etiqueta="Enviarme novedades y ofertas por correo electrónico"
                  marcada={novedades}
                  alCambiar={setNovedades}
                />
              </section>

              <section aria-labelledby="entrega" className="mt-8">
                <Titulo id="entrega">Entrega</Titulo>
                <div className="mt-[14px]">
                  <CamposDireccion prefijo="shipping" datos={entrega} cambiar={cambiarEntrega} errores={errores} conAyudaTelefono />
                </div>
                <Casilla
                  className="mt-[9px]"
                  id="save_shipping_information"
                  name="save_shipping_information"
                  etiqueta="Guardar mi información y consultar más rápidamente la próxima vez"
                  marcada={guardarInfo}
                  alCambiar={setGuardarInfo}
                />
              </section>

              <section aria-labelledby="metodos-envio" className="mt-6">
                <Titulo id="metodos-envio" chico>
                  Métodos de envío
                </Titulo>
                {resumen?.envio ? (
                  <GrupoOpciones
                    className="mt-[14px]"
                    nombre="envio"
                    titulo="metodos-envio"
                    elegido="envio"
                    alElegir={() => {}}
                    opciones={[
                      {
                        valor: "envio",
                        etiqueta: resumen.envio.nombre,
                        alto: 47,
                        derecha: (
                          <span className="text-[14px] leading-[18.9px] font-semibold">
                            {resumen.envio.costo === 0 ? "Gratis" : dinero(resumen.envio.costo)}
                          </span>
                        ),
                      },
                    ]}
                  />
                ) : (
                  <p className="mt-[14px] rounded-[12px] bg-gris px-4 py-4 text-tenue t:text-center">
                    Ingresa tu dirección de envío para ver los métodos disponibles.
                  </p>
                )}
              </section>

              <section aria-labelledby="pago" className="mt-8">
                <Titulo id="pago">Pago</Titulo>
                <p className="mt-1 text-tenue">Todas las transacciones son seguras y están encriptadas.</p>
                <GrupoOpciones
                  className="mt-[14px]"
                  nombre="metodo"
                  titulo="pago"
                  opciones={opcionesPago}
                  elegido={metodo}
                  alElegir={(m) => {
                    setMetodo(m);
                    quitarError("facturacion");
                  }}
                />
              </section>

              {metodo !== "tarjeta" && (
                <section aria-labelledby="facturacion" className="mt-8 t:mt-[31px]">
                  <Titulo id="facturacion" chico>
                    Dirección de facturación
                  </Titulo>
                  <GrupoOpciones
                    className="mt-[14px]"
                    nombre="facturacion"
                    titulo="facturacion"
                    elegido={facturacionOpcion}
                    alElegir={(v) => {
                      setFacturacionOpcion(v);
                      quitarError("facturacion");
                    }}
                    opciones={[
                      { valor: "misma", etiqueta: "La misma dirección de envío", alto: 46 },
                      {
                        valor: "distinta",
                        etiqueta: "Usar una dirección de facturación distinta",
                        alto: 47,
                        contenido: (
                          <div className="p-[14px]">
                            <CamposDireccion prefijo="billing" datos={facturacion} cambiar={cambiarFacturacion} errores={{}} conAyudaTelefono={false} />
                          </div>
                        ),
                      },
                    ]}
                  />
                  <MensajeError id="facturacion-error" texto={errores.facturacion} />
                </section>
              )}

              {/* Celular y tableta: descuento y total abajo, antes de pagar. */}
              <section aria-labelledby="resumen-abajo" className={`c:hidden ${metodo === "tarjeta" ? "mt-12" : "mt-8"}`}>
                <h2 id="resumen-abajo" className="solo-lector">
                  Resumen del pedido
                </h2>
                {descuentoAbajo || codigoAplicado || errorCodigo ? (
                  <CajaDescuento {...descuento} />
                ) : (
                  <button
                    type="button"
                    onClick={() => setDescuentoAbajo(true)}
                    className="flex h-[38px] cursor-pointer items-center gap-1 rounded-[12px] bg-white px-[9.33px] font-semibold shadow-[0_0_0_1px_var(--color-borde)] outline-acento focus-visible:outline-2"
                  >
                    <IconoEtiqueta />
                    Agregar descuento
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setResumenAbierto(true);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="mt-[10px] flex h-[46px] w-full cursor-pointer items-center justify-between gap-3 pt-1 text-left outline-acento focus-visible:outline-2"
                >
                  <span className="solo-lector">Resumen del pedido</span>
                  <span className="flex items-center gap-4">
                    <span className="flex size-[42px] shrink-0 overflow-hidden rounded-[13px] border border-black/10 bg-white">
                      {primeraFoto && (
                        // eslint-disable-next-line @next/next/no-img-element -- miniatura de 40 px; next/image no aporta aquí
                        <img src={primeraFoto} alt="" width={40} height={40} className="size-10 rounded-[12px] border border-white object-cover" />
                      )}
                    </span>
                    <span className="flex flex-col">
                      <span className="text-[18px] leading-[20px] font-semibold">Total</span>
                      <span className="text-[14px] leading-[17px] text-tenue">
                        {piezas} {piezas === 1 ? "artículo" : "artículos"}
                      </span>
                    </span>
                  </span>
                  <span className="flex items-center gap-[8px]">
                    <span className="rounded-full bg-black/[0.06] px-[3px] py-[2px] text-[10px] leading-[12px] font-semibold text-tenue">MXN</span>
                    <strong className="text-[18px] leading-[18px] font-semibold">{resumen ? dinero(resumen.total) : ""}</strong>
                    <IconoFlecha />
                  </span>
                </button>
              </section>

              <div className={`${metodo === "tarjeta" ? "mt-[14px] c:mt-[54px]" : "mt-[14px] c:mt-[38px]"}`}>
                <h2 className="solo-lector">Finalizar pedido</h2>
                {metodo === "paypal" ? (
                  // Paso 3: PayPal (se crea el pedido y se va a PayPal a pagar).
                  <BotonPaypal className="w-full" alto={50} alPulsar={() => pagar()} />
                ) : (
                  <button
                    type="submit"
                    id="checkout-pay-button"
                    aria-busy={enviando}
                    disabled={enviando}
                    className="flex h-[50px] w-full cursor-pointer items-center justify-center rounded-[12px] bg-acento px-[14px] text-[16px] leading-[21.6px] font-semibold text-white outline-acento hover:bg-[rgb(0,78,179)] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-80"
                  >
                    {enviando ? "En proceso…" : "Pagar ahora"}
                  </button>
                )}
              </div>
            </form>

            <div className="relative mt-[33px] t:mt-[62px]">
              <button
                type="button"
                aria-expanded={politicasAbiertas}
                aria-controls="politicas"
                onClick={() => setPoliticasAbiertas((a) => !a)}
                className="cursor-pointer text-acento underline outline-acento focus-visible:outline-2"
              >
                Términos y políticas
              </button>
              <ul
                id="politicas"
                hidden={!politicasAbiertas}
                className="absolute bottom-[calc(100%+8px)] left-0 z-10 m-0 list-none rounded-[12px] border border-borde bg-white p-[6px] shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
              >
                {[
                  ["/policies/refund-policy", "Política de reembolso"],
                  ["/policies/privacy-policy", "Política de privacidad"],
                  ["/policies/terms-of-service", "Términos del servicio"],
                ].map(([href, texto]) => (
                  <li key={href}>
                    <a href={href} className="block rounded-[8px] px-[10px] py-[8px] whitespace-nowrap text-acento underline outline-acento hover:bg-gris focus-visible:outline-2">
                      {texto}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </main>
        </div>

        {/* Computadora: el resumen en la columna gris. */}
        <div className="hidden bg-gris c:block c:pl-10">
          <aside aria-labelledby="resumen-lateral" className="sticky top-0 max-w-[400px] pt-10 pb-10">
            <h2 id="resumen-lateral" className="solo-lector">
              Resumen del pedido
            </h2>
            <Lineas lineas={vistaLineas} />
            <div className="mt-5">
              <CajaDescuento {...descuento} />
            </div>
            <div className="mt-[34px]">{costos}</div>
          </aside>
        </div>
      </div>
    </>
  );
}
