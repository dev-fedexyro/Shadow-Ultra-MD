import { webp2png} from '../lib/webp2mp4.js'

let handler = async (m, { conn, usedPrefix, command}) => {
  const notStickerMessage = `🌱 Primero debes responder a un sticker para convertirlo en imagen.`

  const q = m.quoted? m.quoted: m
  const mime = (q.msg || q).mimetype || ''
  if (!/webp/.test(mime)) return m.reply(notStickerMessage)

  try {
    const media = await q.download()
    if (!media) return m.reply('❌ No se pudo descargar el sticker.')

    const out = await webp2png(media)
    if (!out) return m.reply('❌ Error al convertir el sticker a imagen.')

    await conn.sendFile(m.chat, out, 'sticker.png', '', m)
} catch (e) {
    console.error(e)
    m.reply('❌ Ocurrió un error al procesar el sticker.')
}
}

handler.help = ['toimg']
handler.tags = ['sticker']
handler.command = ['toimg', 'img', 'jpg']

export default handler
