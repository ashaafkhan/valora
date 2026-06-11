/**
 * Valora — Security Shield
 * Detects and filters sensitive email content:
 * bank details, OTPs, passwords, medical, legal info
 */
import type { SensitiveType } from "@/types";

// ── Pattern Definitions ────────────────────────────────────────
const SENSITIVE_PATTERNS: Record<SensitiveType, RegExp[]> = {
  bank: [
    /\b(account\s*number|routing\s*number|bank\s*account|IBAN|SWIFT|sort\s*code)\b/i,
    /\b(debit|credit)\s*card\s*number\b/i,
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // card number pattern
    /\b(net\s*banking|online\s*banking|bank\s*transfer|wire\s*transfer)\b/i,
    /\b(your\s*balance|account\s*balance|transaction\s*alert)\b/i,
  ],
  otp: [
    /\b(OTP|one.time.pass(word|code)|verification\s*code|auth(entication)?\s*code)\b/i,
    /\bOTP\s*is\s*\d{4,8}\b/i,
    /\byour\s*(code|pin)\s*(is|:)\s*\d{4,8}\b/i,
    /\b(do\s*not\s*share|never\s*share)\s*(this\s*)?(code|otp|pin)\b/i,
    /\b2FA\s*(code|token)\b/i,
  ],
  password: [
    /\b(password|passphrase|secret\s*key|api\s*key|access\s*key)\s*(is|:|\=)/i,
    /\b(reset|change|forgot)\s*(your\s*)?password\b/i,
    /\btemporary\s*(password|pin)\b/i,
    /\b(login|sign.in)\s*credentials\b/i,
  ],
  medical: [
    /\b(diagnosis|prescription|medical\s*record|lab\s*result|test\s*result)\b/i,
    /\b(patient\s*(id|record|number))\b/i,
    /\b(doctor|physician|specialist|clinic|hospital)\s*(report|visit|appointment)\b/i,
    /\b(medication|dosage|treatment\s*plan)\b/i,
    /\b(health\s*insurance|insurance\s*claim|medical\s*bill)\b/i,
  ],
  legal: [
    /\b(legal\s*notice|cease\s*and\s*desist|subpoena|lawsuit|litigation)\b/i,
    /\b(non.disclosure|NDA|confidential(ity)?\s*agreement)\b/i,
    /\b(attorney|lawyer|solicitor|counsel)\b/i,
    /\b(court\s*order|warrant|injunction)\b/i,
  ],
  personal: [
    /\b(social\s*security|SSN|passport\s*(number|no))\b/i,
    /\b(date\s*of\s*birth|DOB|national\s*(id|identity))\b/i,
    /\b(home\s*address|residential\s*address)\b/i,
  ],
};

// ── Sensitive Sender Domains ───────────────────────────────────
const SENSITIVE_DOMAINS = [
  "noreply@",
  "alerts@",
  "security@",
  "no-reply@",
  "donotreply@",
  "paypal.com",
  "amazon.com",
  "apple.com",
  "google.com",
  "microsoft.com",
];

// ── Detection Functions ────────────────────────────────────────
export interface SecurityScanResult {
  isSensitive: boolean;
  sensitiveTypes: SensitiveType[];
  confidence: number; // 0-1
}

export function scanEmailContent(params: {
  subject: string;
  body: string;
  fromEmail: string;
}): SecurityScanResult {
  const { subject, body, fromEmail } = params;
  const content = `${subject} ${body}`.toLowerCase();
  const detected: SensitiveType[] = [];

  // Check content patterns
  for (const [type, patterns] of Object.entries(SENSITIVE_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        detected.push(type as SensitiveType);
        break; // Only add type once
      }
    }
  }

  // Check sender domain
  const isSensitiveSender = SENSITIVE_DOMAINS.some((domain) =>
    fromEmail.toLowerCase().includes(domain),
  );

  const isSensitive = detected.length > 0 || isSensitiveSender;
  const confidence =
    detected.length > 0
      ? Math.min(0.95, 0.5 + detected.length * 0.15)
      : isSensitiveSender
        ? 0.4
        : 0;

  return {
    isSensitive,
    sensitiveTypes: detected,
    confidence,
  };
}

// ── Body Redaction ─────────────────────────────────────────────
/**
 * Redact sensitive values for safe display in preview/list view
 */
export function redactSensitiveContent(
  text: string,
  types: SensitiveType[],
): string {
  let redacted = text;

  if (types.includes("otp")) {
    redacted = redacted.replace(/\b\d{4,8}\b/g, "••••••");
  }

  if (types.includes("bank")) {
    // Redact card numbers
    redacted = redacted.replace(
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
      "•••• •••• •••• ••••",
    );
    // Redact account numbers
    redacted = redacted.replace(
      /\b\d{8,20}\b/g,
      "••••••••",
    );
  }

  if (types.includes("personal")) {
    // Redact SSN-like patterns
    redacted = redacted.replace(
      /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
      "•••-••-••••",
    );
  }

  return redacted;
}

// ── Shield Label ───────────────────────────────────────────────
export function getShieldLabel(types: SensitiveType[]): string {
  if (types.includes("bank")) return "Banking";
  if (types.includes("otp")) return "OTP";
  if (types.includes("medical")) return "Medical";
  if (types.includes("legal")) return "Legal";
  if (types.includes("password")) return "Password";
  if (types.includes("personal")) return "Personal";
  return "Sensitive";
}
