/*CMD
  command: /disallow
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

let ADMIN_ID = 5084153092; // Replace with your Telegram ID

if (user.telegramid !== ADMIN_ID) {
  return Api.sendMessage({
    text: "⛔ You are not authorized to use this command.",
    reply_to_message_id: request.message_id
  });
}

let targetId = parseInt(params);
if (!targetId || isNaN(targetId)) {
  return Api.sendMessage({
    text: "⚠️ Usage: /ban [user_id]",
    reply_to_message_id: request.message_id
  });
}

let bannedUsers = Bot.getProperty("bannedUsers") || [];

if (!bannedUsers.includes(targetId)) {
  bannedUsers.push(targetId);
  Bot.setProperty("bannedUsers", bannedUsers, "json");
}

Api.sendMessage({
  text: `✅ User <code>${targetId}</code> has been banned from claiming.`,
  parse_mode: "HTML",
  reply_to_message_id: request.message_id
});
