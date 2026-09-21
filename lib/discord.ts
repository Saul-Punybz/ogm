import { Discord } from "arctic";

export function discordConfigured(): boolean {
  return Boolean(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
}

export function discordClient(): Discord {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  return new Discord(
    process.env.DISCORD_CLIENT_ID!,
    process.env.DISCORD_CLIENT_SECRET!,
    `${base}/api/auth/discord/callback`,
  );
}

export interface DiscordUser {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
}

export function avatarUrl(u: DiscordUser): string | null {
  return u.avatar ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=128` : null;
}
