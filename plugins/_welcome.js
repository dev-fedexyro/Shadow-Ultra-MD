import { URL_WAV, URL_GIF } from "../config.js"

export async function participantsUpdate(conn, m) {
    if (!m.isGroup || !m.type) return

    const user = m.participants[0]
    
    const groupName = (await conn.groupMetadata(m.chat)).subject
    
    const userNameMention = `@${user.split('@')[0]}`

    try {
        if (m.type === 'add') {
            const welcomeText = `¡Bienvenido/a a ${groupName} ${userNameMention}!`
            
            await conn.sendMessage(m.chat, { 
                text: welcomeText,
                mentions: [user] 
            })

        } else if (m.type === 'remove') {
            const goodbyeText = `Un usuario salió del grupo ${groupName}. ¡Adiós ${userNameMention}!`
            
            await conn.sendMessage(m.chat, { 
                text: goodbyeText,
                mentions: [user] 
            })
        }

    } catch (e) {
        console.error('Error en participantsUpdate:', e)
    }
}
