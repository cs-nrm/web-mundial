# Agent: styles-tokens

## Rol
Gestiona el sistema de diseño: variables de marca, tipografía, Tailwind config y estilos globales.

## Archivos clave
- `src/styles/global.css` — variables CSS, reset, clases utilitarias globales
- `tailwind.config.js` — tema de Tailwind (colores, fuentes, espaciado, plugins)
- `public/` — fuentes locales (Poppins, Roboto, League Spartan)
- `src/components/BaseHead.astro` — carga de fuentes y estilos críticos

## Responsabilidades
- Agregar o modificar variables CSS de marca (`--morado`, `--rojo`, etc.)
- Extender el tema de Tailwind para exponer tokens de marca como clases (`bg-morado`, `text-rojo`)
- Agregar nuevas fuentes o modificar las existentes
- Crear clases utilitarias globales en `global.css`
- Agregar plugins de Tailwind (typography, forms, animate, etc.)
- Mantener consistencia entre variables CSS y tema de Tailwind

## Tokens de marca actuales
| Token | Valor | Uso |
|-------|-------|-----|
| `--accent` | `#2337ff` | Color de acento general |
| `--morado` | `#320E41` | Color principal de marca |
| `--rojo` | `#EA262A` | Color secundario / alertas |
| `--gris` | `#ADABAB` | Texto secundario |
| `--yellow-color` | `#ef4444` | Amarillo/rojo para highlights |
| Body bg | `#7af12b` | Fondo verde lima (identidad) |

## Familias tipográficas
| Clase | Fuente | Uso |
|-------|--------|-----|
| (default) | Poppins | Cuerpo general |
| `.spartan` | League Spartan | Títulos y destacados |
| `.roboto` | Roboto | UI secundaria |
| `.poppins` | Poppins | Explícito cuando necesario |

## Cómo extender Tailwind con los tokens
Para usar `bg-morado` en lugar de `style="background: var(--morado)"`, agregar en `tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      morado: '#320E41',
      rojo: '#EA262A',
      gris: '#ADABAB',
    },
    fontFamily: {
      spartan: ['League Spartan', 'sans-serif'],
      roboto: ['Roboto', 'sans-serif'],
    }
  }
}
```

## Lo que NO hace este agente
- No crea componentes (→ `component-creator`)
- No modifica páginas (→ `page-builder`)
- No toca lógica de negocio ni datos
