"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import type { ChatMessage } from "@/lib/ai-chat/types";
import { waterInvoiceScenario } from "@/lib/ai-chat/scenarios";
import { computeSettlement, PHASE1_DELAYS, PHASE2_DELAYS } from "@/lib/ai-chat/engine";
import { getTenantsByProperty, getPropertyById } from "@/lib/mock-data";

interface AIChatContextValue {
  messages: ChatMessage[];
  isTyping: boolean;
  isOpen: boolean;
  matchConfirmed: boolean;
  saved: boolean;
  selectorOpen: boolean;
  matchedPropertyId: string | null;
  openChat: () => void;
  closeChat: () => void;
  triggerDemo: (file?: { name: string; size: string; type: string }) => void;
  confirmMatch: (propertyId: string) => void;
  openSelector: () => void;
  closeSelector: () => void;
  saveAll: (propertyName: string) => void;
}

const AIChatContext = createContext<AIChatContextValue | null>(null);

export function useAIChatContext(): AIChatContextValue {
  const ctx = useContext(AIChatContext);
  if (!ctx) throw new Error("useAIChatContext must be used within AIChatProvider");
  return ctx;
}

let msgCounter = 0;
function newId() {
  return `msg-${Date.now()}-${++msgCounter}`;
}

interface AIChatProviderProps {
  children: ReactNode;
}

export default function AIChatProvider({ children }: AIChatProviderProps) {
  const t = useTranslations("aiChat");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [matchConfirmed, setMatchConfirmed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [matchedPropertyId, setMatchedPropertyId] = useState<string | null>(null);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const demoRunningRef = useRef(false);

  const addMsg = useCallback((msg: Omit<ChatMessage, "id" | "timestamp">) => {
    setMessages((prev) => [
      ...prev,
      { ...msg, id: newId(), timestamp: new Date() },
    ]);
  }, []);

  const openChat = useCallback(() => {
    setIsOpen(true);
    setMessages((prev) => {
      if (prev.length > 0) return prev;
      return [
        {
          id: newId(),
          role: "assistant",
          type: "text",
          content: t("greeting"),
          timestamp: new Date(),
        },
      ];
    });
  }, [t]);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setSelectorOpen(false);
  }, []);

  const triggerDemo = useCallback(
    (file?: { name: string; size: string; type: string }) => {
      if (demoRunningRef.current) return;
      demoRunningRef.current = true;

      // Přidej přílohu souboru jako uživatelskou zprávu
      if (file) {
        addMsg({ role: "user", type: "file_attachment", file });
      }

      const scenario = waterInvoiceScenario;
      const { invoiceData, matchedPropertyId: propId, newSupplierAdvance } = scenario;

      // Najdi prvního nájemníka s advances.water na prop-1
      const tenants = getTenantsByProperty(propId);
      const tenant = tenants.find((ten) => ten.advances?.water) ?? tenants[0];
      const property = getPropertyById(propId);

      setIsTyping(true);

      // Naplánuj kroky fáze 1
      PHASE1_DELAYS.forEach((step) => {
        const tid = setTimeout(() => {
          if (step.type === "text" && step.contentKey) {
            addMsg({
              role: "assistant",
              type: "text",
              content: t(step.contentKey as "analyzing" | "recognizing" | "extracting"),
            });
          } else if (step.type === "invoice_extraction") {
            addMsg({
              role: "assistant",
              type: "invoice_extraction",
              data: invoiceData as unknown as Record<string, unknown>,
            });
          } else if (step.type === "property_match") {
            addMsg({
              role: "assistant",
              type: "property_match",
              data: {
                propertyId: propId,
                propertyName: property?.name ?? propId,
                propertyAddress: invoiceData.address,
              },
            });
            setIsTyping(false);
            setMatchedPropertyId(propId);

            // Ulož data pro fázi 2
            if (tenant) {
              const settlement = computeSettlement(invoiceData, tenant, newSupplierAdvance);
              phase2DataRef.current = {
                settlement,
                property,
                invoiceData,
              };
            }
          }
        }, step.delay);
        timeoutsRef.current.push(tid);
      });
    },
    [addMsg, t]
  );

  // Ref pro data fáze 2 (po potvrzení)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const phase2DataRef = useRef<any>(null);

  const confirmMatch = useCallback(
    (propertyId: string) => {
      if (matchConfirmed) return;
      setMatchConfirmed(true);
      setMatchedPropertyId(propertyId);
      setSelectorOpen(false);

      const scenario = waterInvoiceScenario;
      const { invoiceData, newSupplierAdvance } = scenario;
      const tenants = getTenantsByProperty(propertyId);
      const tenant = tenants.find((ten) => ten.advances?.water) ?? tenants[0];
      const property = getPropertyById(propertyId);

      const settlement =
        phase2DataRef.current?.settlement ??
        (tenant ? computeSettlement(invoiceData, tenant, newSupplierAdvance) : null);

      if (!settlement || !property) return;

      setIsTyping(true);

      // Fáze 2 — TenantSettlement
      const t1 = setTimeout(() => {
        addMsg({
          role: "assistant",
          type: "tenant_settlement",
          data: {
            settlement: settlement as Record<string, unknown>,
            invoiceAddress: invoiceData.address,
          } as Record<string, unknown>,
        });
      }, PHASE2_DELAYS.settlement);

      // Fáze 2 — ActionProposal
      const t2 = setTimeout(() => {
        addMsg({
          role: "assistant",
          type: "action_proposal",
          data: {
            propertyId,
            propertyName: property.name,
            invoice: invoiceData as unknown as Record<string, unknown>,
            settlement: settlement as Record<string, unknown>,
          },
        });
        setIsTyping(false);
      }, PHASE2_DELAYS.proposal);

      timeoutsRef.current.push(t1, t2);
    },
    [matchConfirmed, addMsg]
  );

  const openSelector = useCallback(() => {
    setSelectorOpen(true);
  }, []);

  const closeSelector = useCallback(() => {
    setSelectorOpen(false);
  }, []);

  const saveAll = useCallback(
    (propertyName: string) => {
      setSaved(true);
      setTimeout(() => {
        addMsg({
          role: "assistant",
          type: "text",
          content: t("saved", { property: propertyName }),
        });
      }, 300);
    },
    [addMsg, t]
  );

  const value: AIChatContextValue = {
    messages,
    isTyping,
    isOpen,
    matchConfirmed,
    saved,
    selectorOpen,
    matchedPropertyId,
    openChat,
    closeChat,
    triggerDemo,
    confirmMatch,
    openSelector,
    closeSelector,
    saveAll,
  };

  return (
    <AIChatContext.Provider value={value}>{children}</AIChatContext.Provider>
  );
}
