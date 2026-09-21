/**
 * Enlaces del sitio que dependen de cuentas reales (canales, invitacion al
 * Discord, correo). Salen de variables de entorno: si no estan puestas, el sitio
 * dice "por anunciar" en vez de inventar un enlace.
 */
export const site = {
  kick: process.env.OGM_KICK_URL || null,
  twitch: process.env.OGM_TWITCH_URL || null,
  discordInvite: process.env.OGM_DISCORD_INVITE || null,
  contactEmail: process.env.OGM_CONTACT_EMAIL || null,
};
