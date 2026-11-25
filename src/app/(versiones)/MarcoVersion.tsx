import type { ComponentProps } from "react";
import { MarcoVersionB } from "./MarcoVersionB";
import { MarcoVersionC } from "./MarcoVersionC";

/** El marco de cada versión: B con sus olas; C y D (y las que sigan) con las partes una tras otra. */
export function MarcoVersion(props: ComponentProps<typeof MarcoVersionB>) {
  return props.v.clave.startsWith("b") ? <MarcoVersionB {...props} /> : <MarcoVersionC {...props} />;
}
