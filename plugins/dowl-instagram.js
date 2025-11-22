/*
	* Create By Brayan330 - Adaptado para Google Images con Puppeteer
	* Enfocado en comandos .img y .imagen
*/

import https from 'https';
import baileys, { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import axios from 'axios';
import puppeteer from 'puppeteer'; 

async function sendAlbumMessage(conn, jid, medias, options = {}) {
  if (typeof jid !== 'string') throw new TypeError('jid debe ser string')
  if (medias.length < 1) throw new RangeError('Se requieren al menos 1 imagen')

  const caption = options.caption || ''
  const delay = !isNaN(options.delay) ? options.delay : 500

  const album = await baileys.generateWAMessageFromContent(
    jid,
    {
      messageContextInfo: {},
      albumMessage: {
        expectedImageCount: medias.filter(m => m.type === 'image').length,
        expectedVideoCount: medias.filter(m => m.type === 'video').length,
        ...(options.quoted ? {
          contextInfo: {
            remoteJid: options.quoted.key.remoteJid,
            fromMe: options.quoted.key.fromMe,
            stanzaId: options.quoted.key.id,
            participant: options.quoted.key.participant || options.quoted.key.remoteJid,
            quotedMessage: options.quoted.message
          }
        } : {})
      }
    },
    {}
  )

  await conn.relayMessage(album.key.remoteJid, album.message, { messageId: album.key.id })

  for (let i = 0; i < medias.length; i++) {
    const { type, data } = medias[i]
    const img = await baileys.generateWAMessage(
      album.key.remoteJid,
      { [type]: { ...data }, ...(i === 0 ? { caption } : {}) },
      { upload: conn.waUploadToServer }
    )
    img.message.messageContextInfo = {
      messageAssociation: { associationType: 1, parentMessageKey: album.key }
    }
    await conn.relayMessage(img.key.remoteJid, img.message, { messageId: img.key.id })
    await baileys.delay(delay)
  }

  return album
}

async function sendCustomPedido(m, conn, texto) {
  const botname = 'Tu Bot' 
  try {
    const img = 'https://raw.githubusercontent.com/El-brayan502/dat4/main/uploads/3e1dfb-1763309355015.jpg'
    const res = await axios.get(img, { responseType: 'arraybuffer' })
    const imgBuffer = Buffer.from(res.data)

    const orderMessage = {
      orderId: 'FAKE-' + Date.now(),
      thumbnail: imgBuffer,
      itemCount: 1,
      status: 1,
      surface: 1,
      message: texto,
      orderTitle: 'Image Bot',
      token: null,
      sellerJid: null,
      totalAmount1000: '0',
      totalCurrencyCode: 'GTQ',
      contextInfo: {
        externalAdReply: {
          title: botname,
          body: '',
          thumbnailUrl: img,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }

    const msg = generateWAMessageFromContent(m.chat, { orderMessage }, { quoted: m })
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  } catch (err) {
    console.error(err)
    m.reply('⚠️ Error enviando el pedido.', m)
  }
}

/**
 * Busca imágenes en Google Images usando Puppeteer y devuelve las URLs.
 * @param {string} query El término de búsqueda.
 * @param {number} limit El número máximo de URLs a devolver.
 * @returns {Promise<string[]>} Un array de URLs de imágenes.
 */
const searchGoogleImages = async (query, limit) => {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
        await page.goto(searchUrl, { waitUntil: 'networkidle0', timeout: 30000 });

        const imageUrls = await page.evaluate((limit) => {
            const results = [];
            const imgElements = document.querySelectorAll('img.rg_i'); 
            
            for (let i = 0; i < imgElements.length && results.length < limit; i++) {
                const img = imgElements[i];
                const url = img.getAttribute('data-src') || img.getAttribute('src');
                if (url && url.startsWith('http')) {
                    results.push(url);
                }
            }
            return results;
        }, limit);

        return imageUrls;
        
    } catch (e) {
        console.error('Error en el scraper de Google Images:', e);
        return [];
    } finally {
        if (browser) {
            await browser.close(); 
        }
    }
}


let handler = async (m, { conn, args, rcanal }) => {
  try {
    const text = args.join(' ')
    if (!text) return sendCustomPedido(m, conn, '*ⓘ* `Por favor, ingresa lo que deseas buscar (ej: .img perros, 5)`')

    const parts = text.split(',')
    const query = parts[0].trim()
    const limit = parts[1] ? Math.min(parseInt(parts[1].trim()), 12) : 12

    const res = await searchGoogleImages(query, limit) 
    
    if (!res.length) return sendCustomPedido(m, conn, `⚠️ No se encontraron resultados de imágenes para "${query}".`)

    const medias = res.map(url => ({ type: 'image', data: { url } }))
    
    await sendAlbumMessage(conn, m.chat, medias, { caption: `✨ Resultados de Google Images - "${query}"`, quoted: m })

  } catch (e) {
    return sendCustomPedido(m, conn, `⚠️ Se produjo un error al procesar la búsqueda:\n${e.message}`)
  }
}

handler.help = ['img', 'imagen']
handler.tags = ['downloader']
handler.command = ['img', 'imagen']
export default handler
