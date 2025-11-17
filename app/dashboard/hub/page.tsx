// app/dashboard/hub/page.tsx
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import HubClient from "./HubClient";
import { createRunFromHub } from "@/app/actions/hubActions";

type Item = { id: string; title: string; sub?: string };

function toSubline(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" • ");
}

// Always read session cookies at request time
export const dynamic = "force-dynamic";

export default async function HubPage() {
  // NEXT 15: cookies() must be awaited
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        // set/delete are kept to allow token refresh. They’re no-ops if not needed.
        set: (name: string, value: string, options: any) => {
          cookieStore.set({ name, value, ...options });
        },
        remove: (name: string, options: any) => {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const uid = user?.id;
  if (!uid) {
    return (
      <div className="container-px mx-auto max-w-[1280px] py-8">
        <div
          className="
            elev-1 isolate border border-[--border]
            rounded-2xl overflow-hidden
            bg-[linear-gradient(180deg,#283c63_0%,#22324a_100%)] mb-6
          "
          role="region"
          aria-label="Sales Playbook Hub"
        >
          <div className="px-4 py-4 sm:px-5 sm:py-5">
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
              Sales Playbook Hub
            </h1>
            <p className="mt-1 text-sm text-[--muted-foreground]">
              This is where you generate tailored sales playbooks for your own
              business and offers.
            </p>
            <ol className="mt-3 space-y-1 text-xs sm:text-sm text-[--muted-foreground]">
              <li>
                <span className="font-semibold">1.</span>{" "}
                Create a <strong>Company</strong> for your own organisation.
              </li>
              <li>
                <span className="font-semibold">2.</span>{" "}
                Create a <strong>Product</strong> that you want to sell.
              </li>
              <li>
                <span className="font-semibold">3.</span>{" "}
                Create a <strong>Potential Customer Profile</strong> (your ICP /
                typical buyer).
              </li>
              <li>
                <span className="font-semibold">4.</span>{" "}
                Select any combination of these, choose your options on the
                right, and click <strong>Generate playbook</strong>.
              </li>
            </ol>
          </div>
        </div>

        <HubClient
          companies={[]}
          products={[]}
          icps={[]}
          links={{
            companies: {
              edit: "/companies/inventory",
              add: "/companies/inventory#new",
            },
            products: {
              edit: "/products/inventory",
              add: "/products/inventory#new",
            },
            icps: { edit: "/icps/inventory", add: "/icps/inventory#new" },
          }}
          formAction={createRunFromHub.bind(null)}
        />
      </div>
    );
  }

  // COMPANY: owned by user_id
  const { data: companiesRaw } = await supabase
    .from("company_profile")
    .select("id, company_name, industry, region, size, created_at")
    .eq("user_id", uid)
    .order("created_at", { ascending: false });

  // PRODUCTS: owned by created_by
  const { data: productsRaw } = await supabase
    .from("products")
    .select("id, name, category, description, updated_at, created_by")
    .eq("created_by", uid)
    .order("updated_at", { ascending: false });

  // ICPS: owned by created_by
  const { data: icpsRaw } = await supabase
    .from("icps")
    .select(
      "id, name, industry, company_size, target_region, updated_at, created_by"
    )
    .eq("created_by", uid)
    .order("updated_at", { ascending: false });

  const companies: Item[] =
    companiesRaw?.map((c) => ({
      id: String(c.id),
      title: c.company_name ?? "(Untitled company)",
      sub: toSubline([c.industry, c.region, c.size]),
    })) ?? [];

  const products: Item[] =
    productsRaw?.map((p) => ({
      id: String(p.id),
      title: p.name ?? "(Untitled product)",
      sub: p.category?.trim() ? p.category : p.description?.trim() || "",
    })) ?? [];

  const icps: Item[] =
    icpsRaw?.map((i) => ({
      id: String(i.id),
      title: i.name ?? "(Untitled ICP)",
      sub: toSubline([i.industry, i.company_size, i.target_region]),
    })) ?? [];

  return (
    <div className="container-px mx-auto max-w-[1280px] py-8">
      <div
        className="
          elev-1 isolate border border-[--border]
          rounded-2xl overflow-hidden
          bg-[linear-gradient(180deg,#283c63_0%,#22324a_100%)] mb-6
        "
        role="region"
        aria-label="Sales Playbook Hub"
      >
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
            Sales Playbook Hub
          </h1>
          <p className="mt-1 text-sm text-[--muted-foreground]">
            This is where you generate tailored sales playbooks for your own
            business and offers.
          </p>
          <ol className="mt-3 space-y-1 text-xs sm:text-sm text-[--muted-foreground]">
            <li>
              <span className="font-semibold">1.</span>{" "}
              Create a <strong>Company</strong> for your own organisation.
            </li>
            <li>
              <span className="font-semibold">2.</span>{" "}
              Create a <strong>Product</strong> that you want to sell.
            </li>
            <li>
              <span className="font-semibold">3.</span>{" "}
              Create a <strong>Potential Customer Profile</strong> (your ICP /
              typical buyer).
            </li>
            <li>
              <span className="font-semibold">4.</span>{" "}
              Select any combination of these, choose your options on the
              right, and click <strong>Generate playbook</strong>.
            </li>
          </ol>
        </div>
      </div>

      <HubClient
        companies={companies}
        products={products}
        icps={icps}
        links={{
          companies: {
            edit: "/companies/inventory",
            add: "/companies/inventory#new",
          },
          products: {
            edit: "/products/inventory",
            add: "/products/inventory#new",
          },
          icps: { edit: "/icps/inventory", add: "/icps/inventory#new" },
        }}
        formAction={createRunFromHub.bind(null)}
      />
    </div>
  );
}

