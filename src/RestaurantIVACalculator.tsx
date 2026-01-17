import { useState, useMemo, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { Parser } from "expr-eval";
import clsx from "clsx";

// Constants
const STANDARD_VAT_RATE = 1.22;
const VAT_PERCENTAGE = 0.22;
const MAX_EXPRESSION_LENGTH = 200;

// Create parser instance once at module level for performance
const expressionParser = new Parser();

// Reusable collapsible section component
function Collapsible({
  isOpen,
  setIsOpen,
  icon,
  title,
  children,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  icon: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border overflow-hidden border-cyan-500/30 bg-cyan-950/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-cyan-500/10 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-white">
          {icon} {title}
        </span>
        <span
          className={clsx(
            "text-slate-400 transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="px-3 pb-3 space-y-2 text-sm border-t border-white/10 pt-3">
          {children}
        </div>
      )}
    </div>
  );
}

// Reusable info tooltip component
function InfoTooltip({
  show,
  onToggle,
  children,
}: {
  show: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="w-4 h-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/30 text-slate-200 text-xs flex items-center justify-center transition-all"
        aria-label="Más información"
      >
        ?
      </button>
      {show && (
        <>
          <div className="fixed inset-0 z-10" onClick={onToggle} />
          <div className="absolute left-0 top-6 z-20 w-72 p-3 rounded-lg bg-slate-900/95 backdrop-blur-md border border-slate-600/50 shadow-xl">
            {children}
          </div>
        </>
      )}
    </div>
  );
}

export default function RestaurantIVACalculator() {
  const [amountExpression, setAmountExpression] = useState("");
  const [tipPercentage, setTipPercentage] = useState("10");
  const [fixedTip, setFixedTip] = useState("");
  const [tipType, setTipType] = useState("porcentaje");
  const [wantsTip, setWantsTip] = useState(true);
  const [cardDiscount, setCardDiscount] = useState("");
  const [vatPercentage, setVatPercentage] = useState("9");
  const [includeTipInDiscount, setIncludeTipInDiscount] = useState(false);
  const [discountType, setDiscountType] = useState("reembolso"); // 'reembolso' o 'factura'
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [posOpen, setPosOpen] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [numberOfPeople, setNumberOfPeople] = useState("2");
  const [showTipInDiscountTooltip, setShowTipInDiscountTooltip] =
    useState(false);
  const [showDiscountTypeTooltip, setShowDiscountTypeTooltip] =
    useState(false);

  // Refs for input fields
  const amountInputRef = useRef<HTMLInputElement>(null);
  const tipInputRef = useRef<HTMLInputElement>(null);

  // Autofocus on mount
  useEffect(() => {
    amountInputRef.current?.focus();
  }, []);

  // Safe math expression evaluator using expr-eval with DoS prevention
  const evaluateExpression = (expr: string): number => {
    if (!expr || expr.trim() === "") return 0;

    // DoS Prevention: Limit expression length
    if (expr.length > MAX_EXPRESSION_LENGTH) return 0;

    try {
      const result = expressionParser.evaluate(expr);
      return isNaN(result) || !isFinite(result) ? 0 : result;
    } catch {
      return 0;
    }
  };

  const numericAmount = useMemo(
    () => evaluateExpression(amountExpression),
    [amountExpression]
  );

  const discountPercentage = parseFloat(cardDiscount) || 0;
  const vatRefund = parseFloat(vatPercentage) || 0;

  // Input validation helper
  const validateNumericInput = (value: string, min: number, max: number): string => {
    const num = parseFloat(value);
    if (isNaN(num)) return "";
    if (num < min) return min.toString();
    if (num > max) return max.toString();
    return value;
  };

  // Handlers with validation
  const handleCardDiscountChange = (value: string) => {
    setCardDiscount(validateNumericInput(value, 0, 100));
  };

  const handleVatPercentageChange = (value: string) => {
    setVatPercentage(validateNumericInput(value, 0, 22));
  };

  const handleTipPercentageChange = (value: string) => {
    setTipPercentage(validateNumericInput(value, 0, 100));
  };

  const handleFixedTipChange = (value: string) => {
    // Allow empty string or validate numeric input (no upper limit for fixed tip)
    if (value === "") {
      setFixedTip("");
      return;
    }
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) return;
    setFixedTip(value);
  };

  const handleNumberOfPeopleChange = (value: string) => {
    if (value === "") {
      setNumberOfPeople("");
      return;
    }
    const num = parseInt(value);
    if (isNaN(num) || num < 2) {
      setNumberOfPeople("2");
      return;
    }
    if (num > 99) {
      setNumberOfPeople("99");
      return;
    }
    setNumberOfPeople(value);
  };

  // Handler para cambiar tipo de propina con conversión automática
  const handleTipTypeChange = (newType: "porcentaje" | "fija") => {
    if (newType === tipType) return; // No hacer nada si es el mismo tipo

    const baseAmount = discountType === "factura"
      ? numericAmount * (1 - discountPercentage / 100)
      : numericAmount;

    if (baseAmount === 0) {
      // Si no hay monto base, solo cambiar el tipo sin conversión
      setTipType(newType);
      return;
    }

    if (newType === "fija") {
      // Cambiar de % a $: calcular el valor en pesos
      const currentPercentage = parseFloat(tipPercentage) || 0;
      const valueInPesos = baseAmount * (currentPercentage / 100);
      setFixedTip(valueInPesos > 0 ? valueInPesos.toFixed(2) : "");
    } else {
      // Cambiar de $ a %: calcular el porcentaje
      const currentFixed = parseFloat(fixedTip) || 0;
      const percentage = (currentFixed / baseAmount) * 100;
      setTipPercentage(percentage > 0 ? Math.min(100, Math.round(percentage)).toString() : "");
    }

    setTipType(newType);
  };

  // Calculations based on discount type
  const discountedInvoiceAmount =
    discountType === "factura"
      ? numericAmount * (1 - discountPercentage / 100)
      : numericAmount;

  // POS amount
  const posAmount = discountedInvoiceAmount;

  // Calculate tip on POS amount (not on e-ticket)
  const numericTip = useMemo(() => {
    if (!wantsTip) return 0;

    // Tip is always calculated on POS amount
    const tipBase = posAmount;

    if (tipType === "porcentaje") {
      const pct = parseFloat(tipPercentage) || 0;
      return tipBase * (pct / 100);
    }
    return parseFloat(fixedTip) || 0;
  }, [
    wantsTip,
    tipType,
    tipPercentage,
    fixedTip,
    posAmount,
  ]);

  const subtotal = numericAmount + numericTip;

  // For refund, discount is calculated on subtotal or amount only
  const cardDiscountBase = includeTipInDiscount ? subtotal : numericAmount;
  const cardDiscountAmount =
    discountType === "reembolso"
      ? cardDiscountBase * (discountPercentage / 100)
      : numericAmount * (discountPercentage / 100);

  // Taxable base: always on actually invoiced amount (without tip)
  // If discount is on invoice, use POS amount (may be rounded)
  const amountForVAT = discountType === "factura" ? posAmount : numericAmount;
  const taxableAmount = amountForVAT / STANDARD_VAT_RATE;
  const vatDiscount = taxableAmount * (vatRefund / 100);

  // Final total
  const finalPrice =
    discountType === "factura"
      ? posAmount + numericTip - vatDiscount
      : posAmount + numericTip - cardDiscountAmount - vatDiscount;
  const totalSavings = subtotal - finalPrice;
  const savingsPercentage = subtotal > 0 ? (totalSavings / subtotal) * 100 : 0;

  // Per-person calculations
  const numPeople = parseInt(numberOfPeople) || 2;
  const perPersonAmount = numericAmount / numPeople;
  const perPersonTip = numericTip / numPeople;
  const perPersonCardDiscount = cardDiscountAmount / numPeople;
  const perPersonVatDiscount = vatDiscount / numPeople;
  const perPersonFinalPrice = finalPrice / numPeople;
  const perPersonSavings = totalSavings / numPeople;

  const formatMoney = (value: number) => {
    return value.toLocaleString("es-UY", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const hasResults = numericAmount > 0;
  const expressionHasOperator = /[+\-*/]/.test(amountExpression);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-cyan-900 via-sky-900 to-slate-900">
      <div className="backdrop-blur-lg rounded-3xl shadow-2xl p-6 w-full max-w-md border bg-cyan-950/40 border-cyan-500/20 animate-fade-in-up animate-duration-300">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-3 bg-cyan-950/40 p-1 animate-bounce-in animate-delay-100">
            <img src="/favicon.jpg" alt="Mozo, la cuenta!" className="w-full h-full rounded-xl" />
          </div>
          <h1 className="text-2xl font-bold text-white animate-fade-in animate-delay-150">Mozo, la cuenta!</h1>
          <p className="text-slate-400 mt-1 text-sm animate-fade-in animate-delay-200">
            Calculá tu ahorro en restaurantes 🇺🇾
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="animate-fade-in-right animate-delay-300">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Total de la cuenta
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                $
              </span>
              <input
                ref={amountInputRef}
                type="text"
                inputMode="decimal"
                value={amountExpression}
                onChange={(e) => setAmountExpression(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && numericAmount > 0) {
                    e.preventDefault();
                    setAmountExpression(numericAmount.toFixed(2));
                    tipInputRef.current?.focus();
                  }
                }}
                placeholder="500"
                className="w-full pl-10 pr-4 py-3 text-lg font-semibold bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:outline-none transition-all focus:border-cyan-500 focus:ring-cyan-500/20"
              />
            </div>
            {expressionHasOperator && (
              <p className="text-xs text-slate-400 mt-1">
                = $ {formatMoney(numericAmount)}
              </p>
            )}
            {amountExpression.trim() !== "" && numericAmount <= 0 && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1 animate-shake">
                <span>⚠️</span> El monto debe ser mayor a cero
              </p>
            )}
            {amountExpression.trim() === "" && (
              <p className="text-xs text-slate-500 mt-1">
                Podés usar +, -, *, /
              </p>
            )}
          </div>

          <div className="animate-fade-in-right animate-delay-[350ms]">
            {/* Pregunta */}
            <label className="block text-sm font-medium text-slate-300 mb-2">
              ¿Desea agregar propina?
            </label>

            {/* Botones Sí/No */}
            <div className="flex gap-2">
              <button
                onClick={() => setWantsTip(false)}
                className={clsx(
                  "flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all",
                  {
                    "bg-cyan-500/20 border-2 border-cyan-500 text-cyan-300": !wantsTip,
                    "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10": wantsTip
                  }
                )}
              >
                No
              </button>
              <button
                onClick={() => setWantsTip(true)}
                className={clsx(
                  "flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all",
                  {
                    "bg-cyan-500/20 border-2 border-cyan-500 text-cyan-300": wantsTip,
                    "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10": !wantsTip
                  }
                )}
              >
                Sí
              </button>
            </div>

            {/* Hint cuando selecciona Sí */}
            {wantsTip && (
              <p className="text-xs text-slate-400 mt-2 animate-fade-in">
                Propina {tipType === "porcentaje" ? `${tipPercentage}%` : `$${fixedTip || "0"}`} = ${" "}
                {formatMoney(numericTip)}
                <span className="text-slate-500"> · Cambialo en Ajustes avanzados</span>
              </p>
            )}
          </div>

          <div className="animate-fade-in-right animate-delay-[400ms]">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Descuento de tarjeta
            </label>
            <div className="relative">
              <input
                type="number"
                value={cardDiscount}
                onChange={(e) => handleCardDiscountChange(e.target.value)}
                placeholder="0"
                min="0"
                max="100"
                className="w-full pl-4 pr-10 py-3 text-lg font-semibold bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:outline-none transition-all focus:border-cyan-500 focus:ring-cyan-500/20"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                %
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ingresá el % que te ofrece tu banco
            </p>

            {discountPercentage > 0 && (
              <div className="mt-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3 space-y-3">
                {/* Header con lenguaje cotidiano */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    💳 ¿Cuándo te descuentan?
                  </span>
                  <InfoTooltip
                    show={showDiscountTypeTooltip}
                    onToggle={() =>
                      setShowDiscountTypeTooltip(!showDiscountTypeTooltip)
                    }
                  >
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="font-medium text-slate-100">
                          ✓ Me descuentan en estado de cuenta:
                        </p>
                        <p className="text-slate-300 mt-1">
                          Pagás el total ahora. Tu banco te devuelve el
                          descuento después en tu estado de cuenta.
                        </p>
                        <p className="text-slate-400 mt-1 text-[11px]">
                          Ejemplo: Cuenta $1000 con 20% → pagás $1000, te
                          devuelven $200 en el estado de cuenta
                        </p>
                      </div>
                      <div className="border-t border-slate-600 pt-2">
                        <p className="font-medium text-slate-100">
                          ✓ Ya está descontado en la cuenta:
                        </p>
                        <p className="text-slate-300 mt-1">
                          Cuando te traen el POS para pagar, ya vas a pagar
                          menos. El descuento ya está aplicado.
                        </p>
                        <p className="text-slate-400 mt-1 text-[11px]">
                          Ejemplo: Cuenta $1000 con 20% → el POS muestra $800
                        </p>
                      </div>
                    </div>
                  </InfoTooltip>
                </div>

                {/* Radio-style option cards */}
                <div className="space-y-2">
                  {/* Opción 1: Reembolso (descuento en estado de cuenta) */}
                  <button
                    onClick={() => setDiscountType("reembolso")}
                    className={clsx(
                      "w-full text-left p-3 rounded-lg border-2 transition-all",
                      {
                        "border-cyan-500 bg-cyan-500/10": discountType === "reembolso",
                        "border-white/10 bg-white/5 hover:border-white/20": discountType !== "reembolso"
                      }
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Radio indicator */}
                      <div
                        className={clsx(
                          "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                          {
                            "border-cyan-500 bg-cyan-500": discountType === "reembolso",
                            "border-slate-400 bg-transparent": discountType !== "reembolso"
                          }
                        )}
                      >
                        {discountType === "reembolso" && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>

                      {/* Text content */}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">
                          Me descuentan en estado de cuenta
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Opción 2: En factura (ya descontado) */}
                  <button
                    onClick={() => setDiscountType("factura")}
                    className={clsx(
                      "w-full text-left p-3 rounded-lg border-2 transition-all",
                      {
                        "border-cyan-500 bg-cyan-500/10": discountType === "factura",
                        "border-white/10 bg-white/5 hover:border-white/20": discountType !== "factura"
                      }
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Radio indicator */}
                      <div
                        className={clsx(
                          "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                          {
                            "border-cyan-500 bg-cyan-500": discountType === "factura",
                            "border-slate-400 bg-transparent": discountType !== "factura"
                          }
                        )}
                      >
                        {discountType === "factura" && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>

                      {/* Text content */}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">
                          Ya está descontado en la factura
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Hint informativo sobre propina */}
            {wantsTip && discountType === "reembolso" && discountPercentage > 0 && (
              <p className="text-xs text-slate-400 mt-2">
                💡 La propina {includeTipInDiscount ? "está incluida" : "no está incluida"} en el descuento
                <span className="text-slate-500"> · Podés cambiarlo en Ajustes avanzados</span>
              </p>
            )}
          </div>

          {/* Ajustes Avanzados - Consolidado */}
          <div className="animate-fade-in-right animate-delay-[450ms]">
            {!showAdvancedSettings ? (
              <button
                onClick={() => setShowAdvancedSettings(true)}
                className="w-full py-3 px-4 rounded-xl border-2 border-cyan-500/30 bg-cyan-950/10 hover:bg-cyan-950/20 hover:border-cyan-500/50 transition-all text-cyan-400 hover:text-cyan-300 font-medium text-sm flex items-center justify-center gap-2"
              >
                <span>⚙️</span> Ajustes avanzados
              </button>
            ) : (
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span>⚙️</span> Ajustes avanzados
                  </h3>
                  <button
                    onClick={() => setShowAdvancedSettings(false)}
                    className="w-8 h-8 flex items-center justify-center text-xl text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    aria-label="Cerrar ajustes avanzados"
                  >
                    ✕
                  </button>
                </div>

                {/* Personalizar propina - Solo visible cuando wantsTip = true */}
                {wantsTip && (
                  <div>
                    {/* Label */}
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      ¿Cómo querés calcular la propina?
                    </label>

                    {/* Botones grandes para seleccionar tipo */}
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => handleTipTypeChange("porcentaje")}
                        className={clsx(
                          "flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all",
                          {
                            "bg-cyan-500/20 border-2 border-cyan-500 text-cyan-300": tipType === "porcentaje",
                            "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10": tipType !== "porcentaje"
                          }
                        )}
                      >
                        En porcentaje (%)
                      </button>
                      <button
                        onClick={() => handleTipTypeChange("fija")}
                        className={clsx(
                          "flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all",
                          {
                            "bg-cyan-500/20 border-2 border-cyan-500 text-cyan-300": tipType === "fija",
                            "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10": tipType !== "fija"
                          }
                        )}
                      >
                        Monto fijo ($)
                      </button>
                    </div>

                    {/* Input field */}
                    <div className="relative">
                      {tipType === "fija" && (
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                          $
                        </span>
                      )}
                      <input
                        ref={tipInputRef}
                        type="number"
                        value={tipType === "porcentaje" ? tipPercentage : fixedTip}
                        onChange={(e) =>
                          tipType === "porcentaje"
                            ? handleTipPercentageChange(e.target.value)
                            : handleFixedTipChange(e.target.value)
                        }
                        placeholder={tipType === "porcentaje" ? "10" : "0.00"}
                        className={clsx(
                          "w-full py-3 text-lg font-semibold bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all",
                          {
                            "pl-10 pr-4": tipType === "fija",
                            "pl-4 pr-10": tipType === "porcentaje"
                          }
                        )}
                      />
                      {tipType === "porcentaje" && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                          %
                        </span>
                      )}
                    </div>

                    {/* Helper text */}
                    <p className="text-xs text-slate-400 mt-1">
                      {tipType === "porcentaje"
                        ? `= $ ${formatMoney(numericTip)}`
                        : `Propina fija en pesos`
                      }
                    </p>
                  </div>
                )}

                {/* Incluir propina en descuento - Solo visible para reembolso */}
                {wantsTip && discountType === "reembolso" && discountPercentage > 0 && (
                  <div className="border-t border-slate-700/50 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <label className="block text-sm font-medium text-slate-300">
                        ¿Incluir propina en el descuento?
                      </label>
                      <InfoTooltip
                        show={showTipInDiscountTooltip}
                        onToggle={() =>
                          setShowTipInDiscountTooltip(!showTipInDiscountTooltip)
                        }
                      >
                        <div className="space-y-3 text-xs">
                          <div>
                            <p className="font-medium text-slate-100">
                              ✓ Sí (incluir propina):
                            </p>
                            <p className="text-slate-300 mt-1">
                              El descuento se calcula sobre la cuenta + la propina.
                              Ahorrás más.
                            </p>
                            <p className="text-slate-400 mt-1 text-[11px]">
                              Ejemplo: Cuenta $1000 + Propina $100 con 20% descuento
                              = $220 de reembolso
                            </p>
                          </div>
                          <div className="border-t border-slate-600 pt-2">
                            <p className="font-medium text-slate-100">
                              ✗ No (solo cuenta):
                            </p>
                            <p className="text-slate-300 mt-1">
                              El descuento se calcula solo sobre la cuenta, sin la
                              propina.
                            </p>
                            <p className="text-slate-400 mt-1 text-[11px]">
                              Ejemplo: Cuenta $1000 con 20% descuento = $200 de
                              reembolso (propina no cuenta)
                            </p>
                          </div>
                        </div>
                      </InfoTooltip>
                    </div>

                    {/* Botones No/Sí */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIncludeTipInDiscount(false)}
                        className={clsx(
                          "flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all",
                          {
                            "bg-cyan-500/20 border-2 border-cyan-500 text-cyan-300": !includeTipInDiscount,
                            "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10": includeTipInDiscount
                          }
                        )}
                      >
                        No
                      </button>
                      <button
                        onClick={() => setIncludeTipInDiscount(true)}
                        className={clsx(
                          "flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all",
                          {
                            "bg-cyan-500/20 border-2 border-cyan-500 text-cyan-300": includeTipInDiscount,
                            "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10": !includeTipInDiscount
                          }
                        )}
                      >
                        Sí
                      </button>
                    </div>

                    {/* Panel informativo cuando selecciona "Sí" */}
                    {includeTipInDiscount && (
                      <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-xs font-medium text-slate-200">
                          El descuento se calcula sobre:{" "}
                          <span className="text-white font-semibold">
                            $ {formatMoney(cardDiscountBase)}
                          </span>
                        </p>
                        <p className="text-xs text-slate-100 mt-1">
                          Cuenta (${formatMoney(numericAmount)}) + Propina ($
                          {formatMoney(numericTip)})
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Dividir cuenta Section */}
                <div className="border-t border-slate-700/50 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Dividir cuenta
                    </label>
                    <button
                      onClick={() => setSplitEnabled(!splitEnabled)}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={clsx(
                          "relative w-11 h-6 rounded-full transition-colors duration-300",
                          {
                            "bg-cyan-500": splitEnabled,
                            "bg-white/20": !splitEnabled
                          }
                        )}
                      >
                        <div
                          className={clsx(
                            "absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300",
                            {
                              "left-6": splitEnabled,
                              "left-1": !splitEnabled
                            }
                          )}
                        />
                      </div>
                    </button>
                  </div>

                  {splitEnabled && (
                    <div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                          👥
                        </span>
                        <input
                          type="number"
                          value={numberOfPeople}
                          onChange={(e) => handleNumberOfPeopleChange(e.target.value)}
                          placeholder="2"
                          min="2"
                          max="99"
                          className="w-full pl-12 pr-4 py-3 text-lg font-semibold bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:outline-none transition-all focus:border-cyan-500 focus:ring-cyan-500/20"
                        />
                      </div>
                      <p className="text-xs text-slate-200 mt-1">
                        Número de personas (2-99)
                      </p>
                    </div>
                  )}
                </div>

                {/* IVA Section */}
                <div className="border-t border-slate-700/50 pt-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Devolución IVA (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={vatPercentage}
                      onChange={(e) => handleVatPercentageChange(e.target.value)}
                      placeholder="9"
                      min="0"
                      max="22"
                      className="w-full pl-4 pr-10 py-3 text-lg font-semibold bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:outline-none transition-all focus:border-cyan-500 focus:ring-cyan-500/20"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                      %
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 mt-1">
                    Ley 17.934: 9% en gastronomía
                  </p>
                </div>

                {/* Botón Restablecer todo */}
                <button
                  onClick={() => {
                    setVatPercentage("9");
                    setSplitEnabled(false);
                    setNumberOfPeople("2");
                    setIncludeTipInDiscount(false);
                    setWantsTip(true);
                    setTipPercentage("10");
                    setFixedTip("");
                    setTipType("porcentaje");
                  }}
                  className="w-full py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all text-sm"
                >
                  Restablecer todo
                </button>
              </div>
            )}
          </div>
        </div>

        {hasResults && (
          <div className="space-y-2 animate-fade-in animate-duration-500">
            <div className="flex justify-between items-center py-2 text-sm">
              <span className="text-slate-400">Cuenta</span>
              <span className="text-slate-300">
                $ {formatMoney(numericAmount)}
              </span>
            </div>

            {discountType === "factura" && discountPercentage > 0 && (
              <>
                <div className="flex justify-between items-center py-2 text-sm">
                  <span className="text-blue-400">
                    Dto. en factura ({discountPercentage}%)
                  </span>
                  <span className="text-blue-400">
                    - $ {formatMoney(cardDiscountAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 text-sm border-b border-white/10">
                  <span className="text-slate-400">Subtotal factura</span>
                  <span className="text-slate-300">
                    $ {formatMoney(discountedInvoiceAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 text-sm">
                  <span className="text-slate-400">Monto en POS</span>
                  <span className="text-slate-300">
                    $ {formatMoney(posAmount)}
                  </span>
                </div>
              </>
            )}

            {numericTip > 0 && (
              <div className="flex justify-between items-center py-2 text-sm">
                <div>
                  <span className="text-slate-400">
                    Propina{" "}
                    {tipType === "porcentaje"
                      ? `(${tipPercentage}%)`
                      : ""}
                  </span>
                </div>
                <span className="text-slate-300">
                  $ {formatMoney(numericTip)}
                </span>
              </div>
            )}

            {discountType === "reembolso" && (
              <div className="flex justify-between items-center py-2 text-sm border-b border-white/10">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-slate-300">
                  $ {formatMoney(subtotal)}
                </span>
              </div>
            )}

            {discountType === "reembolso" && discountPercentage > 0 && (
              <div className="flex justify-between items-center py-2 text-sm">
                <div>
                  <span className="text-blue-400">
                    Dto. tarjeta ({discountPercentage}%)
                  </span>
                  {numericTip > 0 && (
                    <p className="text-xs text-slate-500">
                      {includeTipInDiscount
                        ? "Sobre cuenta + propina"
                        : "Solo sobre cuenta"}
                    </p>
                  )}
                </div>
                <span className="text-blue-400">
                  - $ {formatMoney(cardDiscountAmount)}
                </span>
              </div>
            )}

            {vatRefund > 0 && (
              <div className="flex justify-between items-center py-2 text-sm">
                <div>
                  <span className="text-cyan-400">
                    Devolución IVA ({vatRefund}%)
                  </span>
                  <p className="text-xs text-slate-500">
                    Sobre gravado $ {formatMoney(taxableAmount)}
                  </p>
                </div>
                <span className="text-cyan-400">
                  - $ {formatMoney(vatDiscount)}
                </span>
              </div>
            )}

            <div className="rounded-2xl p-4 mt-3 bg-gradient-to-r from-cyan-500 to-sky-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-cyan-100">Pagás</p>
                  <p className="text-white text-2xl font-bold">
                    $ {formatMoney(finalPrice)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-cyan-100">Ahorrás</p>
                  <p className="text-white text-lg font-semibold">
                    $ {formatMoney(totalSavings)}
                  </p>
                  <p className="text-xs text-cyan-100">
                    ({savingsPercentage.toFixed(1)}%)
                  </p>
                </div>
              </div>
            </div>

            {/* Per-person split display */}
            {splitEnabled && numPeople >= 2 && (
              <div className="mt-3 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 overflow-hidden">
                <div className="px-4 py-3 bg-cyan-900/30 border-b border-cyan-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white flex items-center gap-2">
                      👥 Por persona ({numPeople} personas)
                    </span>
                  </div>
                </div>
                <div className="px-4 py-3 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Cuenta</span>
                    <span className="text-slate-300">
                      $ {formatMoney(perPersonAmount)}
                    </span>
                  </div>

                  {numericTip > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Propina</span>
                      <span className="text-slate-300">
                        $ {formatMoney(perPersonTip)}
                      </span>
                    </div>
                  )}

                  {discountPercentage > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-blue-400">
                        Dto. tarjeta
                      </span>
                      <span className="text-blue-400">
                        - $ {formatMoney(perPersonCardDiscount)}
                      </span>
                    </div>
                  )}

                  {vatRefund > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-cyan-400">Devolución IVA</span>
                      <span className="text-cyan-400">
                        - $ {formatMoney(perPersonVatDiscount)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-white/10 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-cyan-100">Paga cada uno</p>
                        <p className="text-white text-xl font-bold">
                          $ {formatMoney(perPersonFinalPrice)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-cyan-100">Ahorra cada uno</p>
                        <p className="text-white text-base font-semibold">
                          $ {formatMoney(perPersonSavings)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Receipt accordions */}
            <div className="mt-4 space-y-2">
              <Collapsible
                isOpen={invoiceOpen}
                setIsOpen={setInvoiceOpen}
                icon="📄"
                title="Factura e-Ticket"
              >
                <div className="flex justify-between">
                  <span className="text-slate-400">Consumo</span>
                  <span className="text-slate-300">
                    $ {formatMoney(numericAmount)}
                  </span>
                </div>
                {discountType === "factura" && discountPercentage > 0 && (
                  <div className="flex justify-between">
                    <span className="text-blue-400">
                      Descuento ({discountPercentage}%)
                    </span>
                    <span className="text-blue-400">
                      - ${" "}
                      {formatMoney(
                        (numericAmount * discountPercentage) / 100
                      )}
                    </span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">
                      Subtotal gravado (22%)
                    </span>
                    <span className="text-slate-300">
                      $ {formatMoney(taxableAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">IVA 22%</span>
                    <span className="text-slate-300">
                      $ {formatMoney(taxableAmount * VAT_PERCENTAGE)}
                    </span>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-white">Total facturado</span>
                    <span className="text-white">
                      ${" "}
                      {formatMoney(
                        discountType === "factura"
                          ? posAmount
                          : numericAmount
                      )}
                    </span>
                  </div>
                </div>
              </Collapsible>

              <Collapsible
                isOpen={posOpen}
                setIsOpen={setPosOpen}
                icon="💳"
                title="Voucher POS"
              >
                <div className="flex justify-between">
                  <span className="text-slate-400">Monto base</span>
                  <span className="text-slate-300">
                    $ {formatMoney(posAmount)}
                  </span>
                </div>
                {numericTip > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Propina</span>
                    <span className="text-slate-300">
                      $ {formatMoney(numericTip)}
                    </span>
                  </div>
                )}
                {vatRefund > 0 && (
                  <div className="flex justify-between">
                    <span className="text-cyan-400">
                      Devolución IVA Ley 17.934
                    </span>
                    <span className="text-cyan-400">
                      - $ {formatMoney(vatDiscount)}
                    </span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-white">Total pagado</span>
                    <span className="text-white">
                      ${" "}
                      {formatMoney(
                        posAmount + numericTip - vatDiscount
                      )}
                    </span>
                  </div>
                </div>
              </Collapsible>
            </div>
          </div>
        )}

        {!hasResults && (
          <div className="text-center py-6 text-slate-500 animate-fade-in animate-delay-500">
            <p>Ingresá el monto para calcular</p>
          </div>
        )}

        <p className="text-center text-xs text-slate-600 mt-4 animate-fade-in animate-delay-[550ms]">
          Devolución IVA acreditada automáticamente
        </p>
      </div>
    </div>
  );
}
