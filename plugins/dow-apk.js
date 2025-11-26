import { search, download} from 'aptoide-scraper'

const handler = async (m, { conn, usedPrefix, command, text}) => {
  if (!text) {
    return conn.reply(m.chat, '🌱 Por favor, ingrese el nombre de la APK que desea descargar.', m)
}

  try {
    await m.react('🕒')

    const results = await search(text)
    if (!results || results.length === 0) {
      await m.react('⚠️')
      return conn.reply(m.chat, '❌ No se encontraron resultados para esa búsqueda.', m)
}

    const app = await download(results[0].id)
    const { name, package: pkg, lastup, size, icon, dllink} = app

    const info = `*乂  APTOIDE - DESCARGAS 乂*\n\n` +
                 `≡ Nombre: ${name}\n` +
                 `≡ Paquete: ${pkg}\n` +
                 `≡ Última actualización: ${lastup}\n` +
                 `≡ Tamaño: ${size}`

    await conn.sendFile(m.chat, icon, 'thumbnail.jpg', info, m)

    const sizeMB = parseFloat(size.replace(' MB', '').replace(',', '.'))
    if (size.includes('GB') || sizeMB> 999) {
      await m.react('⚠️')
      return conn.reply(m.chat, '⚠️ El archivo es demasiado pesado para enviarlo por este medio.', m)
}

    await conn.sendMessage(
      m.chat,
      {
        document: { url: dllink},
        mimetype: 'application/vnd.android.package-archive',
        fileName: `${name}.apk`,
        caption: null
},
      { quoted: m}
)

    await m.react('✅')
} catch (error) {
    console.error('Error al descargar APK:', error)
    await m.react('✖️')
    return conn.reply(
      m.chat,
      `⚠︎ Error en descargar su apk.\n` +
      `${error.message}`,
      m
)
}
}

handler.tags = ['descargas']
handler.help = ['apk', 'modapk', 'aptoide']
handler.command = ['apk', 'modapk', 'aptoide']
handler.group = true
handler.premium = true

export default handler
