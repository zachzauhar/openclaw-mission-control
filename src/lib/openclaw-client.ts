/**
 * Simplified Open Claw client — HTTP-only transport to our agent API.
 */

import { getAgentApiUrl, getAgentAuthHeaders } from "./paths";

export type TransportMode = "cli" | "http" | "auto";

export interface OpenClawClient {
  resolveTransport(): Promise<TransportMode>;
  runJson<T>(args: string[], timeout?: number): Promise<T>;
  run(args: string[], timeout?: number, stdin?: string): Promise<string>;
  runCapture(
    args: string[],
    timeout?: number,
  ): Promise<{ stdout: string; stderr: string; code: number | null }>;
  gatewayRpc<T>(
    method: string,
    params?: Record<string, unknown>,
    timeout?: number,
  ): Promise<T>;
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  readdir(path: string): Promise<string[]>;
  gatewayFetch(path: string, init?: RequestInit): Promise<Response>;
  getTransport(): TransportMode;
}

class OpenClawHttpClient implements OpenClawClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getAgentApiUrl();
  }

  async resolveTransport(): Promise<TransportMode> {
    return "http";
  }

  getTransport(): TransportMode {
    return "http";
  }

  async runJson<T>(args: string[], timeout = 15000): Promise<T> {
    // Route CLI-style commands through our chat API
    const command = args.join(" ");
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: getAgentAuthHeaders(),
      body: JSON.stringify({ message: command }),
      signal: AbortSignal.timeout(timeout),
    });
    return res.json() as Promise<T>;
  }

  async run(args: string[], timeout = 15000): Promise<string> {
    const result = await this.runJson<{ response: string }>(args, timeout);
    return result.response || "";
  }

  async runCapture(args: string[], timeout = 15000) {
    try {
      const result = await this.run(args, timeout);
      return { stdout: result, stderr: "", code: 0 };
    } catch (e: unknown) {
      return { stdout: "", stderr: String(e), code: 1 };
    }
  }

  async gatewayRpc<T>(
    method: string,
    params?: Record<string, unknown>,
    timeout = 15000,
  ): Promise<T> {
    // Map RPC methods to our API endpoints
    const methodMap: Record<string, string> = {
      "health.check": "/api/health",
      "config.get": "/api/config",
      "config.schema": "/api/config",
    };

    const endpoint = methodMap[method] || "/api/health";
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "GET",
      signal: AbortSignal.timeout(timeout),
    });
    return res.json() as Promise<T>;
  }

  async readFile(path: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: getAgentAuthHeaders(),
      body: JSON.stringify({ message: `read file ${path}` }),
    });
    const data = await res.json();
    return data.response || "";
  }

  async writeFile(path: string, content: string): Promise<void> {
    // Not supported directly — use chat
  }

  async readdir(path: string): Promise<string[]> {
    return [];
  }

  async gatewayFetch(path: string, init?: RequestInit): Promise<Response> {
    return fetch(`${this.baseUrl}${path}`, init);
  }
}

let _client: OpenClawClient | null = null;

export function getTransportMode(): TransportMode {
  return "http";
}

export async function getClient(): Promise<OpenClawClient> {
  if (!_client) {
    _client = new OpenClawHttpClient();
  }
  return _client;
}

export function resetClient(): void {
  _client = null;
}
