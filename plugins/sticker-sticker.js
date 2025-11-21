// plugins/sticker.js
import fs from 'fs'
import path from 'path'
import Jimp from 'jimp'
import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let stiker = false
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''

    // Si es imagen o webp o video (video lo procesamos sólo para sticker sin reducir)
    if (/webp|image|video/g.test(mime)) {
      // Vídeo: comprobar duración
      if (/video/g.test(mime) && (q.msg || q).seconds > 15) {
        return conn.reply(m.chat, '🚫 El video no puede durar más de *15 segundos* para sticker.', m)
      }

      let data = await q.download?.()
      if (!data) return conn.reply(m.chat, '📌 Envía una imagen o video para crear un sticker.', m)

      let reducedNoteSent = false

      // Solo intentamos reducir si es imagen (no webp y no video)
      if (/image/.test(mime) || (/webp/.test(mime) && !/video/.test(mime))) {
        try {
          const { buffer: reducedBuffer, reduced } = await tryAutoReduce(data)
          if (reduced) {
            data = reducedBuffer
            reducedNoteSent = true
            // Avisar al usuario (opcional)
            try { await conn.reply(m.chat, '🔄 Tu imagen era muy grande/alta — se redujo automáticamente antes de crear el sticker.', m) } catch (e) {}
          }
        } catch (err) {
          console.warn('No se pudo reducir la imagen:', err)
          // seguimos con la imagen original si falla la reducción
        }
      }

      let out
      try {
        let userId = m.sender
        let packstickers = global.db?.data?.users?.[userId] || {}
        let texto1 = packstickers.text1 || global.packsticker
        let texto2 = packstickers.text2 || global.packsticker2

        // sticker() acepta buffer o url, según tu lib
        stiker = await sticker(data, false, texto1, texto2)
      } finally {
        if (!stiker) {
          if (/webp/g.test(mime)) out = await webp2png(data)
          else if (/image/g.test(mime)) out = await uploadImage(data)
          else if (/video/g.test(mime)) out = await uploadFile(data)
          if (typeof out !== 'string') out = await uploadImage(data)
          stiker = await sticker(false, out, global.packsticker, global.packsticker2)
        }
      }
    } else if (args[0]) {
      if (isUrl(args[0])) {
        stiker = await sticker(false, args[0], global.packsticker, global.packsticker2)
      } else {
        return conn.reply(m.chat, '⚠️ La URL no es válida.', m)
      }
    }
  } catch (e) {
    console.error(e)
    return conn.reply(m.chat, '❌ Ocurrió un error creando el sticker.', m)
  } finally {
    if (stiker) {
      try {
        await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
      } catch (e) {
        // fallback si sendFile falla
        try { await conn.sendMessage(m.chat, { sticker: fs.readFileSync(stiker) }, { quoted: m }) } catch (err) {}
      }
    } else {
      return conn.reply(m.chat, '\`\`\`Envía una imagen o video para convertirlo en sticker (máx 15s en vídeo)\`\`\`', m)
    }
  }
}

handler.help = ['stiker <img>', 'sticker <url>']
handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'stiker']

export default handler

// ----------------------
// Helpers
// ----------------------

// Devuelve { buffer, reduced: boolean }
async function tryAutoReduce(buffer) {
  // Leer imagen con Jimp desde buffer
  const img = await Jimp.read(buffer)
  const width = img.bitmap.width
  const height = img.bitmap.height

  // Regla: si la imagen es "muy alta" respecto a su ancho (ej: tall images)
  // o si supera dimensiones máximas, la reducimos.
  // Puedes afinar estos valores.
  const MAX_DIM = 1000            // tamaño máximo recomendado (px)
  const TALL_RATIO = 1.8         // si height > width * 1.8 se considera "larga"
  const MUST_REDUCE = (height > MAX_DIM || width > MAX_DIM || height > width * TALL_RATIO || width > height * TALL_RATIO)

  if (!MUST_REDUCE) {
    return { buffer, reduced: false }
  }

  // Calcular factor de escala manteniendo aspecto
  const scale = Math.min(MAX_DIM / width, MAX_DIM / height, 1)
  const newW = Math.max(1, Math.round(width * scale))
  const newH = Math.max(1, Math.round(height * scale))

  // Redimensionar con Jimp
  img.resize(newW, newH) // Jimp.AUTO no se usa porque queremos dimensiones específicas
  // Comprimir un poco para mantener tamaño bajo
  const outBuffer = await img.quality(80).getBufferAsync(Jimp.MIME_JPEG)

  console.log(`🔄 autoReduce: ${width}x${height} -> ${newW}x${newH}`)

  return { buffer: outBuffer, reduced: true }
}

function isUrl(text) {
  return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png|webp)/, 'gi'))
                                   }
