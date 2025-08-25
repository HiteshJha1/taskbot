/*CMD
  command: /balance
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

if (chat.chat_type !== "private") {
  return Api.sendMessage({
    text: "❌ This command only works in private chat.",
    reply_to_message_id: request.message_id
  });
}

// Retrieve the global payables object
let payables = Bot.getProperty("payables") || {};

// Get the user's balance from the payables object
let userBalance = payables[user.telegramid] ? payables[user.telegramid].amount : 0;

// Send the user's balance as a reply
Api.sendMessage({
  text: `Your current payable balance is *$${userBalance.toFixed(3)}*`,
  parse_mode: "Markdown",
  reply_to_message_id: request.message_id
});

