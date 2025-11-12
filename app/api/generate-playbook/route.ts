import { NextResponse } from 'next/server';

type Payload = {
  company_name?: string | null;
  industry?: string | null;
  region?: string | null;
  size?: string | null;
};

export async function POST(req: Request) {
  const body = (await req.json()) as Payload;

  const name   = (body.company_name || 'Your Company').trim();
  const ind    = (body.industry || 'General').trim();
  const region = (body.region || 'Global').trim();
  const size   = (body.size || '1-10').trim();

  // Simple deterministic outline based on inputs
  const outline = {
    meta: {
      generatedAt: new Date().toISOString(),
      company: name,
      industry: ind,
      region,
      size,
      version: 'v0.1',
    },
    narrative: [
      `Position ${name} as a ${ind} solution tailored for buyers in ${region}, highlighting proof that resonates with ${size} orgs.`,
      `Reframe the problem in the buyer's language: shorten time-to-value, reduce risk, and streamline decision friction.`,
    ],
    valueProps: [
      `Core differentiator for ${ind} buyers in ${region}`,
      `Fast onboarding calibrated to ${size} teams`,
      `Clear ROI storyline with 3 measurable outcomes`,
    ],
    discovery: [
      'Current process & pain (time, risk, cost)',
      'Stakeholders & decision path',
      'Timeline & compelling event',
    ],
    objections: [
      '“We can do it in-house” → cost & risk comparison',
      '“Not now” → quantify delay cost & phased pilot',
      '“Security/Compliance” → controls & references',
    ],
    proof: [
      'Mini-case relevant to region',
      'Reference call / pilot success metric',
      'Lightweight ROI calc',
    ],
    outreach: {
      email: [
        'Problem-first opener (2–3 lines)',
        'Credibility line (metric / proof)',
        'CTA with low-friction next step',
      ],
      linkedin: [
        'Connection rationale (1 line)',
        'Comment-on-post → soft CTA',
        'DM follow-up referencing their context',
      ],
      call: [
        'Mutual agenda',
        '3 discovery branches based on answers',
        'Next-step close (pilot / workshop)',
      ],
    },
  };

  return NextResponse.json(outline);
}
