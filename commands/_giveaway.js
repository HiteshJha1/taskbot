/*CMD
  command: /giveaway
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

let ADMIN_ID = 5084153092;

if (user.telegramid !== ADMIN_ID) {
  return Api.sendMessage({
    text: "⛔ Only the admin can use this command.",
    reply_to_message_id: request.message_id
  });
}

// Parse command: /giveaway 20 0.15
let parts = message.split(" ");
if (parts.length !== 3) {
  return Api.sendMessage({
    text: "⚠️ Usage: /giveaway [count] [amount_per_user]\nExample: /giveaway 20 0.15",
    reply_to_message_id: request.message_id
  });
}

let count = parseInt(parts[1]);
let amount = parseFloat(parts[2]);

if (isNaN(count) || isNaN(amount) || count <= 0 || amount <= 0) {
  return Api.sendMessage({
    text: "❗ Invalid numbers. Please enter positive numeric values.",
    reply_to_message_id: request.message_id
  });
}

// Fetch payables
let payables = Bot.getProperty("payables") || {};

let leaderboard = Object.entries(payables)
  .filter(([_, data]) => data.amount > 0)
  .sort((a, b) => b[1].amount - a[1].amount)
  .slice(0, count);

if (leaderboard.length === 0) {
  return Api.sendMessage({
    text: "⚠️ No users found to reward.",
    reply_to_message_id: request.message_id
  });
}

leaderboard.forEach(([id, data], index) => {
  data.amount += amount;
  payables[id] = data;

  // Notify each user with Api.sendMessage
  Api.sendMessage({
    chat_id: id,
    text: `🎉 Congratulations! You are among the top ${count} earners and have received a bonus of $${amount.toFixed(2)}. Keep participating in tasks and good luck next time too!!`
  });
});

Bot.setProperty("payables", payables, "json");

Api.sendMessage({
  text: `✅ A bonus of $${amount.toFixed(2)} has been successfully awarded to the top ${leaderboard.length} earners. All recipients have been notified.`,
  reply_to_message_id: request.message_id
});

