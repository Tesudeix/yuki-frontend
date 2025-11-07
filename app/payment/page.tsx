"use client";

import { useState } from "react";
import { CheckCircle2, Shield, Sparkles, ArrowRight, Copy } from "lucide-react";

export default function PaymentPage() {
  const PLUS_URL = process.env.NEXT_PUBLIC_PAYMENT_PLUS_URL || process.env.NEXT_PUBLIC_PAYMENT_URL || "";
  const BUSINESS_URL = process.env.NEXT_PUBLIC_PAYMENT_BUSINESS_URL || process.env.NEXT_PUBLIC_PAYMENT_URL || "";

  type Plan = {
    key: "users" | "business";
    name: string;
    price: string;
    period?: string;
  };

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const Feature = ({ text }: { text: string }) => (
    <li className="flex items-start gap-2">
      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
      <span className="text-sm text-neutral-200">{text}</span>
    </li>
  );

  const Card = ({
    badge,
    name,
    price,
    period,
    tagline,
    cta,
    href,
    highlight,
    features,
    onBuy,
  }: {
    badge?: string;
    name: string;
    price: string;
    period?: string;
    tagline: string;
    cta: string;
    href: string;
    highlight?: boolean;
    features: string[];
    onBuy?: () => void;
  }) => (
    <div
      className={
        "relative flex h-full flex-col justify-between rounded-xl border bg-neutral-950 p-6 " +
        (highlight
          ? "border-[#1080CA]/50 shadow-[0_18px_48px_-24px_rgba(16,128,202,0.5)]"
          : "border-neutral-800")
      }
    >
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {highlight ? (
              <Sparkles className="h-5 w-5 text-[#1080CA]" />
            ) : (
              <Shield className="h-5 w-5 text-neutral-400" />
            )}
            <h3 className="text-lg font-semibold text-white">{name}</h3>
          </div>
          {badge && (
            <span
              className={
                "rounded-full px-2 py-0.5 text-xs " +
                (highlight
                  ? "border border-[#1080CA]/40 bg-[#1080CA]/10 text-[#1080CA]"
                  : "border border-neutral-700 bg-neutral-900 text-neutral-300")
              }
            >
              {badge}
            </span>
          )}
        </div>

        <div className="mb-4 flex items-end gap-1">
          <div className="text-3xl font-extrabold text-white">{price}</div>
          {period && <div className="pb-1 text-sm text-neutral-400">/{period}</div>}
        </div>

        <p className="mb-5 text-sm text-neutral-300">{tagline}</p>

        <ul className="mb-6 grid gap-2">
          {features.map((f) => (
            <Feature key={f} text={f} />
          ))}
        </ul>
      </div>

      <div>
        {href ? (
          <a
            href={href}
            className={
              "group inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition " +
              (highlight
                ? "bg-[#1080CA] text-white hover:opacity-90"
                : "border border-neutral-700 bg-neutral-900 text-white hover:border-neutral-600")
            }
          >
            {cta}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </a>
        ) : (
          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:border-neutral-600"
            onClick={onBuy}
            type="button"
          >
            Худалдан авах
          </button>
        )}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Төлбөрийн багц</h1>
          <p className="mt-2 text-sm text-neutral-300">
            Invite код авахын тулд тохирох багцаа сонгон төлбөрөө хийнэ үү.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card
            badge="Current"
            name="Users"
            price="₮25,000"
            period="сар"
            tagline="Хувийн хэрэглээ, AI Community-д нэвтрэх."
            cta="Users авах"
            href={PLUS_URL}
            highlight={false}
            features={[
              "AI Community",
              "Хичээл үзэх",
              "Agent ашиглах эрх",
              "Сүүлийн AI мэдээлэл",
            ]}
            onBuy={() => setSelectedPlan({ key: "users", name: "Users", price: "₮25,000", period: "сар" })}
          />

          <Card
            badge="Recommended"
            name="Business"
            price="₮100,000"
            period="сар"
            tagline="Баг, бизнесийн хэрэглээнд өргөтгөсөн боломжууд."
            cta="Business авах"
            href={BUSINESS_URL}
            highlight
            features={[
              "AI Community + баг",
              "Бүх хичээл, бүх агент",
              "Тэргүүлэх дэмжлэг",
              "Нэгдсэн удирдлага",
            ]}
            onBuy={() => setSelectedPlan({ key: "business", name: "Business", price: "₮100,000", period: "сар" })}
          />
        </div>

        <p className="mt-8 text-center text-xs text-neutral-500">
          Төлбөр амжилттай болсны дараа Invite код танд автоматаар илгээгдэнэ.
        </p>
      </div>

      {selectedPlan && (
        <PaymentOverlay plan={selectedPlan} onClose={() => setSelectedPlan(null)} />)
      }
    </main>
  );
}

function PaymentOverlay({ plan, onClose }: { plan: { key: "users" | "business"; name: string; price: string; period?: string }; onClose: () => void }) {
  const [bankKey, setBankKey] = useState<"khan" | "golomt">("khan");
  const accountHolder = "Baynbileg Dambadarjaa";
  const khan = { name: "Хаан банк", fullAccount: "MN720005005926153085" };
  const golomt = { name: "Голомт банк", fullAccount: "MN150015003005127815" };
  const bank = bankKey === "khan" ? khan.name : golomt.name;
  const accountNo = bankKey === "khan" ? khan.fullAccount : golomt.fullAccount;

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // simple feedback can be added later
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-3">
      <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-950 p-5 text-white">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Худалдан авах — {plan.name}</h2>
        </div>
        <div className="grid gap-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-300">Банк:</span>
            <div className="inline-flex rounded-md border border-neutral-800 p-0.5">
              <button
                type="button"
                className={`rounded-sm px-2 py-1 ${bankKey === "khan" ? "bg-[#1080CA] text-white" : "text-neutral-300"}`}
                onClick={() => setBankKey("khan")}
              >
                Хаан
              </button>
              <button
                type="button"
                className={`rounded-sm px-2 py-1 ${bankKey === "golomt" ? "bg-[#1080CA] text-white" : "text-neutral-300"}`}
                onClick={() => setBankKey("golomt")}
              >
                Голомт
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">
            <div className="min-w-0">
              <div className="text-neutral-300">Данс</div>
              <div className="truncate font-medium text-white">{bank} — {accountNo}</div>
              <div className="text-xs text-neutral-400">Эзэмшигч: {accountHolder}</div>
            </div>
            <button
              onClick={() => copy(accountNo)}
              className="ml-3 inline-flex items-center gap-1 rounded border border-neutral-700 px-2 py-1 text-xs text-neutral-300 hover:border-neutral-600"
            >
              <Copy className="h-3.5 w-3.5" /> Хуулах
            </button>
          </div>

          <div className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-300">
            Та заавал гүйлгээний утга дээр email эсвэл идэвхтэй ашиглаж байгаа social хаяг оруулаарай.
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-500">Дүн: {plan.price}{plan.period ? ` / ${plan.period}` : ""}</div>
            <button
              onClick={onClose}
              className="rounded-md border border-neutral-800 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-900"
            >
              Төлбөр төлсөн
            </button>
          </div>

          <p className="text-center text-[11px] text-neutral-500">
            та төлбөрөө төлөөд email хариу ирэхгүй бол <span className="text-neutral-300">94641031</span> дугаарлуу залгаарай
          </p>
        </div>
      </div>
    </div>
  );
}
