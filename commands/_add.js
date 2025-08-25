/*CMD
  command: /add
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

// Check params
if (!params) {
  return Api.sendMessage({
    text: "Usage: /add @username|userID amount\nExample: /add @john 1.5",
    reply_to_message_id: request.message_id
  });
}

let parts = params.split(" ");
if (parts.length !== 2) {
  return Api.sendMessage({
    text: "Invalid format. Use: /add @username|userID amount",
    reply_to_message_id: request.message_id
  });
}

let target = parts[0];
let amount = parseFloat(parts[1]);
if (isNaN(amount) || amount <= 0) {
  return Api.sendMessage({
    text: "Amount must be a number greater than 0.",
    reply_to_message_id: request.message_id
  });
}

// Load payables
let payables = Bot.getProperty("payables") || {};

let userId = null;

// Try finding by username or use ID directly
for (let id in payables) {
  if (
    ("@" + (payables[id].username || "")).toLowerCase() === target.toLowerCase() ||
    id === target
  ) {
    userId = id;
    break;
  }
}

if (!userId) {
  return Api.sendMessage({
    text: "User not found in payables.",
    reply_to_message_id: request.message_id
  });
}

// Add and update
payables[userId].amount = (payables[userId].amount || 0) + amount;
Bot.setProperty("payables", payables, "json");

Api.sendMessage({
  text: `✅ Added *$${amount.toFixed(3)}* to @${payables[userId].username || "unknown"}.\n\n➡️ New Balance: *$${payables[userId].amount.toFixed(3)}*`,
  parse_mode: "Markdown",
  reply_to_message_id: request.message_id
});

