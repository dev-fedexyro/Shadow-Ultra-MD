import fetch from 'node-fetch'
import FormData from 'form-data'
import { WAMessageStubType } from '@whiskeysockets/baileys'

const GLOBAL_CONFIG = {
    DEV_FOOTER: global.dev || 'Shadow Ultra MD',
    DEFAULT_PP_URL: 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg',
    WELCOME_BG: "https://files.catbox.moe/12zb63.jpg",
    BYE_BG: "https://files.catbox.moe/12zb63.jpg",
}

let fkontak = null

async function initFkontak() {
    let thumbBuffer = null
    try {
        const res = await fetch('https://raw.githubusercontent.com/AkiraDevX/uploads/main/uploads/1763586769709_495967.jpeg')
        thumbBuffer = Buffer.from(await res.arrayBuffer())
    } catch (e) {
    }

    fkontak = {
        key: { participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast', id: 'Halo' },
        message: { locationMessage: { name: GLOBAL_CONFIG.DEV_FOOTER, jpegThumbnail: thumbBuffer || Buffer.from([]) } }
    }
}

initFkontak()

const PAIS_CODIGOS = {
    "1": "EE.UU / Canada", "7": "Rusia / Kazajistan", "20": "Egipto", "27": "Sudafrica", "30": "Grecia",
    "31": "Paises Bajos", "32": "Belgica", "33": "Francia", "34": "España", "36": "Hungria", "39": "Italia",
    "40": "Rumania", "44": "Reino Unido", "49": "Alemania", "51": "Peru", "52": "Mexico", "53": "Cuba",
    "54": "Argentina", "55": "Brasil", "56": "Chile", "57": "Colombia", "58": "Venezuela", "591": "Bolivia",
    "593": "Ecuador", "595": "Paraguay", "598": "Uruguay", "502": "Guatemala", "503": "El Salvador",
    "504": "Honduras", "505": "Nicaragua", "506": "Costa Rica", "507": "Panama", "60": "Malasia",
    "61": "Australia", "62": "Indonesia", "63": "Filipinas", "64": "Nueva Zelanda", "65": "Singapur",
    "66": "Tailandia", "81": "Japon", "82": "Corea del Sur", "84": "Vietnam", "86": "China", "90": "Turquia",
    "91": "India", "212": "Marruecos", "213": "Argelia", "216": "Tunez", "218": "Libia", "234": "Nigeria",
    "254": "Kenia", "255": "Tanzania", "256": "Uganda", "258": "Mozambique", "260": "Zambia", "263": "Zimbabue"
}

function detectarPais(numero) {
    for (const code in PAIS_CODIGOS) {
        if (numero.startsWith(code) && (numero.length === code.length || !isNaN(numero[code.length]))) {
            return PAIS_CODIGOS[code]
        }
    }
    return "Desconocido"
}

function fechaHoraPeru() {
    const options = { timeZone: "America/Lima" }
    const fecha = new Date().toLocaleDateString("es-PE", {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', ...options
    })
    const hora = new Date().toLocaleTimeString("es-PE", {
        hour: "2-digit", minute: "2-digit", second: "2-digit", ...options
    })
    return { fecha, hora }
}

async function generarImagenAPI(data, endpoint) {
    try {
        const form = new FormData()
        form.append('username', data.username.replace('@', ''))
        form.append('guildName', data.groupName)
        form.append('memberCount', data.memberCount)
        form.append('quality', 90)

        const [avRes, bgRes] = await Promise.all([
            fetch(data.avatar).catch(() => null),
            fetch(data.background).catch(() => null)
        ])

        const av = avRes && avRes.ok ? await avRes.arrayBuffer() : null
        const bg = bgRes && bgRes.ok ? await bgRes.arrayBuffer() : null

        if (av) form.append('avatar', Buffer.from(av), { filename: 'avatar.png', contentType: 'image/png' })
        if (bg) form.append('background', Buffer.from(bg), { filename: 'bg.jpg', contentType: 'image/jpeg' })

        const res = await fetch(`https://api.siputzx.my.id/api/canvas/${endpoint}`, { method: 'POST', body: form })
        if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`)

        return Buffer.from(await res.arrayBuffer())
    } catch (e) {
        console.error(`Error al generar imagen (${endpoint}):`, e.message)
        return null
    }
}

async function generarContenidoEvento({ conn, userId, groupMetadata, chat, isWelcome }) {
    const username = `@${userId.split('@')[0]}`
    const numero = userId.split("@")[0]
    const pais = detectarPais(numero)

    const pp = await conn.profilePictureUrl(userId, 'image').catch(() => GLOBAL_CONFIG.DEFAULT_PP_URL)
    const { fecha, hora } = fechaHoraPeru()

    const currentMembers = groupMetadata.participants.length
    const memberCount = isWelcome ? currentMembers + 1 : currentMembers - 1
    const groupSize = Math.max(0, memberCount)

    const desc = groupMetadata.desc?.toString() || 'Sin descripcion'

    const customKey = isWelcome ? 'sWelcome' : 'sBye'
    const defaultText = isWelcome ? 'Edita con el comando "setwelcome"' : 'Edita con el comando "setbye"'

    const customMessage = (chat[customKey] || defaultText)
        .replace(/{usuario}/g, `${username}`)
        .replace(/{grupo}/g, `*${groupMetadata.subject}*`)
        .replace(/{desc}/g, `${desc}`)

    const titleText = isWelcome ? 'BIENVENIDO' : 'ADIOS'
    const eventText = isWelcome ? 'WELCOME' : 'GOODBYE'
    const apiBgUrl = isWelcome ? GLOBAL_CONFIG.WELCOME_BG : GLOBAL_CONFIG.BYE_BG
    const endpoint = isWelcome ? 'welcomev5' : 'goodbyev5'

    const caption =
`--- ${eventText} ---

*INFO DEL EVENTO*

> Usuario: ${username}
> Accion: ${titleText}
> Grupo: ${groupMetadata.subject}
> Miembros: ${groupSize}
> Pais: ${pais}
> Hora: ${hora}
> Fecha: ${fecha}

*Mensaje Personalizado:*
${customMessage}`

    const imgBuffer = await generarImagenAPI({
        username, groupName: groupMetadata.subject, memberCount: groupSize, avatar: pp, background: apiBgUrl
    }, endpoint)

    return { pp, caption, imgBuffer, mentions: [userId] }
}

async function enviarMensajeEvento({ conn, m, imgBuffer, pp, caption, mentions }) {
    if (!fkontak) await initFkontak();

    const messageOptions = {
        caption: caption,
        contextInfo: { mentionedJid: mentions },
        quoted: fkontak
    }

    if (imgBuffer) {
        await conn.sendMessage(m.chat, { image: imgBuffer, ...messageOptions })
    } else {
        await conn.sendMessage(m.chat, { image: { url: pp }, ...messageOptions })
    }
}

let handler = m => m

handler.before = async function (m, { conn, participants, groupMetadata }) {
    try {
        if (!m.messageStubType || !m.isGroup) return !0
        if (!global.db.data.chats[m.chat] || !global.db.data.chats[m.chat].welcome) return !0

        const chat = global.db.data.chats[m.chat]
        
        let userId = m.messageStubParameters[0]
        
        if (userId && userId.endsWith('@lid')) {
            userId = userId.replace('@lid', '@s.whatsapp.net')
        }
        
        if (!userId || !userId.endsWith('@s.whatsapp.net')) {
             return !0
        }
        
        const stubType = m.messageStubType
        const isAdd = stubType === WAMessageStubType.GROUP_PARTICIPANT_ADD
        
        const isRemove = stubType === 28 ||
                         stubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE ||
                         stubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE

        if (!isAdd && !isRemove) {
             return !0
        }

        const { pp, caption, imgBuffer, mentions } = await generarContenidoEvento({
            conn, userId, groupMetadata, chat, isWelcome: isAdd
        })

        await enviarMensajeEvento({
            conn, m, imgBuffer, pp, caption, mentions
        })

    } catch (e) {
        console.error("Error critico en el evento (welcome/bye):", e)
        const errorTarget = m.key.remoteJid || 'el chat'
        await conn.sendMessage(errorTarget, {
            text: `ATENCIÓN: Error critico al procesar el evento de grupo. Detalles: ${e.message}`,
        })
    }
}

export { generarContenidoEvento as generarBienvenida, generarContenidoEvento as generarDespedida }
export default handler
