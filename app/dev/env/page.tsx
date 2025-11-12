export default function Page() {
  const hasKey = Boolean(process.env.OPENAI_API_KEY);
  const model = process.env.OPENAI_MODEL ?? "(not set)";
  return (
    <div style={{ padding: 16 }}>
      <h1>Env Check</h1>
      <p>OPENAI_API_KEY present: {hasKey ? "YES ✅" : "NO ❌"}</p>
      <p>OPENAI_MODEL: {model}</p>
      <p style={{ color: "#888" }}>
        (We never print the API key—only whether it exists.)
      </p>
    </div>
  );
}
