# restaurant-discount-calculator

Calculadora web para calcular descuentos de IVA y tarjetas de crédito en restaurantes de Uruguay.

## 🚀 Características

- ✨ Cálculo automático de devolución de IVA (9% sobre base gravada - Ley 17.934)
- 💳 Soporte para descuentos de tarjetas de crédito (reembolso o en factura)
- 🧮 Calculadora de propina (porcentaje o monto fijo)
- 📊 Desglose detallado de factura e-Ticket y voucher POS
- 🔄 Soporte para ambos tipos de descuento (IVA + tarjeta)
- 📱 Diseño responsive y moderno
- ⚡ Soporte para expresiones matemáticas (ej: 500+300)

## 🛠️ Tecnologías

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Compiler

## 📦 Instalación

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev

# Compilar para producción
pnpm build

# Previsualizar build de producción
pnpm preview
```

## 🌐 Despliegue

Esta aplicación puede ser desplegada en cualquier servicio de hosting estático:

### Vercel
```bash
pnpm build
# Subir la carpeta dist/
```

### Netlify
```bash
pnpm build
# Subir la carpeta dist/
```

### GitHub Pages
```bash
pnpm build
# Configurar GitHub Pages para servir desde la carpeta dist/
```

## 📄 Licencia

MIT

## 🇺🇾 Sobre los Descuentos

### Ley 17.934 - Devolución de IVA
La Ley 17.934 de Uruguay permite la devolución del 9% del IVA en compras realizadas con tarjetas de débito en restaurantes y establecimientos gastronómicos.

### Descuentos de Tarjetas
Muchas tarjetas de crédito ofrecen descuentos adicionales en gastronomía (ej: Scotiabank 25%, Itaú 20%, etc.). Esta calculadora te ayuda a ver el precio final combinando ambos beneficios.
