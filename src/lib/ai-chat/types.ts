export type ChatMessageRole = "user" | "assistant";

export type ChatMessageType =
  | "text"
  | "file_attachment"
  | "invoice_extraction"
  | "property_match"
  | "tenant_settlement"
  | "action_proposal";

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  type: ChatMessageType;
  content?: string;
  data?: Record<string, unknown>;
  file?: { name: string; size: string; type: string };
  timestamp: Date;
}

export interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  isOpen: boolean;
  matchConfirmed: boolean;
  saved: boolean;
}

export interface InvoiceData {
  provider: string;
  invoiceNumber: string;
  recipient: string;
  address: string;
  period: string;
  periodMonths: number;
  items: { name: string; amount: string; price: string }[];
  totalWithVat: string;
  deposits: string;
  toPay: string;
  toPayNumber: number;
  dueDate: string;
  vs: string;
  bankAccount: string;
}

export interface SettlementData {
  tenantName: string;
  monthlyAdvance: number;
  months: number;
  totalAdvances: number;
  actualCost: number;
  difference: number;
  isUnderpaid: boolean;
  suggestedNewAdvance: number;
  newSupplierAdvance: number;
}
