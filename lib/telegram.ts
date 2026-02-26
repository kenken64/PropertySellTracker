export async function sendTelegramMessage(chatId: string, message: string, botToken: string) {
  if (!chatId || !message || !botToken) {
    throw new Error("Missing Telegram chat ID, message, or bot token")
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Telegram API error (${response.status}): ${details}`)
  }

  return response.json()
}
