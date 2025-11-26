let handler = async (m, { conn, command, args, text}) => {
  let targetId
  let title = '🌱 Obtener JID y LID'
  let targetLID = null

  if (m.quoted) {
    targetId = m.quoted.sender
} else if (text) {
    const mentionMatch = text.match(/@(\d+)/)
    if (mentionMatch) {
      targetId = mentionMatch[1] + '@s.whatsapp.net'
} else {
      const number = text.replace(/\D/g, '')
      if (number.length > 7) {
        targetId = number + '@s.whatsapp.net'
}
}
}

  if (!targetId) {
    targetId = m.sender
    title = '🌱 Tu JID y LID'
}

  const jidResult = targetId
  const numberClean = jidResult.split('@')[0]

  targetLID = `${numberClean}@lid`

  const fkontak = {
    key: {
      participants: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast',
      fromMe: false,
      id: 'Halo'
},
    message: {
      contactMessage: {
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
}
},
    participant: '0@s.whatsapp.net'
}

  const icons = 'https://files.catbox.moe/p0fk5h.jpg'
  const md = 'https://github.com/dev-fedexyzz'

  const caption = `
👤 *DATOS DEL USUARIO* 🌵
════════════════════
🌱 *Número de WhatsApp:*
\`+${numberClean}\`

🌱 *JID (ID de WhatsApp):*
\`${jidResult}\`

🌱 *LID (ID Vinculado):*
\`${targetLID}\`
════════════════════
`.trim()

  let pp
  try {
    pp = await conn.profilePictureUrl(jidResult, 'image')
} catch {
    pp = icons
}

  await conn.sendMessage(
    m.chat,
    {
      text: caption,
      contextInfo: {
        mentionedJid: [jidResult],
        externalAdReply: {
          title,
          body: `Usuario: ${numberClean}`,
          thumbnailUrl: pp,
          sourceUrl: md,
          mediaType: 1,
          showAdAttribution: false,
          renderLargerThumbnail: false
}
}
},
    { quoted: fkontak}
)
}

handler.tags = ['group']
handler.help = ['lid', 'lidnum', 'lid <@mención|número>']
handler.command = ['lid', 'lidnum']

export default handler
