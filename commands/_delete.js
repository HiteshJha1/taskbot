/*CMD
  command: /delete
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

let adminId = 5084153092;
if (user.telegramid !== adminId) {
  return Api.sendMessage({
    text: "❌ You are not authorized to use this command.",
    reply_to_message_id: request.message_id
  });
}

// Clear the payables globally
Bot.setProperty("payables", null);
Bot.setProperty("usedTasks",null);
Bot.setProperty("totalCountCache",null);
Bot.setProperty("allUsers", null);

Api.sendMessage({
  text: "✅ All payables have been cleared and all user balances have been reset to $0.",
  reply_to_message_id: request.message_id
});

