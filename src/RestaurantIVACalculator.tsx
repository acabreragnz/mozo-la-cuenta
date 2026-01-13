import { useState, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { Parser } from "expr-eval";

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
        className="w-full flex items-center justify-between p-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-white">
          <span>{icon}</span> {title}
        </span>
        <span
          className={`text-slate-400 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
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

export default function RestaurantIVACalculator() {
  const [amountExpression, setAmountExpression] = useState("");
  const [tipPercentage, setTipPercentage] = useState("10");
  const [fixedTip, setFixedTip] = useState("");
  const [tipType, setTipType] = useState("porcentaje");
  const [cardDiscount, setCardDiscount] = useState("");
  const [vatPercentage, setVatPercentage] = useState("9");
  const [includeTipInDiscount, setIncludeTipInDiscount] = useState(true);
  const [discountType, setDiscountType] = useState("reembolso"); // 'reembolso' o 'factura'
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [posOpen, setPosOpen] = useState(false);
  const [showAdvancedVATSettings, setShowAdvancedVATSettings] = useState(false);

  // Ref for tip input field
  const tipInputRef = useRef<HTMLInputElement>(null);

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

  // Calculations based on discount type
  const discountedInvoiceAmount =
    discountType === "factura"
      ? numericAmount * (1 - discountPercentage / 100)
      : numericAmount;

  // POS amount
  const posAmount = discountedInvoiceAmount;

  // Calculate tip on POS amount (not on e-ticket)
  const numericTip = useMemo(() => {
    // Tip is always calculated on POS amount
    const tipBase = posAmount;

    if (tipType === "porcentaje") {
      const pct = parseFloat(tipPercentage) || 0;
      return tipBase * (pct / 100);
    }
    return parseFloat(fixedTip) || 0;
  }, [
    tipType,
    tipPercentage,
    fixedTip,
    numericAmount,
    discountType,
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
      <div className="backdrop-blur-lg rounded-3xl shadow-2xl p-6 w-full max-w-md border bg-cyan-950/40 border-cyan-500/20">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-3 bg-cyan-950/40 p-1">
            <img src="/favicon.jpg" alt="Mozo, la cuenta!" className="w-full h-full rounded-xl" />
          </div>
          <h1 className="text-2xl font-bold text-white">Mozo, la cuenta!</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Calculá tu ahorro en restaurantes 🇺🇾
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Total de la cuenta
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                $
              </span>
              <input
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
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <span>⚠️</span> El monto debe ser mayor a cero
              </p>
            )}
            {amountExpression.trim() === "" && (
              <p className="text-xs text-slate-500 mt-1">
                Podés usar +, -, *, /
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">
                Propina
              </label>
              <div className="flex bg-white/10 rounded-lg p-0.5">
                <button
                  onClick={() => setTipType("porcentaje")}
                  className={`px-2 py-1 text-xs rounded-md transition-all ${
                    tipType === "porcentaje"
                      ? "bg-cyan-500 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  %
                </button>
                <button
                  onClick={() => setTipType("fija")}
                  className={`px-2 py-1 text-xs rounded-md transition-all ${
                    tipType === "fija"
                      ? "bg-cyan-500 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  $
                </button>
              </div>
            </div>
            <div className="relative">
              {tipType === "fija" && (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                  $
                </span>
              )}
              <input
                ref={tipInputRef}
                type="number"
                value={
                  tipType === "porcentaje" ? tipPercentage : fixedTip
                }
                onChange={(e) =>
                  tipType === "porcentaje"
                    ? handleTipPercentageChange(e.target.value)
                    : handleFixedTipChange(e.target.value)
                }
                placeholder={tipType === "porcentaje" ? "10" : "0.00"}
                className={`w-full py-3 text-lg font-semibold bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all ${
                  tipType === "fija" ? "pl-10 pr-4" : "pl-4 pr-10"
                }`}
              />
              {tipType === "porcentaje" && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                  %
                </span>
              )}
            </div>
            {tipType === "porcentaje" && numericTip > 0 && (
              <p className="text-xs text-slate-400 mt-1">
                = $ {formatMoney(numericTip)}
              </p>
            )}
            <p className="text-xs text-slate-500 mt-1">Sin devolución de IVA</p>
          </div>

          <div>
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
              Ej: Scotiabank 25%, Itaú 20%, etc.
            </p>

            {discountPercentage > 0 && (
              <div className="mt-3 space-y-2">
                <div className="flex bg-white/10 rounded-xl p-1">
                  <button
                    onClick={() => setDiscountType("reembolso")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                      discountType === "reembolso"
                        ? "bg-cyan-500 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Reembolso
                  </button>
                  <button
                    onClick={() => setDiscountType("factura")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                      discountType === "factura"
                        ? "bg-cyan-500 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    En factura
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  {discountType === "reembolso"
                    ? "El descuento se devuelve después"
                    : "El descuento se aplica en la factura (propina sobre monto descontado)"}
                </p>
              </div>
            )}

            {discountType === "reembolso" && discountPercentage > 0 && (
              <button
                onClick={() => setIncludeTipInDiscount(!includeTipInDiscount)}
                className="flex items-center gap-3 mt-3 w-full"
              >
                <div
                  className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
                    includeTipInDiscount ? "bg-cyan-500" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${
                      includeTipInDiscount ? "left-6" : "left-1"
                    }`}
                  />
                </div>
                <span className="text-xs text-slate-400">
                  Incluir propina en el descuento
                </span>
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Devolución IVA
            </label>
            {showAdvancedVATSettings ? (
              <div>
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
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-slate-500">
                    Ley 17.934: 9% en gastronomía
                  </p>
                  <button
                    onClick={() => {
                      setVatPercentage("9");
                      setShowAdvancedVATSettings(false);
                    }}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Restablecer
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-white">
                      9% (Ley 17.934)
                    </span>
                    <button
                      onClick={() => setShowAdvancedVATSettings(true)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                    >
                      <span>⚙️</span> Ajustes avanzados
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Porcentaje estándar para restaurantes
                </p>
              </div>
            )}
          </div>
        </div>

        {hasResults && (
          <div className="space-y-2">
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
          <div className="text-center py-6 text-slate-500">
            <p>Ingresá el monto para calcular</p>
          </div>
        )}

        <p className="text-center text-xs text-slate-600 mt-4">
          Devolución IVA acreditada automáticamente
        </p>
      </div>
    </div>
  );
}
