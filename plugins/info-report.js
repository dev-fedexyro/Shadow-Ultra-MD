let handler = async (m, { conn, text}) => {
  const emoji = '🌱'
  const emoji2 = '🌵'

  if (!text) {
    return conn.reply(m.chat, `${emoji} Por favor, ingrese el error que desea reportar.`, m)
}

  if (text.length < 10) {
    return conn.reply(m.chat, `${emoji} Especifique bien el error, mínimo 10 caracteres.`, m)
}

  if (text.length> 1000) {
    return conn.reply(m.chat, `${emoji2} *Máximo 1000 caracteres para enviar el error.*`, m)
}

  const teks = `*✖️ \`R E P O R T E\` ✖️*

☁️ Número:
• wa.me/${m.sender.split('@')[0]}

👤 Usuario:
• ${m.pushName || 'Anónimo'}

💬 Mensaje:
• ${text}`

  for (let mod of global.mods || []) {
    await conn.reply(
      mod + '@s.whatsapp.net',
      m.quoted? teks + '\n\n📎 Cita:\n' + m.quoted.text: teks,
      m,
      { mentions: conn.parseMention(teks)}
)
}

  m.reply(`${emoji} El reporte fue enviado a mi creador. Cualquier informe falso puede ocasionar sanciones.`)
}

handler.help = ['reporte', 'report', 'reportar', 'bug', 'error']
handler.tags = ['info']
handler.command = ['reporte', 'report', 'reportar', 'bug', 'error']

export default handler
