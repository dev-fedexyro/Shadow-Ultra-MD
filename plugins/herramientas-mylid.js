let handler = async function (m, { conn, participants, groupMetadata}) {
  const participantList = groupMetadata?.participants || []
  const mentionedJid = m.mentionedJid || []
  const userId = mentionedJid.length> 0
? mentionedJid[0]
: (m.quoted?.sender || m.sender)

  const participant = participantList.find(p => p.id === userId)

  await m.react('🌱')

  if (participant && participant.lid) {
    await conn.sendMessage(
      m.chat,
      {
        text: `🌵 @${userId.split('@')[0]}, tu *LID* es: *${participant.lid}*`,
        mentions: [userId]
},
      { quoted: m}
)
    await m.react('🌵')
} else {
    await conn.sendMessage(
      m.chat,
      { text: '🌱 No se pudo encontrar tu *LID* en este grupo.'},
      { quoted: m}
)
    await m.react('🌱')
}
}

handler.command = ['lid', 'mylid']
handler.help = ['mylid', 'lid']
handler.tags = ['herramientas']
handler.group = true

export default handler
