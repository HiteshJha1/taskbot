/*CMD
  command: /setcount
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

// Define the list of administrator Telegram IDs
let ADMIN_IDS = [5084153092,7502665998,7535352273,7089186137,6363194832,7256755192]; // Replace with actual admin IDs

// Check if the user is an administrator
if (!ADMIN_IDS.includes(user.telegramid)) {
  return Api.sendMessage({
    text: "❌ You are not authorized to use this command.",
    reply_to_message_id: request.message_id
  });
}

// Ensure the command is a reply to a message
if (!request.reply_to_message) {
  return Api.sendMessage({
    text: "⚠️ Please reply to the task message you want to set the total count for.",
    reply_to_message_id: request.message_id
  });
}

// Validate the input parameter
if (!params || isNaN(params)) {
  return Api.sendMessage({
    text: "⚠️ Usage: /setcount [number], e.g., /setcount 50",
    reply_to_message_id: request.message_id
  });
}

let totalCount = parseInt(params);
if (totalCount <= 0) {
  return Api.sendMessage({
    text: "❌ Total count must be a positive number.",
    reply_to_message_id: request.message_id
  });
}

// Retrieve existing cache or initialize a new one
let totalCountCache = Bot.getProperty("totalCountCache") || {};
let messageId = request.reply_to_message.message_id;

// Update the cache with the new total count
totalCountCache[messageId] = totalCount;
Bot.setProperty("totalCountCache", totalCountCache, "json");

// Send confirmation message in the current chat
Api.sendMessage({
  text: `✅ Total count has been set to ${totalCount} for this task.`,
  reply_to_message_id: request.message_id
});

// Notify all administrators
  Api.sendMessage({
    chat_id: 5084153092,
    text: `📢 Total count for message ID ${messageId} has been set to ${totalCount} by @${user.username || user.first_name}.`
  });

