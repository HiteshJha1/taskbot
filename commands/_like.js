/*CMD
  command: /like
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

var RATE_PER_LIKE = 0.006;
let LOGS_CHANNEL_ID = "-1002508386584";

// Unique task key to avoid duplicate registration per user per message
let userTaskKey = `${user.telegramid}_${request.reply_to_message.message_id}`;
let usedTasks = Bot.getProperty("usedTasks") || {};

if (usedTasks[userTaskKey]) {
  return Api.sendMessage({
    text: "❌ You have already registered a task for this post.",
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

// Ensure it's a reply to a channel post
if (
  !request.reply_to_message ||
  !request.reply_to_message.sender_chat ||
  request.reply_to_message.sender_chat.type !== "channel"
) {
  return Api.sendMessage({
    text: "Please reply to a *channel post* using: /like [number]",
    parse_mode: "Markdown",
    reply_to_message_id: request.message_id
  });
}

// Ensure it's a valid Like + Retweet task
if (
  request.reply_to_message.text &&
  !request.reply_to_message.text.includes("Retweet")
) {
  return Api.sendMessage({
    text: "⚠️ This task is not a <b>(Like + Retweet)</b> task.",
    reply_to_message_id: request.message_id,
    parse_mode: "HTML"
  });
}

// Validate input
if (!params || isNaN(params)) {
  return Api.sendMessage({
    text: "Usage: /like [number], e.g. /like 10",
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

// Get total allowed from "Total Count :- X" in the replied message
let totalCountCache = Bot.getProperty("totalCountCache") || {};
let messageId = request.reply_to_message.message_id;
let totalAvailable;

if (totalCountCache[messageId]) {
  // If cached, use it
  totalAvailable = totalCountCache[messageId];
} else {
  // Not cached, extract from message text
  let text = request.reply_to_message.text || "";
  let totalMatch = text.match(/Total Count :-\s*(\d+)/);

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


  // many likes are already registered for this message
let taskId = "like_" + request.reply_to_message.message_id;
let registeredLikes = Bot.getProperty(taskId) || 0;

if (registeredLikes + count > totalAvailable) {
  return Api.sendMessage({
    text: `⚠️ Only ${totalAvailable - registeredLikes} likes left for this task.`,
    reply_to_message_id: request.message_id
  });
}

// Update registered count
Bot.setProperty(taskId, registeredLikes + count, "integer");

// Track the user so they can't register again for this post
usedTasks[userTaskKey] = true;
Bot.setProperty("usedTasks", usedTasks, "json");

let earned = count * RATE_PER_LIKE;

// Track user in global list
let allUsers = Bot.getProperty("allUsers") || [];
if (!allUsers.includes(user.telegramid)) {
  allUsers.push(user.telegramid);
  Bot.setProperty("allUsers", allUsers, "json");
}

// Update payable balance
let payables = Bot.getProperty("payables") || {};
payables[user.telegramid] = {
  username: user.username,
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
  text: `🆔 <b>User :-</b> ${displayName}\n\n🎯 <b>Task :-</b> Like and Retweet\n\n🔢 <b>Quantity :-</b> ${count}\n\n💰 <b>Earned :-</b> $${earned.toFixed(3)}`,
  parse_mode: "HTML"
});

