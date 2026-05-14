// Workflow name: Employee Network Case Logging
// Code node name: Extract Telegram Message
// Source: n8n export
// Purpose: Extracts Telegram chat, user, and message fields into normalized workflow input.

const msg = $json.message || {};
const chat = msg.chat || {};
const from = msg.from || {};

return {
  json: {
    source: "telegram",
    channel: "employee_bot",
    chat_id: chat.id || "",
    telegram_user_id: from.id || "",
    telegram_username: from.username || "",
    employee_name: [from.first_name, from.last_name].filter(Boolean).join(" "),
    user_message: msg.text || "",
    message_timestamp: msg.date
      ? new Date(msg.date * 1000).toISOString()
      : new Date().toISOString()
  }
};
