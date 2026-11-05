// Logo e ícono de Diluvium para el administrador (pantalla de entrada y barra superior). Usan los mismos archivos de la
// página, que ya están en public/media.

/* eslint-disable @next/next/no-img-element -- el administrador de Payload pinta estos componentes fuera de next/image */

export function Logo() {
  return (
    <img
      src="/media/files/Logo_Diluvium_horizontal_sin_fondo.png"
      alt="Diluvium"
      width={260}
      height={68}
      style={{ width: 260, height: "auto", display: "block" }}
    />
  );
}

export function Icono() {
  return (
    <img
      src="/media/files/Favicon_2aabf220-4641-4694-9dbb-be135ad53af1.png"
      alt="Diluvium"
      width={28}
      height={28}
      style={{ width: 28, height: 28, display: "block", borderRadius: 6 }}
    />
  );
}
