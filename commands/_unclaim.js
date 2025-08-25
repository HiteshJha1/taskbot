/*CMD
  command: /unclaim
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

// ✅ 1. Define allowed user IDs
let allowedUserIds = [5084153092]; // ← Replace with your real Telegram ID(s)

if (!allowedUserIds.includes(user.telegramid)) {
  return Api.sendMessage({
    text: "❌ You are not authorized to use the /unclaim command.",
    reply_to_message_id: request.message_id
  });
}

// ✅ 2. Check that the command is replying to a task post
if (!request.reply_to_message) {
  return Api.sendMessage({
    text: "⚠️ Please reply to the task post you want to remove a claim from.",
    reply_to_message_id: request.message_id
  });
}

// ✅ 3. Use params to extract @username
if (!params || !params.trim().startsWith("@")) {
  return Api.sendMessage({
    text: "⚠️ Usage: /unclaim @username",
    reply_to_message_id: request.message_id
  });
}

let username = params.trim().replace("@", "").toLowerCase();

// ✅ 4. Get task info
let taskMessageId = request.reply_to_message.message_id;
let taskId = `claim_${taskMessageId}`;

// ✅ 5. Load and filter claims
let claims = Bot.getProperty(taskId);
if (!Array.isArray(claims)) claims = [];

let removedClaim = null;
let updatedClaims = claims.filter(claim => {
  if (claim.user.toLowerCase() === username && !removedClaim) {
    removedClaim = claim;
    return false; // Exclude this claim
  }
  return true; // Keep other claims
});

if (!removedClaim) {
  return Api.sendMessage({
    text: `⚠️ No claim found for @${username} on this task.`,
    reply_to_message_id: request.message_id
  });
}

// ✅ 6. Save updated claims (after removing the claim)
Bot.setProperty(taskId, updatedClaims, "json");

// ✅ 7. Mark the user's active claim as completed
if (removedClaim.user_id) {
  removedClaim.status = "completed"; // Update status to completed
  Bot.setProperty({
    name: "active_claim",
    value: removedClaim,
    user_telegramid: removedClaim.user_id
  });
}

// ✅ 8. Load total count for the task
let totalCountCache = Bot.getProperty("totalCountCache") || {};
let totalCount = totalCountCache[taskMessageId];

if (!totalCount) {
  let taskText = request.reply_to_message.text || request.reply_to_message.caption || "";
  let totalCountMatch = taskText.match(/Total Count :-\s*(\d+)/);
  if (totalCountMatch) {
    totalCount = parseInt(totalCountMatch[1]);
    if (!isNaN(totalCount) && totalCount > 0) {
      totalCountCache[taskMessageId] = totalCount;
      Bot.setProperty("totalCountCache", totalCountCache, "json");
    }
  }
}

// ✅ 9. Calculate updated stats
let removedCount = removedClaim.end - removedClaim.start + 1;
let totalClaimed = updatedClaims.reduce((sum, c) => sum + (c.end - c.start + 1), 0);
let availableToClaim = totalCount ? totalCount - totalClaimed : "Unknown";  

// ✅ 10. Notify result
Api.sendMessage({
  text: `✅ Removed claim by @${username} for ${removedCount} comments.\n\n📊 Available to claim now: ${availableToClaim}`,
  reply_to_message_id: request.message_id
});

