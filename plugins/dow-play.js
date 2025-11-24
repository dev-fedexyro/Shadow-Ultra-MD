import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix, command}) => {
  try {
    if (!text.trim()) return conn.reply(m.chat, `🎵 Por favor, ingresa el nombre de la música que deseas descargar.`, m)
    await m.react('⏳')

    const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
    const query = videoMatch? 'https://youtu.be/' + videoMatch[1]: text
    const search = await yts(query)
    const result = videoMatch? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0]: search.all[0]
    if (!result) throw '🔍 No se encontraron resultados.'

    const { title, thumbnail, timestamp, views, ago, url, author, seconds} = result
    if (seconds> 1800) throw '⛔ El contenido supera el límite de duración (10 minutos).'

    const vistas = formatViews(views)
    const info = `🎧 Descargando: *${title}*\n\n📺 Canal: *${author.name}*\n👁️ Vistas: *${vistas}*\n⏱️ Duración: *${timestamp}*\n📅 Publicado: *${ago}*\n🔗 Enlace: ${url}`
    const thumb = (await conn.getFile(thumbnail)).data
    await conn.sendMessage(m.chat, { image: thumb, caption: info}, { quoted: m})

    if (['play', 'yta', 'ytmp3', 'playaudio'].includes(command)) {
      const audio = await getAud(url)
      if (!audio?.url) throw '❌ No se pudo obtener el audio.'
      m.reply(`✅ *Audio listo. Servidor:* \`${audio.api}\``)
      await conn.sendMessage(m.chat, { audio: { url: audio.url}, fileName: `${title}.mp3`, mimetype: 'audio/mpeg'}, { quoted: m})
      await m.react('🎶')
} else if (['play2', 'ytv', 'ytmp4', 'mp4'].includes(command)) {
      const video = await getVid(url)
      if (!video?.url) throw '❌ No se pudo obtener el video.'
      m.reply(`✅ *Vídeo listo. Servidor:* \`${video.api}\``)
      await conn.sendFile(m.chat, video.url, `${title}.mp4`, `🎬 ${title}`, m)
      await m.react('📽️')
}
} catch (e) {
    await m.react('⚠️')
    return conn.reply(m.chat, typeof e === 'string'? e: '🚨 Ocurrió un error inesperado.\nUsa *' + usedPrefix + 'report* para informarlo.\n\n' + e.message, m)
}
}

handler.command = handler.help = ['play', 'yta', 'ytmp3', 'play2', 'ytv', 'ytmp4', 'playaudio', 'mp4']
handler.tags = ['descargas']
handler.group = true

export default handler
