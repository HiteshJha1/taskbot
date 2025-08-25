/*CMD
  command: /remove
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

// Only admin can use
if (user.telegramid !== adminId) {
  return Api.sendMessage({
    text: "❌ You are not authorized to use this command.",
    reply_to_message_id: request.message_id
  });
}

// Must reply to a post
if (!request.reply_to_message) {
  return Api.sendMessage({
    text: "❗Please reply to the task post you want to modify.",
    reply_to_message_id: request.message_id
  });
}

// Validate params
if (!params) {
  return Api.sendMessage({
    text: "Usage:\n/remove [number] (auto detect)\n/remove [tasktype] [number] (manual)\n\nExample:\n- /remove 5\n- /remove l 10\n- /remove c 8",
    reply_to_message_id: request.message_id
  });
}

let args = params.split(" ");
let taskType = null;
let removeCount = 0;

if (args.length === 1) {
  // Only number given, auto-detect task type
  removeCount = parseInt(args[0]);
  
  if (isNaN(removeCount) || removeCount <= 0) {
    return Api.sendMessage({
      text: "❌ Please provide a valid number greater than 0.",
      reply_to_message_id: request.message_id
    });
  }
  
  // Try detecting task type from post text
  let text = request.reply_to_message.text || "";
  
  if (text.includes("Retweet")) {
    taskType = "like";
  } else if (text.includes("0.005 USDT")) {
    taskType = "olike";
  } else if (text.includes("0.008 USDT")) {
    taskType = "comment";
  } else if (text.includes("Follower")) {
    taskType = "follow";
  }
  
  if (!taskType) {
    return Api.sendMessage({
      text: "❗Cannot detect task type from the post text. Please specify manually.\n\nExample: /remove o 5",
      reply_to_message_id: request.message_id
    });
  }
  
} else if (args.length === 2) {
  // Manual task type + number
  let typeInput = args[0].toLowerCase();
  removeCount = parseInt(args[1]);
  
  if (isNaN(removeCount) || removeCount <= 0) {
    return Api.sendMessage({
      text: "❌ Please provide a valid number greater than 0.",
      reply_to_message_id: request.message_id
    });
  }
  
  if (typeInput === "l") {
    taskType = "like"; // Like + Retweet
  } else if (typeInput === "c") {
    taskType = "comment";
  } else if (typeInput === "f") {
    taskType = "follow";
  } else if (typeInput === "o") {
    taskType = "olike"; // Only Like
  } else {
    return Api.sendMessage({
      text: "❌ Invalid task type.\nUse: l = like+retweet, c = comment, f = follow, o = only like",
      reply_to_message_id: request.message_id
    });
  }
  
} else {
  return Api.sendMessage({
    text: "❌ Incorrect format.\nExample:\n- /remove 5\n- /remove l 10",
    reply_to_message_id: request.message_id
  });
}

// Build task key
let taskId = `${taskType}_${request.reply_to_message.message_id}`;

// Get current registered
let registered = Bot.getProperty(taskId) || 0;

// Validate
if (registered < removeCount) {
  return Api.sendMessage({
    text: `❗Only ${registered} registered. Cannot remove ${removeCount}.`,
    reply_to_message_id: request.message_id
  });
}

// Subtract and update
let newRegistered = registered - removeCount;
Bot.setProperty(taskId, newRegistered, "integer");

// Done
Api.sendMessage({
  text: `✅ Successfully removed ${removeCount} from ${taskType.toUpperCase()} task.\n<b>Now registered:</b> ${newRegistered}`,
  parse_mode: "HTML",
  reply_to_message_id: request.message_id
});

