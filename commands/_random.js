/*CMD
  command: /random
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

// Parse command: /random 10 0.15
let parts = message.split(" ");
if (parts.length !== 3) {
  return Api.sendMessage({
    text: "⚠️ Usage: /random [count] [amount_per_user]\nExample: /random 10 0.15",
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

let eligibleUsers = Object.entries(payables)
  .filter(([_, data]) => data.amount > 0);

if (eligibleUsers.length === 0) {
  return Api.sendMessage({
    text: "⚠️ No users with earnings found for random giveaway.",
    reply_to_message_id: request.message_id
  });
}

// Shuffle and pick random users
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

let selected = shuffle(eligibleUsers).slice(0, count);

selected.forEach(([id, data]) => {
  data.amount += amount;
  payables[id] = data;

  // Notify each user
  Api.sendMessage({
    chat_id: id,
    text: `🎁 Surprise! You've been randomly selected to receive a $${amount.toFixed(2)} bonus. Keep participating in tasks and good luck next time too!`
  });
});

Bot.setProperty("payables", payables, "json");

Api.sendMessage({
  text: `✅ Successfully distributed a $${amount.toFixed(2)} bonus to ${selected.length} randomly selected users. All recipients have been notified.`,
  reply_to_message_id: request.message_id
});


