/*CMD
  command: /olike
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

var RATE_PER_LIKE = 0.005;
let LOGS_CHANNEL_ID = "-1002508386584";

// Ensure the command is a reply to a channel post
if (
  !request.reply_to_message ||
  !request.reply_to_message.sender_chat ||
  request.reply_to_message.sender_chat.type !== "channel"
) {
  return Api.sendMessage({
    text: "Please reply to a *channel post* using: /olike [number]",
    parse_mode: "Markdown",
    reply_to_message_id: request.message_id
  });
}

// Validate username
if (!user.username) {
  return Api.sendMessage({
    text: "⚠️ You need to set a username to use this bot. Please set a username in your Telegram settings.",
    reply_to_message_id: request.message_id,
    reply_markup: {
      inline_keyboard: [[{ text: "Set Username", url: "tg://settings" }]]
    }
  });
}

// Validate input
if (!params || isNaN(params)) {
  return Api.sendMessage({
    text: "Usage: /olike [number], e.g. /olike 10",
    reply_to_message_id: request.message_id
  });
}

let count = parseInt(params);
if (count <= 0) {
  return Api.sendMessage({
    text: "❌ Number of likes must be more than 0.",
    reply_to_message_id: request.message_id
  });
}

// Unique task key to avoid duplicate registration per user per message
let userTaskKey = `${user.telegramid}_${request.reply_to_message.message_id}`;
let usedTasks = Bot.getProperty("usedTasks") || {};

if (usedTasks[userTaskKey]) {
  return Api.sendMessage({
    text: "❌ You have already registered a task for this post.",
    reply_to_message_id: request.message_id
  });
}

// Validate that the message is an "Only Like" task
let postText = request.reply_to_message.text || "";
if (!postText.includes("0.005 USDT")) {
  return Api.sendMessage({
    text: "⚠️ This task is not a <b>(Only Like)</b> task.",
    reply_to_message_id: request.message_id,
    parse_mode: "HTML"
  });
}

// Extract or cache total count
let totalCountCache = Bot.getProperty("totalCountCache") || {};
let messageId = request.reply_to_message.message_id;
let totalAvailable;

if (totalCountCache[messageId]) {
  // If cached, use it
  totalAvailable = totalCountCache[messageId];
} else {
  // Not cached, extract from message text
  let totalMatch = postText.match(/Total Count :-\s*(\d+)/);

  if (!totalMatch) {
    return Api.sendMessage({
      text: "❌ Couldn't find 'Total Count :-' in the message.",
      reply_to_message_id: request.message_id
    });
  }

  totalAvailable = parseInt(totalMatch[1]);
  // Save in cache
  totalCountCache[messageId] = totalAvailable;
  Bot.setProperty("totalCountCache", totalCountCache, "json");
}

// Check over-registration logic
let taskId = `olike_${messageId}`;
let registeredTasks = Bot.getProperty("registeredTasks") || {};
let registeredCount = registeredTasks[taskId] || 0;

if (registeredCount + count > totalAvailable) {
  return Api.sendMessage({
    text: `⚠️ Only ${totalAvailable - registeredCount} likes left for this task.`,
    reply_to_message_id: request.message_id
  });
}

// Update registered task count
registeredTasks[taskId] = registeredCount + count;
Bot.setProperty("registeredTasks", registeredTasks, "json");

// Update used tasks
usedTasks[userTaskKey] = true;
Bot.setProperty("usedTasks", usedTasks, "json");

// Calculate earnings
let earned = count * RATE_PER_LIKE;

// Track user
let allUsers = Bot.getProperty("allUsers") || [];
if (!allUsers.includes(user.telegramid)) {
  allUsers.push(user.telegramid);
  Bot.setProperty("allUsers", allUsers, "json");
}

// Update payables
let payables = Bot.getProperty("payables") || {};
payables[user.telegramid] = {
  username: user.username || user.first_name,
  amount: (payables[user.telegramid]?.amount || 0) + earned
};
Bot.setProperty("payables", payables, "json");

// Confirm to user
let Name = `<a href="tg://user?id=${user.telegramid}">${user.first_name}</a>`;
let chatId = request.reply_to_message.chat.id.toString();
let chatIdForLink = chatId.replace("-100", ""); // Remove '-100' prefix for private groups
let taskLink = `https://t.me/c/${chatIdForLink}/${messageId}`;

Api.sendMessage({
  text: `<b>✅ ${count} likes have been registered by ${Name}.</b>\n\nTask Link :- <a href="${taskLink}">Link</a>`,
  parse_mode: "HTML",
  reply_to_message_id: request.message_id
});

// Log to admin/logs channel
let displayName = `<a href="tg://user?id=${user.telegramid}">${user.first_name}</a>`;

Api.sendMessage({
  chat_id: LOGS_CHANNEL_ID,
  text: `🆔 <b>User :-</b> ${displayName}\n\n🎯 <b>Task :-</b> Only Like\n\n🔢 <b>Quantity :-</b> ${count}\n\n💰 <b>Earned :-</b> $${earned.toFixed(3)}`,
  parse_mode: "HTML"
});

