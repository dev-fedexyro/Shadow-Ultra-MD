//▪CÓDIGO BY HASHIRAMA PRROS XD▪
//▪WHATSAPP MODS▪

import axios from 'axios'
import fetch from 'node-fetch'

async function makeFkontak() {
  try {
    const res = await fetch('https://i.postimg.cc/8zG3Ny13/image.jpg') 
    
    const thumb2 = Buffer.from(await res.arrayBuffer())
    return {
      key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' },
      message: { locationMessage: { name: 'Shadow - Descarga', jpegThumbnail: thumb2 } },
      participant: '0@s.whatsapp.net'
    }
  } catch {
    return undefined
  }
}

async function obtenerTokenYCookie() {
  const res = await axios.get('https://tmate.cc/id', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })
  const cookie = res.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || ''
  const tokenMatch = res.data.match(/<input[^>]+name="token"[^>]+value="([^"]+)"/i)
  const token = tokenMatch?.[1]
  if (!token) throw new Error('\`\`\`🪐 No se encontró el token\`\`\`')
  return { token, cookie }
}

async function descargarTikTok(urlTikTok) {
  const { token, cookie } = await obtenerTokenYCookie()
  const params = new URLSearchParams()
  params.append('url', urlTikTok)
  params.append('token', token)

  const res = await axios.post('https://tmate.cc/action', params.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0',
      'Referer': 'https://tmate.cc/id',
      'Origin': 'https://tmate.cc',
      'Cookie': cookie
    }
  })

  const html = res.data?.data
  if (!html) throw new Error('\`\`\`🌱 No se encontraron datos en la respuesta\`\`\`')

  const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i)
  const titulo = titleMatch?.[1]?.replace(/<[^>]+>/g, '').trim() || 'Sin título'

  const matches = [...html.matchAll(/<a[^>]+href="(https:\/\/[^"]+)"[^>]*>\s*<span>\s*<span>([^<]*)<\/span><\/span><\/a>/gi)]
  const vistos = new Set()
  const links = matches
    .map(([_, href, label]) => ({ href, label: label.trim() }))
    .filter(({ href }) => !href.includes('play.google.com') && !vistos.has(href) && vistos.add(href))

  const enlacesMp4 = links.filter(v => /download without watermark/i.test(v.label))
  const enlaceMp3 = links.find(v => /download mp3 audio/i.test(v.label))

  if (enlacesMp4.length > 0) return { tipo: 'video', titulo, enlacesMp4, enlaceMp3 }

  const imageMatches = [...html.matchAll(/<img[^>]+src="(https:\/\/tikcdn\.app\/a\/images\/[^"]+)"/gi)]
  const enlacesImagenes = [...new Set(imageMatches.map(m => m[1]))]

  if (enlacesImagenes.length > 0) return { tipo: 'imagen', titulo, imagenes: enlacesImagenes, enlaceMp3 }

  throw new Error('\`\`\`🌿 No hubo respuesta, puede que el enlace sea incorrecto\`\`\`')
}

let handler = async (m, { conn, args }) => {
  try {
    let fkontak = await makeFkontak()

    if (!args[0]) return conn.reply(m.chat, '\`\`\`🌵 Por favor, ingresa un enlace de TikTok\`\`\`\'', fkontak, rcanal)
    const url = args[0]
    if (!url.includes('tiktok.com')) return conn.reply(m.chat, '\`\`\`⚠️ El enlace debe ser de TikTok\`\`\`', fkontak, rcanal)

    await conn.reply(m.chat, '\`\`\`⏳ Descargando, espera un momento...\`\`\`', fkontak, rcanal)

    const resultado = await descargarTikTok(url)

    if (resultado.tipo === 'video') {
      const videoUrl = resultado.enlacesMp4[0].href
      await conn.sendMessage(m.chat, { video: { url: videoUrl }, caption: `🎥 ${resultado.titulo}` }, { quoted: fkontak })
      if (resultado.enlaceMp3) {
        await conn.sendMessage(m.chat, { audio: { url: resultado.enlaceMp3.href }, mimetype: 'audio/mpeg' }, { quoted: fkontak })
      }
    } else if (resultado.tipo === 'imagen') {
      for (let img of resultado.imagenes) {
        await conn.sendMessage(m.chat, { image: { url: img }, caption: `🖼 ${resultado.titulo}` }, { quoted: fkontak })
      }
      if (resultado.enlaceMp3) {
        await conn.sendMessage(m.chat, { audio: { url: resultado.enlaceMp3.href }, mimetype: 'audio/mpeg' }, { quoted: fkontak })
      }
    }

  } catch (e) {
    let fkontak = await makeFkontak()
    conn.reply(m.chat, `⚠️ Error: ${e.message}`, fkontak, rcanal)
  }
}

handler.help = ['tiktok']
handler.command = ['tiktok', 'tt', 'tiktokdl']
handler.tags = ['downloader']

export default handler
