/*CMD
  command: /allow
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
    text: "⚠️ Usage: /unban [user_id]",
    reply_to_message_id: request.message_id
  });
}

let bannedUsers = Bot.getProperty("bannedUsers") || [];

if (bannedUsers.includes(targetId)) {
  bannedUsers = bannedUsers.filter(id => id !== targetId);
  Bot.setProperty("bannedUsers", bannedUsers, "json");
}

Api.sendMessage({
  text: `✅ User <code>${targetId}</code> has been unbanned.`,
  parse_mode: "HTML",
  reply_to_message_id: request.message_id
});
