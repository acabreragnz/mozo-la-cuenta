# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Restaurant discount calculator for Uruguay - calculates VAT refunds (Ley 17.934) and credit card discounts for restaurant bills. Single-page React application with TypeScript.

## Development Commands

```bash
# Install dependencies (uses pnpm)
pnpm install

# Start development server (Vite with Rolldown)
pnpm dev

# Build for production (TypeScript check + Vite build)
pnpm build

# Lint code (ESLint)
pnpm lint

# Preview production build
pnpm preview
```

## Technology Stack

- **React 19** with React Compiler (babel-plugin-react-compiler)
- **TypeScript 5.9** with strict mode enabled
- **Vite** (using Rolldown-Vite 7.2.5)
- **Tailwind CSS 4.1** via @tailwindcss/vite plugin
- **expr-eval** for safe math expression evaluation

## Architecture and Business Logic

### Single Component Architecture

The entire application logic is in `src/RestaurantIVACalculator.tsx` - a single, self-contained React component with all state management and calculations.

### Critical Payment Flow Understanding

The app models the real-world temporal sequence of payment documents:

1. **Factura e-Ticket** (GENERATED FIRST)
   - Contains consumption amount only
   - If discount type is "En factura", discount is applied here
   - **NEVER includes tip** (tip is added later at POS)
   - Calculation: `Consumo - Descuento(if applicable)`

2. **Voucher POS** (GENERATED AFTER)
   - Generated when paying with card
   - Includes: Invoice amount + Tip + VAT adjustments
   - Calculation: `InvoiceAmount + Tip - VATRefund`

### Discount Types

**"En factura" (In Invoice):**
- Discount appears in the e-Ticket invoice
- Tip is calculated on the ALREADY DISCOUNTED amount
- Used when merchant applies discount directly

**"Reembolso" (Refund):**
- Discount is refunded later (not shown in invoice)
- User can choose whether to include tip in discount calculation
- Used when bank refunds money afterwards

### Key Calculations

**VAT Refund (Ley 17.934):**
- Default: 9% on taxable base (gravado)
- Calculated on invoice amount (without tip)
- Formula: `(invoiceAmount / 1.22) * (vatPercentage / 100)`
- STANDARD_VAT_RATE = 1.22 (22% Uruguay VAT)

**Tip Calculation:**
- Always calculated on POS amount (post-discount if "En factura")
- Can be percentage or fixed amount
- NOT included in the invoice document

**Card Discount:**
- "En factura": Applied to consumption amount only
- "Reembolso": Can optionally include tip in calculation

### Important Constants

```typescript
STANDARD_VAT_RATE = 1.22  // 22% VAT in Uruguay
VAT_PERCENTAGE = 0.22
MAX_EXPRESSION_LENGTH = 200  // DoS prevention
```

## Code Patterns

### Expression Evaluation
- Uses expr-eval library for safe math parsing (e.g., "500+300")
- DoS protection: expressions limited to 200 characters
- All evaluations go through `evaluateExpression()` helper

### Input Validation
- `validateNumericInput()` helper constrains ranges
- Card discount: 0-100%
- VAT percentage: 0-22%
- Tip percentage: 0-100%

### Performance
- React Compiler enabled via Babel plugin (automatic memoization)
- Manual useMemo for expensive calculations (numericAmount, numericTip)
- Parser instance created once at module level

## Styling

- Tailwind CSS 4.1 with custom cyan/sky color theme ("Cian Océano")
- Responsive design with mobile-first approach
- Dark theme with gradient backgrounds
- No separate CSS files - all styling is inline Tailwind classes

## Important Notes

- No test files currently in the project
- No separate routing - single page application
- All business logic is in one component (no separate utilities or hooks)
- TypeScript strict mode enforced with additional linting flags
