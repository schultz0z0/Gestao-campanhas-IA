import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import logoAzul from "@assets/Logo Azul resumida_1762532782695.png";
import logoBranca from "@assets/Logo Branca Resumida_1762532782693.png";

interface ENSLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function ENSLogo({ className = "", width, height }: ENSLogoProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={className}
        style={{ width: width || 120, height: height || 40 }}
      />
    );
  }

  const currentTheme = theme === "system" ? systemTheme : theme;
  const logoSrc = currentTheme === "dark" ? logoBranca : logoAzul;

  return (
    <img
      src={logoSrc}
      alt="ENS - Escola de Negócios e Seguros"
      className={`transition-opacity duration-300 ${className}`}
      style={{ width: width || 120, height: height || 40, objectFit: "contain" }}
    />
  );
}
