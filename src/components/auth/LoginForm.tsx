"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Mail, Phone } from "lucide-react";
import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  type ConfirmationResult,
  type UserCredential,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { cn } from "@/lib/utils";

const EMAIL_KEY = "nemodash.signInEmail";

type Mode = "phone" | "email";
type Step = "enter" | "code" | "emailSent" | "emailConfirm" | "busy";

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const primaryButton =
  "w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50";

// Firebase chybové kódy → klíče překladů
function errorKey(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  if (code.includes("invalid-phone-number")) return "errors.invalidPhone";
  if (code.includes("invalid-verification-code") || code.includes("code-expired")) return "errors.invalidCode";
  if (code.includes("too-many-requests") || code.includes("quota-exceeded")) return "errors.tooManyRequests";
  if (code.includes("invalid-email")) return "errors.invalidEmail";
  if (code.includes("invalid-action-code") || code.includes("expired-action-code")) return "errors.linkExpired";
  if (code.includes("popup-closed") || code.includes("cancelled-popup")) return "";
  if (code.includes("operation-not-allowed")) return "errors.methodDisabled";
  return "errors.generic";
}

export default function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations("auth");
  const [mode, setMode] = useState<Mode>("phone");
  const [step, setStep] = useState<Step>("enter");
  const [phone, setPhone] = useState("+420 ");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const confirmation = useRef<ConfirmationResult | null>(null);
  const verifier = useRef<RecaptchaVerifier | null>(null);

  // Firebase přihlášení → serverová session → přesměrování podle role
  async function finish(cred: UserCredential) {
    setStep("busy");
    const idToken = await cred.user.getIdToken();
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    await signOut(firebaseAuth()); // dál platí jen serverová cookie
    if (!res.ok) {
      setError(t(res.status === 403 ? "errors.noAccess" : "errors.generic"));
      setStep("enter");
      return;
    }
    const { role } = (await res.json()) as { role: "admin" | "tenant" };
    window.location.assign(`/${locale}/${role === "admin" ? "dashboard" : "portal"}`);
  }

  async function run(action: () => Promise<void>, fallback: Step) {
    setError("");
    try {
      await action();
    } catch (err) {
      const key = errorKey(err);
      if (key) setError(t(key));
      setStep(fallback);
    }
  }

  // Návrat z odkazu v e-mailu
  useEffect(() => {
    const auth = firebaseAuth();
    if (!isSignInWithEmailLink(auth, window.location.href)) return;
    setMode("email");
    const stored = window.localStorage.getItem(EMAIL_KEY);
    if (!stored) {
      setStep("emailConfirm"); // otevřeno na jiném zařízení — e-mail je potřeba zadat znovu
      return;
    }
    run(async () => {
      setStep("busy");
      const cred = await signInWithEmailLink(auth, stored, window.location.href);
      window.localStorage.removeItem(EMAIL_KEY);
      await finish(cred);
    }, "enter");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sendCode(e: React.FormEvent) {
    e.preventDefault();
    run(async () => {
      setStep("busy");
      const auth = firebaseAuth();
      verifier.current ??= new RecaptchaVerifier(auth, "recaptcha", { size: "invisible" });
      confirmation.current = await signInWithPhoneNumber(auth, phone.replace(/\s/g, ""), verifier.current);
      setStep("code");
    }, "enter");
  }

  function confirmCode(e: React.FormEvent) {
    e.preventDefault();
    run(async () => {
      setStep("busy");
      const cred = await confirmation.current!.confirm(code.trim());
      await finish(cred);
    }, "code");
  }

  function sendLink(e: React.FormEvent) {
    e.preventDefault();
    run(async () => {
      setStep("busy");
      await sendSignInLinkToEmail(firebaseAuth(), email.trim(), {
        url: `${window.location.origin}/${locale}/login`,
        handleCodeInApp: true,
      });
      window.localStorage.setItem(EMAIL_KEY, email.trim());
      setStep("emailSent");
    }, "enter");
  }

  function confirmEmail(e: React.FormEvent) {
    e.preventDefault();
    run(async () => {
      setStep("busy");
      const cred = await signInWithEmailLink(firebaseAuth(), email.trim(), window.location.href);
      await finish(cred);
    }, "emailConfirm");
  }

  function google() {
    run(async () => {
      const cred = await signInWithPopup(firebaseAuth(), new GoogleAuthProvider());
      await finish(cred);
    }, "enter");
  }

  const busy = step === "busy";

  return (
    <div className="space-y-4">
      {/* Přepínač způsobu přihlášení */}
      {(step === "enter" || (busy && !confirmation.current)) && (
        <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1 text-sm">
          {(["phone", "email"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(""); }}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded px-2 py-1.5",
                mode === m ? "bg-background font-medium ring-1 ring-border" : "text-muted-foreground"
              )}
            >
              {m === "phone" ? <Phone className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
              {t(`mode.${m}`)}
            </button>
          ))}
        </div>
      )}

      {mode === "phone" && step !== "code" && (
        <form onSubmit={sendCode} className="space-y-3">
          <label className="block space-y-1">
            <span className="text-sm font-medium">{t("phoneLabel")}</span>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
            />
          </label>
          <button type="submit" disabled={busy} className={primaryButton}>
            {busy ? t("sending") : t("sendCode")}
          </button>
        </form>
      )}

      {mode === "phone" && step === "code" && (
        <form onSubmit={confirmCode} className="space-y-3">
          <p className="text-sm text-muted-foreground">{t("codeSent", { phone })}</p>
          <label className="block space-y-1">
            <span className="text-sm font-medium">{t("codeLabel")}</span>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              required
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={cn(inputClass, "tracking-[0.4em] text-center font-mono")}
            />
          </label>
          <button type="submit" className={primaryButton}>{t("confirm")}</button>
          <button
            type="button"
            onClick={() => { setStep("enter"); setCode(""); }}
            className="w-full text-sm text-muted-foreground hover:text-foreground"
          >
            {t("changePhone")}
          </button>
        </form>
      )}

      {mode === "email" && (step === "enter" || step === "emailConfirm" || busy) && (
        <form onSubmit={step === "emailConfirm" ? confirmEmail : sendLink} className="space-y-3">
          {step === "emailConfirm" && <p className="text-sm text-muted-foreground">{t("emailConfirmText")}</p>}
          <label className="block space-y-1">
            <span className="text-sm font-medium">{t("emailLabel")}</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </label>
          <button type="submit" disabled={busy} className={primaryButton}>
            {busy ? t("sending") : step === "emailConfirm" ? t("confirm") : t("sendLink")}
          </button>
        </form>
      )}

      {mode === "email" && step === "emailSent" && (
        <div className="rounded-md border border-border bg-muted/50 p-3 text-sm">
          <p className="font-medium">{t("linkSentTitle")}</p>
          <p className="text-muted-foreground">{t("linkSentText", { email })}</p>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      {step === "enter" && (
        <div className="pt-2 border-t border-border">
          <button
            type="button"
            onClick={google}
            className="w-full rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
          >
            {t("google")}
          </button>
        </div>
      )}

      <div id="recaptcha" />
    </div>
  );
}
