// app/dashboard/hub/HubClient.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type BasicItem = { id: string; title: string; sub?: string };
type Links = {
  companies: { edit: string; add: string };
  products: { edit: string; add: string };
  icps: { edit: string; add: string };
};

type Props = {
  companies: BasicItem[];
  products: BasicItem[];
  icps: BasicItem[];
  links?: Links;
  formAction?: (formData: FormData) => Promise<void> | void;
  initialSelections?: {
    companyId?: string;
    productId?: string;
    icpId?: string;
    tone?: string;
    experience?: string;
    motion?: string;
  };
};

const TONES_UI = ["Professional", "Consultative", "Challenger", "Storytelling"] as const;
const EXPERIENCE_UI = ["Experienced", "Unexperienced"] as const;
const MOTIONS_UI = ["Inbound", "Outbound", "Partner-led", "Account expansion"] as const;

const LANG_OPTIONS = [
  { code: "auto", label: "Auto" },
  { code: "en", label: "English" },
  { code: "hu", label: "Hungarian" },
  { code: "de", label: "German" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "it", label: "Italian" },
] as const;

function toneToken(
  ui: (typeof TONES_UI)[number]
): "trusted_advisor" | "challenger" | "friendly_expert" | "formal" | "default" {
  switch (ui) {
    case "Professional":
      return "formal";
    case "Consultative":
      return "trusted_advisor";
    case "Challenger":
      return "challenger";
    case "Storytelling":
      return "friendly_expert";
    default:
      return "default";
  }
}

function experienceValue(ui: (typeof EXPERIENCE_UI)[number]): "default" | "unexperienced" {
  return ui === "Experienced" ? "default" : "unexperienced";
}

// compact brand button
const microBtn =
  "inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-[12.5px] " +
  "bg-[#1f2d48] text-[#dbc078] border border-white/10 shadow-[--shadow-0] " +
  "hover:translate-y-[-1px] hover:shadow-[--shadow-1] transition";

export default function HubClient({
  companies,
  products,
  icps,
  links,
  formAction,
  initialSelections,
}: Props) {
  const router = useRouter();

  const [companyId, setCompanyId] = React.useState(initialSelections?.companyId ?? "");
  const [productId, setProductId] = React.useState(initialSelections?.productId ?? "");
  const [icpId, setIcpId] = React.useState(initialSelections?.icpId ?? "");

  const [toneUI, setToneUI] = React.useState<(typeof TONES_UI)[number]>(
    (initialSelections?.tone as any) ?? TONES_UI[0]
  );
  const [experienceUI, setExperienceUI] = React.useState<(typeof EXPERIENCE_UI)[number]>(
    (initialSelections?.experience as any) ?? EXPERIENCE_UI[0]
  );
  const [motionUI, setMotionUI] = React.useState<(typeof MOTIONS_UI)[number]>(
    (initialSelections?.motion as any) ?? MOTIONS_UI[0]
  );

  // New: Output language (UI-facing) — default Auto
  const [outputLang, setOutputLang] = React.useState<(typeof LANG_OPTIONS)[number]["code"]>("auto");

  const [isGenerating, setIsGenerating] = React.useState(false);

  const canGenerate =
    !!companyId && !!productId && !!icpId && !!toneUI && !!experienceUI && !!motionUI;

  const go = (href?: string) => href && router.push(href);

  // Open new modals (no autosave)
  function onAddNewCompany() {
    router.push("/dashboard/(..)companies/new");
  }
  function onAddNewProduct() {
    router.push("/dashboard/(..)products/new");
  }
  function onAddNewIcp() {
    router.push("/dashboard/(..)icps/new");
  }

  function selectableCard(
    list: BasicItem[],
    selectedId: string,
    onSelect: (id: string) => void,
    onOpen: (id: string) => void
  ) {
    const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <div
        className="rounded-2xl glass bg-[color:var(--color-bg)/.45] p-3"
        style={{ borderWidth: "0.5px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.14)" }}
      >
        {children}
      </div>
    );

    if (!list?.length) {
      return (
        <Wrapper>
          <div className="text-[--color-ink-3] text-sm p-1">No items yet.</div>
        </Wrapper>
      );
    }

    return (
      <Wrapper>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {list.map((it) => {
            const selected = it.id === selectedId;
            return (
              <div
                key={it.id}
                className="group rounded-2xl border glass bg-[color:var(--surface)/.6] px-4 py-3"
                style={{ borderWidth: "0.5px", borderColor: "rgba(255,255,255,0.18)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-[--color-ink] text-[0.95rem] leading-6 whitespace-normal break-words group-hover:text-[--color-ink]">
                      {it.title}
                    </div>
                    {it.sub ? (
                      <div className="mt-1 text-sm text-[--color-ink-3] whitespace-normal break-words">
                        {it.sub}
                      </div>
                    ) : null}
                  </div>

                  {selected ? (
                    <span className="chip text-[11px] bg-[color:var(--color-primary)] text-[#0b1220] border-transparent">
                      Selected
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    className={microBtn}
                    onClick={() => onSelect(it.id)}
                    aria-pressed={selected}
                  >
                    {selected ? "Selected" : "Select"}
                  </button>
                  <button
                    type="button"
                    className={microBtn}
                    onClick={() => onOpen(it.id)}
                    aria-label={`Open ${it.title}`}
                  >
                    Open
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Wrapper>
    );
  }

  return (
    <div className="mx-auto max-w-[var(--content-max)] container-px py-6 space-y-6">
      {/* Columns */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Company */}
        <section className="space-y-3 lg:col-span-1">
          <div className="text-center font-semibold tracking-wide text-[1rem] text-[color:var(--color-primary)]">
            Company
          </div>

          {selectableCard(
            companies,
            companyId,
            setCompanyId,
            (id) => go(`/dashboard/(..)companies/${id}`)
          )}

          <div className="pt-2 flex justify-end">
            <button type="button" onClick={onAddNewCompany} className={microBtn}>
              Add new company
            </button>
          </div>
        </section>

        {/* Product */}
        <section className="space-y-3 lg:col-span-1">
          <div className="text-center font-semibold tracking-wide text-[1rem] text-[color:var(--color-primary)]">
            Product
          </div>

          {selectableCard(
            products,
            productId,
            setProductId,
            (id) => go(`/dashboard/(..)products/${id}`)
          )}

          <div className="pt-2 flex justify-end">
            <button type="button" onClick={onAddNewProduct} className={microBtn}>
              Add new product
            </button>
          </div>
        </section>

        {/* ICP */}
        <section className="space-y-3 lg:col-span-1">
          <div className="text-center font-semibold tracking-wide text-[1rem] text-[color:var(--color-primary)]">
            Potential Customer Profile
          </div>

          {selectableCard(icps, icpId, setIcpId, (id) => go(`/dashboard/(..)icps/${id}`))}

          <div className="pt-2 flex justify-end">
            <button type="button" onClick={onAddNewIcp} className={microBtn}>
              Add new Potential Customer
            </button>
          </div>
        </section>

        {/* Right panel — Playbook Options */}
        <section className="space-y-4 lg:col-span-1">
          <div className="card rounded-2xl glass elev-0" style={{ borderWidth: "0.5px" }}>
            <div className="card-header rounded-t-2xl">
              <div className="text-center font-semibold tracking-wide text-[1rem] text-[color:var(--color-primary)]">
                Playbook Options
              </div>
            </div>

            <form action={formAction} onSubmit={() => setIsGenerating(true)} aria-busy={isGenerating}>
              <input type="hidden" name="companyId" value={companyId} />
              <input type="hidden" name="productId" value={productId} />
              <input type="hidden" name="icpId" value={icpId} />
              <input type="hidden" name="tone" value={toneToken(toneUI)} />
              <input type="hidden" name="experience" value={experienceValue(experienceUI)} />
              <input type="hidden" name="salesMotion" value={motionUI} />

              <div className="card-body space-y-4">
                {/* New: Output language */}
                <div>
                  <label className="field-label" htmlFor="outputLanguage">
                    Output language
                  </label>
                  <select
                    id="outputLanguage"
                    name="outputLanguage"
                    className="select rounded-2xl border-white/20 text-sm"
                    value={outputLang}
                    onChange={(e) => setOutputLang(e.target.value as (typeof LANG_OPTIONS)[number]["code"])}
                    disabled={isGenerating}
                    aria-describedby="outputLanguageHelp"
                  >
                    {LANG_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p id="outputLanguageHelp" className="sr-only">
                    Choose the language for the entire generated playbook
                  </p>
                </div>

                <div>
                  <label className="field-label">Tone</label>
                  <select
                    className="select rounded-2xl border-white/20 text-sm"
                    value={toneUI}
                    onChange={(e) => setToneUI(e.target.value as (typeof TONES_UI)[number])}
                    disabled={isGenerating}
                  >
                    {TONES_UI.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Experience level</label>
                  <select
                    className="select rounded-2xl border-white/20 text-sm"
                    value={experienceUI}
                    onChange={(e) => setExperienceUI(e.target.value as (typeof EXPERIENCE_UI)[number])}
                    disabled={isGenerating}
                  >
                    {EXPERIENCE_UI.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Sales motion</label>
                  <select
                    className="select rounded-2xl border-white/20 text-sm"
                    value={motionUI}
                    onChange={(e) => setMotionUI(e.target.value as (typeof MOTIONS_UI)[number])}
                    disabled={isGenerating}
                  >
                    {MOTIONS_UI.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="card-footer rounded-b-2xl">
                <button
                  type="submit"
                  className="btn btn-primary w-full rounded-2xl hover:elev-1 hover:-translate-y-[1px] active:translate-y-[0.5px] transition"
                  disabled={!canGenerate || isGenerating}
                  aria-disabled={!canGenerate || isGenerating}
                >
                  {isGenerating ? "Generating…" : "Generate playbook"}
                </button>
              </div>
            </form>
          </div>

          {isGenerating ? (
            <div
              className="card rounded-2xl glass elev-0"
              style={{ borderWidth: "0.5px" }}
              aria-live="polite"
            >
              <div className="card-header rounded-t-2xl">
                <div className="font-medium">Working…</div>
              </div>

              <div className="card-body space-y-3">
                <div className="indeterminate-bar" />
                <div className="text-sm text-[--color-ink-3]">
                  Generating your playbook… this may take a minute.
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      {/* Local CSS for the indeterminate bar */}
      <style jsx>{`
        .indeterminate-bar {
          height: 8px;
          width: 100%;
          border-radius: 9999px;
          overflow: hidden;
          position: relative;
          background: rgba(255, 255, 255, 0.12);
        }
        .indeterminate-bar::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.25) 25%,
            rgba(255, 255, 255, 0.6) 50%,
            rgba(255, 255, 255, 0.25) 75%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: bdIndeterminate 1.1s linear infinite;
          border-radius: inherit;
        }
        @keyframes bdIndeterminate {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}

