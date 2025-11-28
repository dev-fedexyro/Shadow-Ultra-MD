import fetch from 'node-fetch'
import { format } from 'util'
import fs from 'fs' 
import AdmZip from 'adm-zip' 

let handler = async (m, { conn, usedPrefix, text }) => {
  if (m.fromMe) return

  if (text && (text.toLowerCase() === 'code' || text.toLowerCase() === 'codigo')) {
    await m.react('💾') 
    
    try {
      const fileContent = fs.readFileSync(`./plugins/tools/herramientas-get.js`)
      const zip = new AdmZip()
      zip.addFile('herramientas-get.js', fileContent, 'Código fuente del script herramientas-get.js')
      const zipBuffer = zip.toBuffer()
      
      return conn.sendFile(
        m.chat, 
        zipBuffer, 
        'herramientas-get.zip', 
        `📁 *Archivo Fuente Solicitado*\n\nAquí tienes el archivo \`herramientas-get.js\` comprimido.`, 
        m
      )
    } catch (e) {
      await m.react('✖️')
      return conn.reply(m.chat, `⚠️ No se pudo obtener el código fuente. Error: ${e.message}`, m)
    }
  }

  if (!/^https?:\/\//.test(text)) 
    return m.reply(`🔗 *Error*: Por favor, proporciona una *URL* válida para descargar su contenido.`)

  let url = text
  await m.react('🌐') 

  try {
    let res = await fetch(url)

    if (res.headers.get('content-length') > 100 * 1024 * 1024) { 
      throw `📦 El archivo excede el límite de tamaño (${res.headers.get('content-length')}).`
    }

    if (!/text|json/.test(res.headers.get('content-type'))) {
      return conn.sendFile(m.chat, url, 'file_content', `📄 *Archivo obtenido de la URL*`, m)
    }

    let txt = await res.buffer()
    try {
      txt = format(JSON.parse(txt + ''))
    } catch (e) {
      txt = txt + ''
    } finally {
      m.reply(`📋 *Contenido de la URL*\n\n${txt.slice(0, 65536)}`)
      await m.react('✅')
    }

  } catch (e) {
    await m.react('❌')
    conn.reply(m.chat, `⚠️ Error en la solicitud GET:\n> ${e.message}`, m)
  }
}

handler.help = ['get', 'getcode']
handler.tags = ['herramientas']
handler.command = ['fetch', 'get', 'getcode', 'codigo'] 

export default handler
