import TelegramBot = require('node-telegram-bot-api');
import { getUserByTelegramToken, saveTelegramChatId } from '../db/queries/users';

// Singleton bot instance
let bot: TelegramBot | null = null;

export function initTelegramBot(): TelegramBot | null {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn('[TelegramBot] TELEGRAM_BOT_TOKEN not set — bot disabled.');
    return null;
  }
  if (bot) return bot;

  bot = new TelegramBot(token, { polling: true });

  // /start command — links Telegram account to user
  // Users get a unique link token via the settings page: https://t.me/YourBot?start=<linkToken>
  bot.onText(/\/start(?:\s+(\S+))?/, async (msg, match) => {
    const chatId = msg.chat.id.toString();
    const linkToken = match?.[1];

    if (!linkToken) {
      await bot!.sendMessage(chatId,
        '👋 Welcome to Competitor Tracker!\n\nTo link your account, go to Settings in the app and click "Link Telegram". You\'ll get a unique link to click.'
      );
      return;
    }

    try {
      const user = await getUserByTelegramToken(linkToken);
      if (!user) {
        await bot!.sendMessage(chatId, '❌ Invalid or expired link token. Please generate a new one from Settings.');
        return;
      }
      await saveTelegramChatId(user.id, chatId);
      await bot!.sendMessage(chatId,
        `✅ Account linked! You\'re now connected as ${user.email}.\n\nYou\'ll receive real-time alerts here when:\n• A competitor changes their price\n• A tracked URL breaks`
      );
    } catch (err) {
      console.error('[TelegramBot] Error linking account:', err);
      await bot!.sendMessage(chatId, '❌ Something went wrong. Please try again.');
    }
  });

  // /status command
  bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id.toString();
    await bot!.sendMessage(chatId, '✅ Competitor Tracker bot is running. You are receiving alerts for your tracked products.');
  });

  // /stop command — unlinks Telegram
  bot.onText(/\/stop/, async (msg) => {
    const chatId = msg.chat.id.toString();
    await bot!.sendMessage(chatId, 'To unlink Telegram from your account, go to Settings in the app and toggle off Telegram Alerts.');
  });

  bot.on('polling_error', (err) => {
    console.error('[TelegramBot] Polling error:', err.message);
  });

  console.log('[TelegramBot] Bot started and polling.');
  return bot;
}

export function getBotInstance(): TelegramBot | null {
  return bot;
}
