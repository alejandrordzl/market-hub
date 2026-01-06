import { parseUserAgent } from "@/utils/parse";
import { User } from "@/utils/types";
import { Bot } from "grammy";
import { User as NextUser } from "next-auth";
import { JWT } from "next-auth/jwt";

export async function sendLoginNotification(userLogged: NextUser, admins: User[]) {
    const token = process.env.BOT_TOKEN;
    const isBotEnabled = process.env.IS_BOT_ENABLED === "true";
    if (!isBotEnabled) {
        console.log("Bot is disabled. Skipping login notification.");
        return;
    }
    if (!token) throw new Error("BOT_TOKEN is unset");
    const bot = new Bot(token);
    try {
        bot.start();
        const promises = admins.map(async (admin) => {
            if (admin.telegramId && admin.telegramId.length > 0) {
                const device = userLogged.userAgent ? parseUserAgent(userLogged.userAgent as string) : undefined;
                console.log(`Sending login notification to ${admin.name} with telegram ID ${admin.telegramId}`);
                const message = `
🟢 <b>Inicio de Sesión</b>

👤 <b>Usuario:</b> <code>${userLogged.name}</code>
👤 <b>Número Empl:</b> <code>${userLogged.id}</code>
🕐 <b>Hora:</b> ${new Date().toLocaleString('es-ES', { timeZone: 'America/Tijuana', hour12: true })}${device ? `
📱 <b>Dispositivo:</b> ${device}` : ''}
                `.trim();
                return bot.api.sendMessage(admin.telegramId, message, { parse_mode: "HTML" });
            }
        });
        await Promise.all(promises);

        bot.stop();
    } catch (e) {
        console.error("Failed to send message:", e);
    }
}

export async function sendLogoutNotification(userLogged: JWT, admins: User[]) {
    const token = process.env.BOT_TOKEN;
    const isBotEnabled = process.env.IS_BOT_ENABLED === 'true';
    if (!isBotEnabled) {
        console.log("Bot is disabled. Skipping logout notification.");
        return;
    }
    if (!token) throw new Error("BOT_TOKEN is unset");
    const bot = new Bot(token);
    try {
        bot.start();
        const promises = admins.map(async (admin) => {
            if (admin.telegramId && admin.telegramId.length > 0) {
                const device = userLogged.userAgent ? parseUserAgent(userLogged.userAgent as string) : undefined;
                console.log(`Sending logout notification to ${admin.name} with telegram ID ${admin.telegramId}`);
                const message = `
🔴 <b>Cierre de Sesión</b>

👤 <b>Usuario:</b> <code>${userLogged.name}</code>
👤 <b>Número Empl:</b> <code>${userLogged.sub}</code>
🕐 <b>Hora:</b> ${new Date().toLocaleString('es-ES', { timeZone: 'America/Tijuana', hour12: true })}${device ? `
📱 <b>Dispositivo:</b> ${device}` : ''}
                `.trim();
                return bot.api.sendMessage(admin.telegramId, message, { parse_mode: "HTML" });
            }
        });
        await Promise.all(promises);
        bot.stop();
    } catch (e) {
        console.error("Failed to send message:", e);
    }
}
