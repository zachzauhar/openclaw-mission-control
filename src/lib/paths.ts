/**
 * Simplified path resolution for Open Claw Mission Control.
 * Points at our custom Open Claw agent's HTTP API instead of
 * the full OpenClaw platform's gateway/CLI.
 */

import { join } from "path";
import { homedir } from "os";

// ── Agent API URL ──────────────────────────────────

const DEFAULT_API_URL = "http://127.0.0.1:3080";

export function getAgentApiUrl(): string {
  return process.env.OPENCLAW_API_URL || DEFAULT_API_URL;
}

// ── Kept for compatibility with components that reference these ──

export function getOpenClawHome(): string {
  return process.env.OPENCLAW_HOME || join(homedir(), ".openclaw");
}

export function getConfigPath(): string {
  return join(getOpenClawHome(), "openclaw.json");
}

export async function readConfigFile(): Promise<Record<string, unknown>> {
  return {};
}

export async function getDefaultWorkspace(): Promise<string> {
  return process.env.OPENCLAW_WORKSPACE || join(homedir(), "workspace");
}

export function getDefaultWorkspaceSync(): string {
  return process.env.OPENCLAW_WORKSPACE || join(homedir(), "workspace");
}

export async function getOpenClawBin(): Promise<string> {
  return "openclaw";
}

export function getOpenClawBinSync(): string {
  return "openclaw";
}

export async function getGogBin(): Promise<string> {
  return "gog";
}

export function getGogKeyringEnv(): Record<string, string> {
  return {};
}

export async function getGatewayUrl(): Promise<string> {
  return getAgentApiUrl();
}

export async function getGatewayPort(): Promise<number> {
  try {
    const url = new URL(getAgentApiUrl());
    return parseInt(url.port, 10) || 3080;
  } catch {
    return 3080;
  }
}

export async function getSystemSkillsDir(): Promise<string> {
  return "/dev/null";
}

export function getGatewayToken(): string {
  return process.env.OPENCLAW_GATEWAY_TOKEN || "";
}
