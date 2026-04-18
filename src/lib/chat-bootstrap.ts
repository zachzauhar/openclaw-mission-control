import { getAgentApiUrl, getAgentAuthHeaders } from "@/lib/paths";

export type ChatBootstrapAgent = {
  id: string;
  name: string;
  emoji: string;
  model: string;
  isDefault: boolean;
  workspace: string;
  sessionCount: number;
  lastActive: number | null;
};

export type ChatBootstrapModel = {
  key: string;
  name: string;
};

export type ChatBootstrapProvider = {
  id: string;
  name: string;
};

export type ChatBootstrapResponse = {
  agents: ChatBootstrapAgent[];
  models: ChatBootstrapModel[];
  connectedProviders: ChatBootstrapProvider[];
  warnings?: string[];
  degraded?: boolean;
};

export async function buildChatBootstrap(): Promise<ChatBootstrapResponse> {
  const apiUrl = getAgentApiUrl();

  try {
    const res = await fetch(`${apiUrl}/api/agents`, {
      headers: getAgentAuthHeaders(),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return {
        agents: [],
        models: [],
        connectedProviders: [{ id: "openai-oauth", name: "OpenAI (OAuth)" }],
        warnings: [`Orchestrator returned ${res.status}`],
        degraded: true,
      };
    }

    const data = await res.json();
    const emojis = ["🤖", "🔬", "💻", "📋", "🔧"];
    const agents: ChatBootstrapAgent[] = (data.agents || []).map(
      (a: { id: string; name: string; model: string }, i: number) => ({
        id: a.id,
        name: a.name,
        emoji: emojis[i % emojis.length],
        model: a.model,
        isDefault: i === 0,
        workspace: "~/workspace",
        sessionCount: 0,
        lastActive: null,
      }),
    );

    const models: ChatBootstrapModel[] = [
      { key: "gpt-5.4-mini", name: "GPT-5.4 Mini" },
      { key: "gpt-5.4", name: "GPT-5.4" },
      { key: "gpt-5", name: "GPT-5" },
    ];

    return {
      agents,
      models,
      connectedProviders: [{ id: "openai-oauth", name: "OpenAI (OAuth)" }],
    };
  } catch (err) {
    return {
      agents: [],
      models: [],
      connectedProviders: [],
      warnings: [String(err)],
      degraded: true,
    };
  }
}
