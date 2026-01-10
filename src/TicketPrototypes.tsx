import { useState } from "react";

// Datos de ejemplo para los prototipos
const mockData = {
  consumo: 990.0,
  descuento: 247.5,
  subtotalGravado: 608.61,
  iva: 133.89,
  total: 742.5,
  propina: 74.2,
  devolucionIVA: 54.74,
  totalPOS: 761.46,
};

const formatMoney = (value: number) =>
  value.toLocaleString("es-UY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Opción 1: Papel Térmico Clásico (actual)
function TicketThermal() {
  return (
    <div className="ticket-paper rounded">
      <div className="ticket-header">
        <span className="ticket-logo">e-Ticket</span>
        <div className="ticket-small">PAGO: CONTADO | MONEDA: UYU</div>
      </div>
      <div className="ticket-section">CONSUMO FINAL</div>
      <div
        className="ticket-row ticket-small"
        style={{
          borderBottom: "1px solid #333",
          paddingBottom: "2px",
          marginBottom: "4px",
        }}
      >
        <span style={{ width: "35px" }}>Cant.</span>
        <span style={{ flex: 1 }}>Descripción</span>
        <span style={{ width: "70px", textAlign: "right" }}>Total</span>
      </div>
      <div className="ticket-row">
        <span style={{ width: "35px" }}>1,00</span>
        <span style={{ flex: 1 }}>Consumo</span>
        <span style={{ width: "70px", textAlign: "right" }}>
          ${formatMoney(mockData.consumo)}
        </span>
      </div>
      <div className="ticket-row">
        <span style={{ width: "35px" }}>1,00</span>
        <span style={{ flex: 1 }}>Descuento (25%)</span>
        <span style={{ width: "70px", textAlign: "right" }}>
          -${formatMoney(mockData.descuento)}
        </span>
      </div>
      <div className="ticket-separator"></div>
      <div className="ticket-row">
        <span>Subtotal grav. 22%:</span>
        <span>${formatMoney(mockData.subtotalGravado)}</span>
      </div>
      <div className="ticket-row">
        <span>IVA 22%:</span>
        <span>${formatMoney(mockData.iva)}</span>
      </div>
      <div className="ticket-row ticket-total" style={{ marginTop: "4px" }}>
        <span>TOTAL:</span>
        <span>${formatMoney(mockData.total)}</span>
      </div>
      <div
        className="ticket-section"
        style={{ marginTop: "12px", marginBottom: "4px" }}
      >
        ADENDA
      </div>
      <div className="ticket-small" style={{ textAlign: "center" }}>
        Documento generado
      </div>
    </div>
  );
}

// Opción 2: Minimalista Moderno
function TicketMinimal() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "16px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "13px",
        color: "#1a1a1a",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          textAlign: "center",
          paddingBottom: "12px",
          borderBottom: "2px solid #f0f0f0",
        }}
      >
        <div
          style={{ fontSize: "11px", color: "#888", textTransform: "uppercase" }}
        >
          Factura
        </div>
        <div style={{ fontSize: "18px", fontWeight: "600", marginTop: "4px" }}>
          e-Ticket
        </div>
      </div>

      <div style={{ marginTop: "16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 0",
          }}
        >
          <span style={{ color: "#666" }}>Consumo</span>
          <span style={{ fontWeight: "500" }}>${formatMoney(mockData.consumo)}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 0",
          }}
        >
          <span style={{ color: "#22c55e" }}>Descuento 25%</span>
          <span style={{ color: "#22c55e", fontWeight: "500" }}>
            -${formatMoney(mockData.descuento)}
          </span>
        </div>
      </div>

      <div
        style={{
          borderTop: "2px solid #f0f0f0",
          marginTop: "8px",
          paddingTop: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "4px 0",
            fontSize: "12px",
          }}
        >
          <span style={{ color: "#888" }}>Subtotal gravado</span>
          <span style={{ color: "#666" }}>${formatMoney(mockData.subtotalGravado)}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "4px 0",
            fontSize: "12px",
          }}
        >
          <span style={{ color: "#888" }}>IVA 22%</span>
          <span style={{ color: "#666" }}>${formatMoney(mockData.iva)}</span>
        </div>
      </div>

      <div
        style={{
          background: "#f8f8f8",
          margin: "12px -16px -16px",
          padding: "16px",
          borderRadius: "0 0 12px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: "600" }}>Total</span>
        <span style={{ fontSize: "20px", fontWeight: "700" }}>
          ${formatMoney(mockData.total)}
        </span>
      </div>
    </div>
  );
}

// Opción 3: Neomorfismo
function TicketNeomorph() {
  return (
    <div
      style={{
        background: "#e8e8e8",
        borderRadius: "20px",
        padding: "20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "13px",
        color: "#444",
        boxShadow: "8px 8px 16px #c5c5c5, -8px -8px 16px #ffffff",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: "#e8e8e8",
            padding: "10px 20px",
            borderRadius: "12px",
            boxShadow:
              "inset 4px 4px 8px #c5c5c5, inset -4px -4px 8px #ffffff",
            fontWeight: "600",
            fontSize: "14px",
          }}
        >
          e-Ticket
        </div>
      </div>

      <div
        style={{
          background: "#e8e8e8",
          borderRadius: "12px",
          padding: "12px",
          boxShadow: "inset 3px 3px 6px #c5c5c5, inset -3px -3px 6px #ffffff",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "6px 0",
          }}
        >
          <span>Consumo</span>
          <span style={{ fontWeight: "600" }}>${formatMoney(mockData.consumo)}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "6px 0",
            color: "#16a34a",
          }}
        >
          <span>Descuento</span>
          <span style={{ fontWeight: "600" }}>-${formatMoney(mockData.descuento)}</span>
        </div>
      </div>

      <div style={{ padding: "0 4px", fontSize: "12px", color: "#666" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "4px 0",
          }}
        >
          <span>Gravado</span>
          <span>${formatMoney(mockData.subtotalGravado)}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "4px 0",
          }}
        >
          <span>IVA</span>
          <span>${formatMoney(mockData.iva)}</span>
        </div>
      </div>

      <div
        style={{
          marginTop: "12px",
          background: "#e8e8e8",
          borderRadius: "12px",
          padding: "14px",
          boxShadow: "4px 4px 8px #c5c5c5, -4px -4px 8px #ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: "600" }}>Total</span>
        <span style={{ fontSize: "18px", fontWeight: "700" }}>
          ${formatMoney(mockData.total)}
        </span>
      </div>
    </div>
  );
}

// Opción 4: Glassmorphism
function TicketGlass() {
  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(12px)",
        borderRadius: "16px",
        padding: "16px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "13px",
        color: "#fff",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
      }}
    >
      <div
        style={{
          textAlign: "center",
          paddingBottom: "12px",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            textTransform: "uppercase",
            opacity: 0.7,
            letterSpacing: "2px",
          }}
        >
          Factura
        </div>
        <div style={{ fontSize: "18px", fontWeight: "600", marginTop: "4px" }}>
          e-Ticket
        </div>
      </div>

      <div style={{ marginTop: "14px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 0",
          }}
        >
          <span style={{ opacity: 0.8 }}>Consumo</span>
          <span style={{ fontWeight: "500" }}>${formatMoney(mockData.consumo)}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 0",
            color: "#4ade80",
          }}
        >
          <span>Descuento 25%</span>
          <span style={{ fontWeight: "500" }}>-${formatMoney(mockData.descuento)}</span>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.2)",
          marginTop: "8px",
          paddingTop: "10px",
          fontSize: "11px",
          opacity: 0.7,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "3px 0",
          }}
        >
          <span>Subtotal grav.</span>
          <span>${formatMoney(mockData.subtotalGravado)}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "3px 0",
          }}
        >
          <span>IVA 22%</span>
          <span>${formatMoney(mockData.iva)}</span>
        </div>
      </div>

      <div
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          margin: "14px -16px -16px",
          padding: "14px 16px",
          borderRadius: "0 0 16px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: "600" }}>Total</span>
        <span style={{ fontSize: "20px", fontWeight: "700" }}>
          ${formatMoney(mockData.total)}
        </span>
      </div>
    </div>
  );
}

// Opción 5: Gradiente con acentos
function TicketGradient() {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "16px",
        padding: "16px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "13px",
        color: "#fff",
        boxShadow: "0 10px 40px rgba(102, 126, 234, 0.4)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "14px" }}>
        <div
          style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.2)",
            padding: "6px 16px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          e-Ticket
        </div>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.1)",
          borderRadius: "12px",
          padding: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "6px 0",
          }}
        >
          <span style={{ opacity: 0.9 }}>Consumo</span>
          <span style={{ fontWeight: "600" }}>${formatMoney(mockData.consumo)}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "6px 0",
            color: "#86efac",
          }}
        >
          <span>Descuento</span>
          <span style={{ fontWeight: "600" }}>-${formatMoney(mockData.descuento)}</span>
        </div>
      </div>

      <div
        style={{ padding: "10px 4px", fontSize: "11px", opacity: 0.8 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "3px 0",
          }}
        >
          <span>Subtotal grav.</span>
          <span>${formatMoney(mockData.subtotalGravado)}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "3px 0",
          }}
        >
          <span>IVA 22%</span>
          <span>${formatMoney(mockData.iva)}</span>
        </div>
      </div>

      <div
        style={{
          background: "rgba(0,0,0,0.2)",
          margin: "8px -16px -16px",
          padding: "14px 16px",
          borderRadius: "0 0 16px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: "600", fontSize: "14px" }}>Total</span>
        <span style={{ fontSize: "22px", fontWeight: "700" }}>
          ${formatMoney(mockData.total)}
        </span>
      </div>
    </div>
  );
}

// Opción 6: Dark Mode Elegante
function TicketDark() {
  return (
    <div
      style={{
        background: "#1a1a1a",
        borderRadius: "16px",
        padding: "16px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "13px",
        color: "#e5e5e5",
        border: "1px solid #333",
      }}
    >
      <div
        style={{
          textAlign: "center",
          paddingBottom: "12px",
          borderBottom: "1px solid #333",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            color: "#f97316",
            textTransform: "uppercase",
            letterSpacing: "3px",
          }}
        >
          Factura
        </div>
        <div style={{ fontSize: "18px", fontWeight: "600", marginTop: "4px" }}>
          e-Ticket
        </div>
      </div>

      <div style={{ marginTop: "14px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 0",
          }}
        >
          <span style={{ color: "#888" }}>Consumo</span>
          <span style={{ fontWeight: "500" }}>${formatMoney(mockData.consumo)}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 0",
          }}
        >
          <span style={{ color: "#4ade80" }}>Descuento 25%</span>
          <span style={{ color: "#4ade80", fontWeight: "500" }}>
            -${formatMoney(mockData.descuento)}
          </span>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid #333",
          marginTop: "8px",
          paddingTop: "10px",
          fontSize: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "4px 0",
            color: "#666",
          }}
        >
          <span>Subtotal grav.</span>
          <span>${formatMoney(mockData.subtotalGravado)}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "4px 0",
            color: "#666",
          }}
        >
          <span>IVA 22%</span>
          <span>${formatMoney(mockData.iva)}</span>
        </div>
      </div>

      <div
        style={{
          background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
          margin: "14px -16px -16px",
          padding: "14px 16px",
          borderRadius: "0 0 16px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: "600", color: "#fff" }}>Total</span>
        <span style={{ fontSize: "20px", fontWeight: "700", color: "#fff" }}>
          ${formatMoney(mockData.total)}
        </span>
      </div>
    </div>
  );
}

export default function TicketPrototypes() {
  const [selected, setSelected] = useState<number | null>(null);

  const options = [
    { name: "Térmico Clásico", component: <TicketThermal /> },
    { name: "Minimalista", component: <TicketMinimal /> },
    { name: "Neomorfismo", component: <TicketNeomorph /> },
    { name: "Glassmorphism", component: <TicketGlass /> },
    { name: "Gradiente", component: <TicketGradient /> },
    { name: "Dark Elegante", component: <TicketDark /> },
  ];

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-orange-900 via-red-900 to-slate-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Prototipos de Tickets
        </h1>
        <p className="text-slate-400 text-center mb-8">
          Hacé clic en uno para seleccionarlo
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {options.map((opt, idx) => (
            <div key={idx}>
              <div
                onClick={() => setSelected(idx)}
                className={`cursor-pointer transition-all duration-300 rounded-2xl p-4 ${
                  selected === idx
                    ? "ring-4 ring-orange-500 bg-orange-500/20"
                    : "hover:bg-white/5"
                }`}
              >
                <div className="mb-3 text-center">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      selected === idx
                        ? "bg-orange-500 text-white"
                        : "bg-white/10 text-slate-300"
                    }`}
                  >
                    {idx + 1}. {opt.name}
                  </span>
                </div>
                {opt.component}
              </div>
            </div>
          ))}
        </div>

        {selected !== null && (
          <div className="mt-8 text-center">
            <div className="inline-block bg-orange-500 text-white px-6 py-3 rounded-xl font-medium">
              Seleccionado: {options[selected].name}
            </div>
          </div>
        )}

        <p className="text-slate-500 text-center text-sm mt-8">
          Estos son prototipos visuales. Indicame cuál te gusta y lo implemento.
        </p>
      </div>
    </div>
  );
}
