/*CMD
  command: /payouts
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

let payables = Bot.getProperty("payables") || {};
let allUsers = Bot.getProperty("allUsers") || [];

if (allUsers.length === 0 || Object.keys(payables).length === 0) {
  return Api.sendMessage({
    chat_id: user.telegramid,
    text: "No payables found."
  });
}

let text = "<b>Payables Report :-</b>\n\n";
let totalPayable = 0;
let counter = 1;

for (let i = 0; i < allUsers.length; i++) {
  let id = allUsers[i];
  let userData = payables[id];
  
  if (userData && userData.amount > 0) {
    let username = userData.username || "unknown";
    let amount = parseFloat(userData.amount).toFixed(3);
    text += `${counter}) @${username} - $${amount}\n<code>Cc ${amount} usdt @${username}</code>\n`;
    totalPayable += parseFloat(amount);
    counter++;
  }
}

text += `\n<b>Total Payables:</b> $${totalPayable.toFixed(3)}`;

Api.sendMessage({
  text: text,
  parse_mode: "HTML"
});

