/*CMD
  command: /declaim
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

let userId = params;

// Validate userId
if (!userId) {
  Api.sendMessage({
    text: "Usage: /declaim <user_id>"
  });
} else {
  Bot.setProperty({
    name: "active_claim",
    value: null,
    user_telegramid: userId
  });

  Api.sendMessage({
    text: "Successfully declaimed user ID " + userId
  });
}

