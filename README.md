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
Muchas tarjetas de crédito ofrecen descuentos adicionales en gastronomía. Esta calculadora te ayuda a ver el precio final combinando ambos beneficios.

## 🏗️ Arquitectura y Flujo de Negocio

### Flujo de Pago en Restaurantes

Es importante entender el flujo temporal de generación de comprobantes:

1. **Factura e-Ticket** (PRIMERO)
   - Se genera con el consumo total
   - Si el descuento es "En factura", se aplica aquí
   - **NO incluye propina** (la propina se agrega después en el POS)
   - Cálculo: `Consumo - Descuento(si aplica)`

2. **Voucher POS** (DESPUÉS)
   - Se genera al momento del pago con tarjeta
   - Incluye: Monto de factura + Propina + Ajustes IVA
   - Cálculo: `MontoFactura + Propina - DevoluciónIVA`

### Por qué la Propina NO está en la Factura

La propina se decide y agrega en el momento del pago (voucher POS), no en la factura. Por lo tanto:

- ✅ **Correcto:** El descuento "En factura" SOLO aplica sobre el consumo
- ❌ **Incorrecto:** Intentar aplicar descuento sobre (consumo + propina) en la factura

Esto está correctamente implementado en el código:
```typescript
// Descuento en factura SIEMPRE es sobre numericAmount (sin propina)
discountType === "factura"
  ? numericAmount * (discountPercentage / 100)
  : ...
```

### Tipos de Descuento

**En factura:**
- Descuento se refleja en la factura e-Ticket
- Propina se calcula sobre el monto YA descontado
- Útil cuando el comercio aplica el descuento directamente

**Reembolso:**
- Descuento se devuelve después (no aparece en factura)
- Usuario puede elegir si incluir propina en el descuento
- Útil cuando el banco devuelve el dinero posteriormente
