import { useState, useMemo, useRef } from "react";
import type { ReactNode } from "react";

// Componente reutilizable para secciones colapsables
function Collapsible({
  abierto,
  setAbierto,
  icono,
  titulo,
  children,
}: {
  abierto: boolean;
  setAbierto: (abierto: boolean) => void;
  icono: string;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border overflow-hidden border-cyan-500/30 bg-cyan-950/20">
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center justify-between p-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-white">
          <span>{icono}</span> {titulo}
        </span>
        <span
          className={`text-slate-400 transition-transform duration-300 ${
            abierto ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {abierto && (
        <div className="px-3 pb-3 space-y-2 text-sm border-t border-white/10 pt-3">
          {children}
        </div>
      )}
    </div>
  );
}

export default function RestaurantIVACalculator() {
  const [montoExpresion, setMontoExpresion] = useState("");
  const [propinaPorcentaje, setPropinaPorcentaje] = useState("10");
  const [propinaFija, setPropinaFija] = useState("");
  const [tipoPropina, setTipoPropina] = useState("porcentaje");
  const [descuentoTarjeta, setDescuentoTarjeta] = useState("");
  const [porcentajeIVA, setPorcentajeIVA] = useState("9");
  const [propinaEnDescuento, setPropinaEnDescuento] = useState(true);
  const [tipoDescuento, setTipoDescuento] = useState("reembolso"); // 'reembolso' o 'factura'
  const [facturaAbierta, setFacturaAbierta] = useState(false);
  const [posAbierto, setPosAbierto] = useState(false);
  const [showAdvancedVATSettings, setShowAdvancedVATSettings] = useState(false);

  // Ref para el campo de propina
  const propinaInputRef = useRef<HTMLInputElement>(null);

  // Evaluar expresión matemática de forma segura
  const evaluarExpresion = (expr: string) => {
    if (!expr || expr.trim() === "") return 0;
    try {
      // Solo permitir números, operadores básicos, paréntesis y puntos
      const sanitized = expr.replace(/[^0-9+\-*/.() ]/g, "");
      if (!sanitized) return 0;

      // Evaluar de forma segura usando Function
      const result = new Function(`return ${sanitized}`)();
      return isNaN(result) || !isFinite(result) ? 0 : result;
    } catch {
      return 0;
    }
  };

  const montoNumerico = useMemo(
    () => evaluarExpresion(montoExpresion),
    [montoExpresion]
  );

  const descuentoPorcentaje = parseFloat(descuentoTarjeta) || 0;
  const ivaReembolso = parseFloat(porcentajeIVA) || 0;

  // Cálculos según tipo de descuento
  const montoDescontadoFactura =
    tipoDescuento === "factura"
      ? montoNumerico * (1 - descuentoPorcentaje / 100)
      : montoNumerico;

  // Monto en POS
  const montoPOS = montoDescontadoFactura;

  // Calcular propina sobre el monto del POS (no sobre el e-ticket)
  const propinaNumerico = useMemo(() => {
    // La propina siempre se calcula sobre el monto que va al POS
    const basePropina = montoPOS;

    if (tipoPropina === "porcentaje") {
      const pct = parseFloat(propinaPorcentaje) || 0;
      return basePropina * (pct / 100);
    }
    return parseFloat(propinaFija) || 0;
  }, [
    tipoPropina,
    propinaPorcentaje,
    propinaFija,
    montoNumerico,
    tipoDescuento,
    montoPOS,
  ]);

  const subtotal = montoNumerico + propinaNumerico;

  // Para reembolso, el descuento se calcula sobre subtotal o solo monto
  const baseDescuentoTarjeta = propinaEnDescuento ? subtotal : montoNumerico;
  const montoDescuentoTarjeta =
    tipoDescuento === "reembolso"
      ? baseDescuentoTarjeta * (descuentoPorcentaje / 100)
      : montoNumerico * (descuentoPorcentaje / 100);

  // Base gravada: siempre sobre el monto efectivamente facturado (sin propina)
  // Si es descuento en factura, usar el monto del POS (puede ser redondeado)
  const montoParaIVA = tipoDescuento === "factura" ? montoPOS : montoNumerico;
  const montoGravado = montoParaIVA / 1.22;
  const descuentoIVA = montoGravado * (ivaReembolso / 100);

  // Total final
  const precioFinal =
    tipoDescuento === "factura"
      ? montoPOS + propinaNumerico - descuentoIVA
      : montoPOS + propinaNumerico - montoDescuentoTarjeta - descuentoIVA;
  const ahorroTotal = subtotal - precioFinal;
  const porcentajeAhorro = subtotal > 0 ? (ahorroTotal / subtotal) * 100 : 0;

  const formatMoney = (value: number) => {
    return value.toLocaleString("es-UY", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const hayResultados = montoNumerico > 0;
  const expresionTieneOperador = /[+\-*/]/.test(montoExpresion);

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
                value={montoExpresion}
                onChange={(e) => setMontoExpresion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && montoNumerico > 0) {
                    e.preventDefault();
                    setMontoExpresion(montoNumerico.toFixed(2));
                    propinaInputRef.current?.focus();
                  }
                }}
                placeholder="0.00 o 500+300"
                className="w-full pl-10 pr-4 py-3 text-lg font-semibold bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:outline-none transition-all focus:border-cyan-500 focus:ring-cyan-500/20"
              />
            </div>
            {expresionTieneOperador && (
              <p className="text-xs text-slate-400 mt-1">
                = $ {formatMoney(montoNumerico)}
              </p>
            )}
            {montoExpresion.trim() !== "" && montoNumerico <= 0 && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <span>⚠️</span> El monto debe ser mayor a cero
              </p>
            )}
            {montoExpresion.trim() === "" && (
              <p className="text-xs text-slate-500 mt-1">
                Ejemplo: 500+300 o 1000-200
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
                  onClick={() => setTipoPropina("porcentaje")}
                  className={`px-2 py-1 text-xs rounded-md transition-all ${
                    tipoPropina === "porcentaje"
                      ? "bg-cyan-500 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  %
                </button>
                <button
                  onClick={() => setTipoPropina("fija")}
                  className={`px-2 py-1 text-xs rounded-md transition-all ${
                    tipoPropina === "fija"
                      ? "bg-cyan-500 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  $
                </button>
              </div>
            </div>
            <div className="relative">
              {tipoPropina === "fija" && (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                  $
                </span>
              )}
              <input
                ref={propinaInputRef}
                type="number"
                value={
                  tipoPropina === "porcentaje" ? propinaPorcentaje : propinaFija
                }
                onChange={(e) =>
                  tipoPropina === "porcentaje"
                    ? setPropinaPorcentaje(e.target.value)
                    : setPropinaFija(e.target.value)
                }
                placeholder={tipoPropina === "porcentaje" ? "10" : "0.00"}
                className={`w-full py-3 text-lg font-semibold bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all ${
                  tipoPropina === "fija" ? "pl-10 pr-4" : "pl-4 pr-10"
                }`}
              />
              {tipoPropina === "porcentaje" && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                  %
                </span>
              )}
            </div>
            {tipoPropina === "porcentaje" && propinaNumerico > 0 && (
              <p className="text-xs text-slate-400 mt-1">
                = $ {formatMoney(propinaNumerico)}
              </p>
            )}
            <p className="text-xs text-slate-500 mt-1">Sin devolución de IVA</p>
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
                    value={porcentajeIVA}
                    onChange={(e) => setPorcentajeIVA(e.target.value)}
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
                      setPorcentajeIVA("9");
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

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Descuento de tarjeta{" "}
              <span className="text-slate-500">(opcional)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={descuentoTarjeta}
                onChange={(e) => setDescuentoTarjeta(e.target.value)}
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

            {descuentoPorcentaje > 0 && (
              <div className="mt-3 space-y-2">
                <div className="flex bg-white/10 rounded-xl p-1">
                  <button
                    onClick={() => setTipoDescuento("reembolso")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                      tipoDescuento === "reembolso"
                        ? "bg-cyan-500 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Reembolso
                  </button>
                  <button
                    onClick={() => setTipoDescuento("factura")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                      tipoDescuento === "factura"
                        ? "bg-cyan-500 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    En factura
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  {tipoDescuento === "reembolso"
                    ? "El descuento se devuelve después"
                    : "El descuento se aplica en la factura (propina sobre monto descontado)"}
                </p>
              </div>
            )}

            {tipoDescuento === "reembolso" && descuentoPorcentaje > 0 && (
              <button
                onClick={() => setPropinaEnDescuento(!propinaEnDescuento)}
                className="flex items-center gap-3 mt-3 w-full"
              >
                <div
                  className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
                    propinaEnDescuento ? "bg-cyan-500" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${
                      propinaEnDescuento ? "left-6" : "left-1"
                    }`}
                  />
                </div>
                <span className="text-xs text-slate-400">
                  Incluir propina en el descuento
                </span>
              </button>
            )}
          </div>
        </div>

        {hayResultados && (
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 text-sm">
              <span className="text-slate-400">Cuenta</span>
              <span className="text-slate-300">
                $ {formatMoney(montoNumerico)}
              </span>
            </div>

            {tipoDescuento === "factura" && descuentoPorcentaje > 0 && (
              <>
                <div className="flex justify-between items-center py-2 text-sm">
                  <span className="text-blue-400">
                    Dto. en factura ({descuentoPorcentaje}%)
                  </span>
                  <span className="text-blue-400">
                    - $ {formatMoney(montoDescuentoTarjeta)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 text-sm border-b border-white/10">
                  <span className="text-slate-400">Subtotal factura</span>
                  <span className="text-slate-300">
                    $ {formatMoney(montoDescontadoFactura)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 text-sm">
                  <span className="text-slate-400">Monto en POS</span>
                  <span className="text-slate-300">
                    $ {formatMoney(montoPOS)}
                  </span>
                </div>
              </>
            )}

            {propinaNumerico > 0 && (
              <div className="flex justify-between items-center py-2 text-sm">
                <div>
                  <span className="text-slate-400">
                    Propina{" "}
                    {tipoPropina === "porcentaje"
                      ? `(${propinaPorcentaje}%)`
                      : ""}
                  </span>
                </div>
                <span className="text-slate-300">
                  $ {formatMoney(propinaNumerico)}
                </span>
              </div>
            )}

            {tipoDescuento === "reembolso" && (
              <div className="flex justify-between items-center py-2 text-sm border-b border-white/10">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-slate-300">
                  $ {formatMoney(subtotal)}
                </span>
              </div>
            )}

            {tipoDescuento === "reembolso" && descuentoPorcentaje > 0 && (
              <div className="flex justify-between items-center py-2 text-sm">
                <div>
                  <span className="text-blue-400">
                    Dto. tarjeta ({descuentoPorcentaje}%)
                  </span>
                  {propinaNumerico > 0 && (
                    <p className="text-xs text-slate-500">
                      {propinaEnDescuento
                        ? "Sobre cuenta + propina"
                        : "Solo sobre cuenta"}
                    </p>
                  )}
                </div>
                <span className="text-blue-400">
                  - $ {formatMoney(montoDescuentoTarjeta)}
                </span>
              </div>
            )}

            {ivaReembolso > 0 && (
              <div className="flex justify-between items-center py-2 text-sm">
                <div>
                  <span className="text-cyan-400">
                    Devolución IVA ({ivaReembolso}%)
                  </span>
                  <p className="text-xs text-slate-500">
                    Sobre gravado $ {formatMoney(montoGravado)}
                  </p>
                </div>
                <span className="text-cyan-400">
                  - $ {formatMoney(descuentoIVA)}
                </span>
              </div>
            )}

            <div className="rounded-2xl p-4 mt-3 bg-gradient-to-r from-cyan-500 to-sky-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-cyan-100">Pagás</p>
                  <p className="text-white text-2xl font-bold">
                    $ {formatMoney(precioFinal)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-cyan-100">Ahorrás</p>
                  <p className="text-white text-lg font-semibold">
                    $ {formatMoney(ahorroTotal)}
                  </p>
                  <p className="text-xs text-cyan-100">
                    ({porcentajeAhorro.toFixed(1)}%)
                  </p>
                </div>
              </div>
            </div>

            {/* Acordeones de comprobantes */}
            <div className="mt-4 space-y-2">
              <Collapsible
                abierto={facturaAbierta}
                setAbierto={setFacturaAbierta}
                icono="📄"
                titulo="Factura e-Ticket"
              >
                <div className="flex justify-between">
                  <span className="text-slate-400">Consumo</span>
                  <span className="text-slate-300">
                    $ {formatMoney(montoNumerico)}
                  </span>
                </div>
                {tipoDescuento === "factura" && descuentoPorcentaje > 0 && (
                  <div className="flex justify-between">
                    <span className="text-blue-400">
                      Descuento ({descuentoPorcentaje}%)
                    </span>
                    <span className="text-blue-400">
                      - ${" "}
                      {formatMoney(
                        (montoNumerico * descuentoPorcentaje) / 100
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
                      $ {formatMoney(montoGravado)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">IVA 22%</span>
                    <span className="text-slate-300">
                      $ {formatMoney(montoGravado * 0.22)}
                    </span>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-white">Total facturado</span>
                    <span className="text-white">
                      ${" "}
                      {formatMoney(
                        tipoDescuento === "factura"
                          ? montoPOS
                          : montoNumerico
                      )}
                    </span>
                  </div>
                </div>
              </Collapsible>

              <Collapsible
                abierto={posAbierto}
                setAbierto={setPosAbierto}
                icono="💳"
                titulo="Voucher POS"
              >
                <div className="flex justify-between">
                  <span className="text-slate-400">Monto base</span>
                  <span className="text-slate-300">
                    $ {formatMoney(montoPOS)}
                  </span>
                </div>
                {propinaNumerico > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Propina</span>
                    <span className="text-slate-300">
                      $ {formatMoney(propinaNumerico)}
                    </span>
                  </div>
                )}
                {ivaReembolso > 0 && (
                  <div className="flex justify-between">
                    <span className="text-cyan-400">
                      Devolución IVA Ley 17.934
                    </span>
                    <span className="text-cyan-400">
                      - $ {formatMoney(descuentoIVA)}
                    </span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-white">Total pagado</span>
                    <span className="text-white">
                      ${" "}
                      {formatMoney(
                        montoPOS + propinaNumerico - descuentoIVA
                      )}
                    </span>
                  </div>
                </div>
              </Collapsible>
            </div>
          </div>
        )}

        {!hayResultados && (
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
