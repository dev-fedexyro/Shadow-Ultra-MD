let handler = async (m, { conn, command }) => {
  if (!m.isGroup) return m.reply('\`\`\` 🌌 Este comando solo puede usarse en grupos.\`\`\`')

  let chatId = m.chat
  let action = command.toLowerCase()

  if (action === 'close') {
    await conn.groupSettingUpdate(chatId, 'announcement')
    await conn.reply(chatId, '\`\`\`🔒 El grupo a sido cerrado. Ahora solo los administradores pueden hablar.\`\`\`', m)
  }

  if (action === 'open') {
    await conn.groupSettingUpdate(chatId, 'not_announcement')
    await conn.reply(chatId, '\`\`\`🔓 El grupo a sido abierto, Ahora todos los miembros pueden hablar.\`\`\`', m)
  }
}

handler.help = ['close', 'open']
handler.tags = ['group']
handler.command = ['close', 'open']
handler.group = true
handler.botAdmin = true

export default handler
