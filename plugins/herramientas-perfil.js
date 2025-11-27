import { xpRange} from '../lib/levelling.js'
import moment from 'moment-timezone'
import fetch from 'node-fetch'

async function formatTime(ms) {
    let s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60), d = Math.floor(h / 24)
    let months = Math.floor(d / 30), weeks = Math.floor((d % 30) / 7)
    s %= 60; m %= 60; h %= 24; d %= 7
    let t = months? [`${months} mes${months> 1? 'es': ''}`]:
        weeks? [`${weeks} semana${weeks> 1? 's': ''}`]:
        d? [`${d} día${d> 1? 's': ''}`]: []
    if (h) t.push(`${h} hora${h> 1? 's': ''}`)
    if (m) t.push(`${m} minuto${m> 1? 's': ''}`)
    if (s) t.push(`${s} segundo${s> 1? 's': ''}`)
    return t.length> 1? t.slice(0, -1).join(' ') + ' y ' + t.slice(-1): t[0] || '1 segundo'
}

const regHandler = async (m, { conn, args, usedPrefix}) => {
    const userId = m.sender
    const user = global.db.data.users[userId] ||= {}

    if (user.registered) {
        return m.reply('❌ ¡Ya estás registrado! Usa *#unreg* si deseas cambiar tu información.', m)
}

    if (args.length < 1) {
        return m.reply(`*⚠️ Formato Incorrecto:*\n\nDebe ser: ${usedPrefix}reg <nombre>|<año>.<edad>\n*Ejemplo:* ${usedPrefix}reg fede|2007.17`, m)
}

    const [nameRaw, dataRaw] = args.join(' ').split('|')
    if (!nameRaw ||!dataRaw) {
        return m.reply(`*Falta la edad/año.* Usa el formato: ${usedPrefix}reg nombre|año.edad\n\n*Ejemplo:* ${usedPrefix}reg fede|2007.17`, m)
}

    const name = nameRaw.trim()
    const [yearStr, ageStr] = dataRaw.split('.')
    const year = parseInt(yearStr)
    const age = parseInt(ageStr)

    if (!name || name.length < 3) {
        return m.reply('El nombre de registro debe tener al menos 3 caracteres.', m)
}
    if (isNaN(year) || year < 1900 || year> new Date().getFullYear() || isNaN(age) || age < 10 || age> 100) {
        return m.reply('El año o la edad ingresados no son válidos. Verifica los números.', m)
}

    const registrationTime = Date.now()
    Object.assign(user, {
        name_reg: name,
        age_reg: age,
        birth: `${year}`,
        registered: registrationTime
})

    m.reply(`✅ *¡Registro Completo!*
Ahora puedes ver tu perfil usando *${usedPrefix}perfil*.

*Datos guardados:*
• *Nombre:* ${name}
• *Edad:* ${age} años
• *Registrado en:* ${moment(registrationTime).tz('America/Argentina/Buenos_Aires').format('DD/MM/YYYY HH:mm:ss')}`, m)
}

let handler = async (m, { conn, args, usedPrefix}) => {
    const command = m.text.toLowerCase().split(' ')[0].replace(usedPrefix, '')
    if (['reg', 'register', 'registrar'].includes(command)) {
        return regHandler(m, { conn, args, usedPrefix})
}

    try {
        const userId = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
        const user = global.db.data.users[userId] ||= {}

        if (!user.registered) {
            return m.reply(`⚠️ *¡Necesitas registrarte primero!*
Usa el comando *${usedPrefix}reg* con el formato:

*${usedPrefix}reg nombre|año.edad*
*Ejemplo:* ${usedPrefix}reg fede|2007.17`, m)
}

        const name = user.name || await conn.getName(userId)
        const { min, xp} = xpRange(user.level || 0, global.multiplier)
        const rank = Object.entries(global.db.data.users)
.map(([jid, u]) => ({...u, jid}))
.sort((a, b) => (b.level || 0) - (a.level || 0))
.findIndex(u => u.jid === userId) + 1

        const registeredDate = moment(user.registered).tz('America/Argentina/Buenos_Aires').format('DD/MM/YYYY HH:mm:ss')
        const totalCoins = (user.coin || 0) + (user.bank || 0)
        const botContacts = conn.contacts?.length?.toLocaleString() || 'N/A'
        const ownedIDs = Object.entries(global.db.data.characters || {}).filter(([, c]) => c.user === userId).map(([id]) => id)
        const favChar = user.favorite && global.db.data.characters?.[user.favorite]?.name || 'Ninguno'

        const profileText = `
╭┈ 『👤』 _TARJETA DE PERFIL_
│ • _Usuario:_ ${name}
│ • _Descripción:_ ${user.description || 'Sin descripción...'}
│ • _Pareja:_ ${user.marry? (global.db.data.users[user.marry]?.name || 'Usuario'): 'Nadie'}
╰═───────┈
╭┈ 『📊』 _ESTADÍSTICAS_
│ ❖ _Nivel:_ ${user.level || 0} (#${rank})
│ ⦾ _Progreso:_ ${user.exp - min}/${xp} (${Math.floor(((user.exp - min) / xp) * 100)}%)
│ ☆ _Experiencia:_ ${user.exp?.toLocaleString() || 0}
│ ⛁ _Coins Totales:_ ${totalCoins.toLocaleString()} ${currency}
│ ❒ _Comandos Usados:_ ${user.commands || 0}
╰═───────┈
╭┈ 『📜』 _DATOS ADICIONALES_
│ 🎂 _Cumpleaños:_ ${user.birth || 'Sin especificar'}
│ 📜 _Nombre REG:_ ${user.name_reg || 'N/A'}
│ ⏰ _Hora REG:_ ${registeredDate}
│ 📈 _LID (Contactos Bot):_ ${botContacts}
│ 💘 _Harem/Waifus:_ ${ownedIDs.length} (${favChar})
╰═───────┈`

        const pp = await conn.profilePictureUrl(userId, 'image').catch(() =>
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg'
)

        await conn.sendMessage(m.chat, {
            image: { url: pp},
            caption: profileText.trim(),
            mentions: [userId]
}, { quoted: m})

} catch (err) {
        console.error(err)
        m.reply(`⚠︎ Se ha producido un problema al generar el perfil.\n> Error: ${err.message}`, m)
}
}

handler.help = ['profile', 'reg']
handler.tags = ['info']
handler.command = ['profile', 'perfil', 'perfíl', 'reg', 'register', 'registrar']
handler.group = true

export default handler
