// lib/prompts/playbookSpec.ts
import { z } from 'zod'

/** =========================================================================================
 *  Input schema (matches your Supabase columns and hub selections)
 *  - Company: company_profile
 *  - Product: products
 *  - ICP:     icps
 * ======================================================================================= */

export const PlaybookInputSchema = z.object({
  // Required minimal identifiers
  company_name: z.string().min(1, 'company_name required'),
  product_name: z.string().min(1, 'product_name required'),

  // Company (company_profile)
  industry: z.string().optional().nullable(),
  hq_region: z.string().optional().nullable(),           // mapped from company_profile.region
  company_size: z.string().optional().nullable(),        // company_profile.size

  // Product (products)
  product_summary: z.string().optional().nullable(),     // description or one_liner
  differentiator: z.string().optional().nullable(),
  pricing_model: z.string().optional().nullable(),
  assets: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  region_scope: z.string().optional().nullable(),
  integrations: z.string().optional().nullable(),
  value_props: z.array(z.string()).optional().default([]),
  proof_points: z.array(z.string()).optional().default([]),

  // ICP (icps)
  icp_name: z.string().optional().nullable(),
  icp_industry: z.string().optional().nullable(),
  icp_company_size: z.string().optional().nullable(),
  buyer_roles: z.array(z.string()).optional().default([]),
  pain_points: z.array(z.string()).optional().default([]),
  ideal_customer: z.string().optional().nullable(),
  use_cases: z.string().optional().nullable(),
  decision_makers: z.string().optional().nullable(),
  influencers: z.string().optional().nullable(),
  triggers: z.string().optional().nullable(),
  deal_breakers: z.string().optional().nullable(),
  target_regions: z.string().optional().nullable(),      // mapped from icps.target_region (singular field; allow comma-sep)
  objections: z.string().optional().nullable(),

  // Style knobs
  tone: z.enum(['Trusted advisor', 'Challenger', 'Friendly expert', 'Formal']).optional().default('Trusted advisor'),
  experience_level: z.enum(['Experienced', 'Unexperienced']).optional().default('Experienced'),

  // Language control (from Hub; "auto" already resolved to "en" upstream)
  output_language: z.enum(['en', 'hu', 'de', 'fr', 'es', 'it']).optional(),

  // Soft bound (not strict) – we’ll tell the model to go over if needed for clarity
  word_limit: z.number().int().positive().max(8000).optional().default(2600),
})
export type PlaybookInput = z.infer<typeof PlaybookInputSchema>

/** =========================================================================================
 *  Model call configuration
 * ======================================================================================= */
export const playbookCallConfig = {
  temperature: 0.3,
  // @ts-ignore - not typed in all SDKs; used by your action
  seed: 7_310_019,
}

/** Internal: map language codes to human labels for the prompt */
function langCodeToHumanLabel(code?: string): string {
  switch (code) {
    case 'en': return 'English'
    case 'hu': return 'Hungarian'
    case 'de': return 'German'
    case 'fr': return 'French'
    case 'es': return 'Spanish'
    case 'it': return 'Italian'
    default:   return 'English'
  }
}
  
/** =========================================================================================
 *  Prompt builder
 *  - Produces { system, user } strings for OpenAI Chat
 * ======================================================================================= */
export function preparePlaybookPrompts(input: PlaybookInput) {
  const {
    company_name,
    product_name,
    product_summary,
    industry,
    hq_region,
    company_size,

    differentiator,
    pricing_model,
    assets,
    category,
    region_scope,
    integrations,
    value_props,
    proof_points,

    icp_name,
    icp_industry,
    icp_company_size,
    buyer_roles,
    pain_points,
    ideal_customer,
    use_cases,
    decision_makers,
    influencers,
    triggers,
    deal_breakers,
    target_regions,
    objections,

    tone,
    experience_level,
    word_limit,

    output_language, // <- may be undefined; upstream resolves "auto" to "en"
  } = PlaybookInputSchema.parse(input)

  const resolvedLanguage = langCodeToHumanLabel(output_language)

  const styleKnobs = [
    `Tone: ${tone}`,
    `Audience experience: ${experience_level}`,
    `Max words (soft): ~${word_limit}`,
  ].join(' | ')

  // Guidance flags based on experience
  const explainFlags =
    experience_level === 'Unexperienced'
      ? `- Avoid unexplained jargon and abbreviations; spell out first use in parentheses.\n- Add short “why this matters” after key tactics.`
      : `- You may use standard sales terminology without lengthy explanation.\n`

  // Region tailoring text
  const regionNotes = [
    hq_region ? `HQ region: ${hq_region}` : null,
    target_regions ? `Target region(s): ${target_regions}` : null,
    region_scope ? `Product region scope: ${region_scope}` : null,
  ]
    .filter(Boolean)
    .join(' | ')

  const system = [
    `You are a senior revenue enablement strategist and sales operator.`,
    `Your job: generate a high-quality, **ready-to-use** sales playbook in Markdown.`,
    `Write clear, confident, grounded content. Prefer short paragraphs + crisp tables over long bullet-only dumps.`,
    `Do **not** invent names, data, logos, or exact pricing if not provided. If something is missing, write "Assumption:" or "Unknown:" explicitly.`,
    `Never include HTML comments (e.g., <!--PAGEBREAK-->). No raw HTML; Markdown only.`,
    `Output must strictly include the demarcation blocks at the end.`,
    ``,
    // ===== Strict language enforcement (overrides any other cues) =====
    `Language rule (strict):`,
    `- Write the entire playbook in ${resolvedLanguage}.`,
    `- Do not include any words, phrases, examples, templates, or snippets in any other language.`,
    `- Do not localize to target-market languages. Keep all outreach templates, email/LinkedIn copy, call scripts, snippets, headings, and labels in ${resolvedLanguage} only.`,
    `- You may still tailor business etiquette, norms, scheduling preferences, procurement steps, and regulatory notes by region — but always write them in ${resolvedLanguage}.`,
    // ==================================================================
    ``,
    `Style controls: ${styleKnobs}`,
    explainFlags,
  ].join('\n')

  const user = [
    `Company context`,
    `- Name: ${company_name}`,
    industry ? `- Industry: ${industry}` : null,
    company_size ? `- Company size: ${company_size}` : null,
    regionNotes ? `- Regions: ${regionNotes}` : null,
    ``,
    `Product context`,
    `- Name: ${product_name}`,
    product_summary ? `- Summary: ${product_summary}` : null,
    differentiator ? `- Differentiator: ${differentiator}` : null,
    pricing_model ? `- Pricing model: ${pricing_model}` : null,
    category ? `- Category: ${category}` : null,
    assets ? `- Assets: ${assets}` : null,
    integrations ? `- Integrations: ${integrations}` : null,
    value_props?.length ? `- Value props: ${value_props.join(' | ')}` : null,
    proof_points?.length ? `- Proof points: ${proof_points.join(' | ')}` : null,
    ``,
    `ICP context`,
    icp_name ? `- ICP name/label: ${icp_name}` : null,
    icp_industry ? `- ICP industry: ${icp_industry}` : null,
    icp_company_size ? `- ICP company size: ${icp_company_size}` : null,
    buyer_roles?.length ? `- Buyer roles: ${buyer_roles.join(' | ')}` : null,
    decision_makers ? `- Decision-makers: ${decision_makers}` : null,
    influencers ? `- Influencers: ${influencers}` : null,
    pain_points?.length ? `- Pain points: ${pain_points.join(' | ')}` : null,
    use_cases ? `- Use cases: ${use_cases}` : null,
    triggers ? `- Triggers: ${triggers}` : null,
    deal_breakers ? `- Deal breakers: ${deal_breakers}` : null,
    target_regions ? `- Target region(s): ${target_regions}` : null,
    objections ? `- Known objections: ${objections}` : null,
    ``,
    `Instructions`,
    `- Use the structure below. Start with a short 2–3 sentence intro for each major section, then concise bullets or a table.`,
    `- Tailor guidance to **target region(s)** and call out differences from **HQ region** when meaningful (etiquette, procurement norms, holidays, regulations) — all written in ${resolvedLanguage}.`,
    `- Make discovery questions and messaging **context-aware** using the product info (value props, differentiator, category) and ICP info.`,
    `- Keep it practical: examples, phrasing snippets, measurable milestones — all in ${resolvedLanguage}.`,
    `- If information is missing, add "Assumption:" lines rather than hallucinating.`,
    `- Prefer readable Markdown tables for matrices (ICP, MEDDICC, mutual action plan, ROI levers, risk mitigations).`,
    `- No HTML, no pagebreak comments.`,
    ``,
    `### Deliverable structure`,
    `1) Executive Summary`,
    `   - Who we help, primary pains, promised outcomes, and 90-day GTM approach.`,
    `2) ICP Profile & Region-Specific Nuances`,
    `   - Table: Attribute | Details (include roles, size, industry, geo norms).`,
    `   - Region notes: explicit differences vs HQ if any.`,
    `3) Messaging & Hooks`,
    `   - Value narrative (product->pain->outcome), ${experience_level === 'Unexperienced' ? 'spelling out acronyms' : 'compact phrasing'}.`,
    `4) Multi-Channel Outreach (first 2 weeks)`,
    `   - Cadence table by day/channel with example snippets tuned for regional norms; keep all templates in ${resolvedLanguage}.`,
    `5) Discovery Guide`,
    `   - 10–14 **sequenced** questions (why/insight), tailored to ICP and product category.`,
    `   - What good/bad signals look like (table).`,
    `6) Qualification & Deal Strategy`,
    `   - Framework (e.g., MEDDICC-lite) table filled for this ICP/product.`,
    `   - Risks & mitigations (especially regional procurement norms).`,
    `7) Proposal Strategy & Value Justification`,
    `   - Packaging/pricing guidance consistent with provided model; if unknown, write "Assumption: packaging TBD".`,
    `   - ROI levers table: Lever | Metric | How to estimate | Region caveats.`,
    `8) Objection Handling`,
    `   - Map **known objections** + likely ones; response prompts grounded in product value props & proof points.`,
    `9) Mutual Action Plan (Lite)`,
    `   - Table: Step | Owner | Artifact | Target date.`,
    `10) Enablement Assets`,
    `   - List concrete assets from "assets" + integrations notes, and what to use them for.`,
    ``,
    `### Output format`,
    `Enclose the Markdown between markers:`,
    `<<<BEGIN_PLAYBOOK_MD>>>`,
    `# {concise title}`,
    `(your Markdown content)`,
    `<<<END_PLAYBOOK_MD>>>`,
    ``,
    `Then a JSON META block (doc filename etc.) between markers:`,
    `<<<META>>>`,
    `{`,
    `  "doc_title": "${company_name} — ${product_name} Sales Playbook",`,
    `  "email_subject": "${product_name}: tailored playbook attached",`,
    `  "email_preheader": "ICP, discovery, objections, KPIs — region-aware",`,
    `  "filename_slug": "${slugify(company_name)}_${slugify(product_name)}_sales-playbook"`,
    `}`,
    `<<<END_META>>>`,
  ]
    .filter(Boolean)
    .join('\n')

  return { system, user }
}

function slugify(s: string) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

