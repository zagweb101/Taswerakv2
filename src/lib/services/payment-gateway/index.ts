// ====================================================================
// Payment Gateway Abstraction Layer
// Supports: manual (bank transfer), moyasar, tap, bitaps, tamara, tabby
//
// Currently only 'manual' is fully implemented.
// Other gateways are stubbed — fill in when merchant accounts are ready.
//
// Usage:
//   const gateway = getPaymentGateway("manual");
//   const result = await gateway.createPayment({
//     amount: 899,
//     currency: "SAR",
//     courseId: "...",
//     studentId: "...",
//     description: "تصوير البيوتي Beauty",
//   });
// ====================================================================

export type GatewayName = "manual" | "moyasar" | "tap" | "bitaps" | "tamara" | "tabby";

export interface PaymentRequest {
  amount: number; // in SAR (minor units handled by gateway)
  currency: string; // "SAR"
  courseId: string;
  studentId: string;
  studentEmail: string;
  studentName: string;
  courseTitle: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  ok: boolean;
  gateway: GatewayName;
  /** URL to redirect student for payment (for hosted gateways) */
  checkoutUrl?: string;
  /** Transaction ID from gateway */
  transactionId?: string;
  /** Status of payment */
  status: "pending" | "paid" | "failed" | "refunded";
  /** Raw response from gateway (for logging) */
  raw?: any;
  error?: string;
}

export interface WebhookPayload {
  gateway: GatewayName;
  transactionId: string;
  status: "paid" | "failed" | "refunded";
  amount: number;
  currency: string;
  metadata?: Record<string, any>;
  raw: any;
}

// ====================================================================
// Manual gateway (bank transfer)
// ====================================================================
const manualGateway = {
  name: "manual" as const,

  async createPayment(req: PaymentRequest): Promise<PaymentResult> {
    // Manual = student uploads receipt, instructor approves
    // No gateway interaction — just return pending
    return {
      ok: true,
      gateway: "manual",
      status: "pending",
      transactionId: `manual_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      raw: { message: "Student must upload bank transfer receipt" },
    };
  },

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    // For manual, verification is done by instructor (approve/reject)
    return {
      ok: true,
      gateway: "manual",
      transactionId,
      status: "pending",
      raw: { message: "Manual verification by instructor required" },
    };
  },

  parseWebhook(payload: any): WebhookPayload {
    // Manual gateway doesn't send webhooks
    throw new Error("Manual gateway does not support webhooks");
  },

  async refund(transactionId: string, amount?: number): Promise<PaymentResult> {
    // Manual refund = bank transfer back
    return {
      ok: true,
      gateway: "manual",
      transactionId,
      status: "refunded",
      raw: { message: "Manual refund processed outside system" },
    };
  },
};

// ====================================================================
// Moyasar gateway (https://moyasar.com)
// Saudi gateway — Mada, Visa, Mastercard, Apple Pay
// Setup: get API key from https://dashboard.moyasar.com
// ====================================================================
const moyasarGateway = {
  name: "moyasar" as const,

  async createPayment(req: PaymentRequest): Promise<PaymentResult> {
    const apiKey = process.env.MOYASAR_SECRET_KEY;
    if (!apiKey) {
      return { ok: false, gateway: "moyasar", status: "failed", error: "MOYASAR_SECRET_KEY not configured" };
    }

    try {
      const callbackUrl = req.callbackUrl || `${process.env.NEXTAUTH_URL}/api/payments/callback/moyasar`;

      const res = await fetch("https://api.moyasar.com/v1/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${Buffer.from(apiKey + ":").toString("base64")}`,
        },
        body: new URLSearchParams({
          amount: String(Math.round(req.amount * 100)), // halalas
          currency: req.currency,
          description: req.courseTitle,
          callback_url: callbackUrl,
          source: JSON.stringify({
            type: "creditcard", // supports mada/visa/mastercard/applepay
            name: req.studentName,
            number: "4111111111111111", // placeholder — real card entered on Moyasar page
            cvc: "123",
            month: "12",
            year: "26",
          }),
          metadata: JSON.stringify({
            courseId: req.courseId,
            studentId: req.studentId,
            ...req.metadata,
          }),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { ok: false, gateway: "moyasar", status: "failed", error: data.message || "Moyasar API error", raw: data };
      }

      return {
        ok: true,
        gateway: "moyasar",
        transactionId: data.id,
        status: data.status === "paid" ? "paid" : "pending",
        checkoutUrl: data.source?.transaction_url,
        raw: data,
      };
    } catch (err: any) {
      return { ok: false, gateway: "moyasar", status: "failed", error: err.message, raw: err };
    }
  },

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    const apiKey = process.env.MOYASAR_SECRET_KEY;
    if (!apiKey) {
      return { ok: false, gateway: "moyasar", status: "failed", error: "MOYASAR_SECRET_KEY not configured" };
    }

    try {
      const res = await fetch(`https://api.moyasar.com/v1/payments/${transactionId}`, {
        headers: {
          "Authorization": `Basic ${Buffer.from(apiKey + ":").toString("base64")}`,
        },
      });
      const data = await res.json();

      return {
        ok: res.ok,
        gateway: "moyasar",
        transactionId,
        status: data.status === "paid" ? "paid" : data.status === "failed" ? "failed" : "pending",
        raw: data,
      };
    } catch (err: any) {
      return { ok: false, gateway: "moyasar", status: "failed", error: err.message };
    }
  },

  parseWebhook(payload: any): WebhookPayload {
    return {
      gateway: "moyasar",
      transactionId: payload.id,
      status: payload.status === "paid" ? "paid" : payload.status === "failed" ? "failed" : "pending",
      amount: payload.amount ? payload.amount / 100 : 0,
      currency: payload.currency || "SAR",
      metadata: payload.metadata,
      raw: payload,
    };
  },

  async refund(transactionId: string, amount?: number): Promise<PaymentResult> {
    const apiKey = process.env.MOYASAR_SECRET_KEY;
    if (!apiKey) {
      return { ok: false, gateway: "moyasar", status: "failed", error: "MOYASAR_SECRET_KEY not configured" };
    }

    try {
      const body: any = {};
      if (amount) body.amount = Math.round(amount * 100);

      const res = await fetch(`https://api.moyasar.com/v1/payments/${transactionId}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${Buffer.from(apiKey + ":").toString("base64")}`,
        },
        body: new URLSearchParams(body),
      });
      const data = await res.json();

      return {
        ok: res.ok,
        gateway: "moyasar",
        transactionId,
        status: data.refunded ? "refunded" : "failed",
        raw: data,
      };
    } catch (err: any) {
      return { ok: false, gateway: "moyasar", status: "failed", error: err.message };
    }
  },
};

// ====================================================================
// Tap gateway (https://tap.company)
// Saudi/GCC gateway — all cards + Apple Pay + STC Pay
// ====================================================================
const tapGateway = {
  name: "tap" as const,

  async createPayment(req: PaymentRequest): Promise<PaymentResult> {
    const secretKey = process.env.TAP_SECRET_KEY;
    if (!secretKey) {
      return { ok: false, gateway: "tap", status: "failed", error: "TAP_SECRET_KEY not configured" };
    }

    try {
      const res = await fetch("https://api.tap.company/v2/charges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${secretKey}`,
        },
        body: JSON.stringify({
          amount: req.amount,
          currency: req.currency,
          threeDSecure: true,
          save_card: false,
          description: req.courseTitle,
          statement_descriptor: "Taswerak",
          metadata: { courseId: req.courseId, studentId: req.studentId, ...req.metadata },
          reference: { transaction: `tas_${Date.now()}` },
          receipt: { email: true, sms: true },
          customer: {
            first_name: req.studentName.split(" ")[0],
            last_name: req.studentName.split(" ").slice(1).join(" ") || "Student",
            email: req.studentEmail,
          },
          source: { id: "src_all" },
          post: { url: `${process.env.NEXTAUTH_URL}/api/payments/callback/tap` },
          redirect: { url: `${process.env.NEXTAUTH_URL}/student/payments` },
        }),
      });
      const data = await res.json();

      return {
        ok: res.ok,
        gateway: "tap",
        transactionId: data.id,
        status: data.status === "CAPTURED" ? "paid" : "pending",
        checkoutUrl: data.transaction?.url,
        raw: data,
      };
    } catch (err: any) {
      return { ok: false, gateway: "tap", status: "failed", error: err.message };
    }
  },

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    const secretKey = process.env.TAP_SECRET_KEY;
    if (!secretKey) return { ok: false, gateway: "tap", status: "failed", error: "TAP_SECRET_KEY not configured" };

    try {
      const res = await fetch(`https://api.tap.company/v2/charges/${transactionId}`, {
        headers: { "Authorization": `Bearer ${secretKey}` },
      });
      const data = await res.json();
      return {
        ok: res.ok,
        gateway: "tap",
        transactionId,
        status: data.status === "CAPTURED" ? "paid" : "failed",
        raw: data,
      };
    } catch (err: any) {
      return { ok: false, gateway: "tap", status: "failed", error: err.message };
    }
  },

  parseWebhook(payload: any): WebhookPayload {
    return {
      gateway: "tap",
      transactionId: payload.id,
      status: payload.status === "CAPTURED" ? "paid" : "failed",
      amount: payload.amount || 0,
      currency: payload.currency || "SAR",
      metadata: payload.metadata,
      raw: payload,
    };
  },

  async refund(transactionId: string, amount?: number): Promise<PaymentResult> {
    const secretKey = process.env.TAP_SECRET_KEY;
    if (!secretKey) return { ok: false, gateway: "tap", status: "failed", error: "TAP_SECRET_KEY not configured" };

    try {
      const res = await fetch(`https://api.tap.company/v2/refunds`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${secretKey}`,
        },
        body: JSON.stringify({
          charge_id: transactionId,
          amount: amount ? Math.round(amount * 100) : undefined,
          currency: "SAR",
          reason: "Customer requested refund",
        }),
      });
      const data = await res.json();
      return {
        ok: res.ok,
        gateway: "tap",
        transactionId,
        status: data.status === "REFUNDED" ? "refunded" : "failed",
        raw: data,
      };
    } catch (err: any) {
      return { ok: false, gateway: "tap", status: "failed", error: err.message };
    }
  },
};

// ====================================================================
// Gateway Registry
// ====================================================================
const gateways = {
  manual: manualGateway,
  moyasar: moyasarGateway,
  tap: tapGateway,
  // bitaps: bitapsGateway,   // TODO when account ready
  // tamara: tamaraGateway,   // TODO when account ready (BNPL)
  // tabby: tabbyGateway,     // TODO when account ready (BNPL)
};

export type PaymentGateway = typeof manualGateway;

export function getPaymentGateway(name: GatewayName): PaymentGateway {
  const gw = gateways[name];
  if (!gw) throw new Error(`Payment gateway '${name}' not implemented`);
  return gw as PaymentGateway;
}

export function isGatewayConfigured(name: GatewayName): boolean {
  switch (name) {
    case "manual": return true; // always available
    case "moyasar": return !!process.env.MOYASAR_SECRET_KEY;
    case "tap": return !!process.env.TAP_SECRET_KEY;
    default: return false;
  }
}

export function getAvailableGateways(): GatewayName[] {
  return (Object.keys(gateways) as GatewayName[]).filter(isGatewayConfigured);
}
