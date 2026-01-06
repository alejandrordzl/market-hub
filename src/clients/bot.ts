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
                console.log(`Sending login notification to ${admin.name} with telegram ID ${admin.telegramId}`);
                return bot.api.sendMessage(admin.telegramId, `${userLogged.name} ha iniciado sesión en el sistema. ✅`);
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
                console.log(`Sending logout notification to ${admin.name} with telegram ID ${admin.telegramId}`);
                return bot.api.sendMessage(admin.telegramId, `${userLogged.name} ha cerrado sesión en el sistema. ❌`);
            }
        });
        await Promise.all(promises);
        bot.stop();
    } catch (e) {
        console.error("Failed to send message:", e);
    }
}
