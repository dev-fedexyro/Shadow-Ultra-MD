const linkRegex = /(chat\.whatsapp\.com\/[0-9A-Za-z]{20,24})|(whatsapp\.com\/(channel|c)\/[0-9A-Za-z]{20,24})/i
const allowedLinks = [
    'https://whatsapp.com/channel/0029VbBG4i2GE56rSgXsqw2W'
]
const db = global?.db?.data

export async function before(m, { conn, isAdmin, isBotAdmin, isROwner }) {
    if (!m.isGroup) return
    if (!m || !m.text) return 
    
    const chat = db?.chats?.[m.chat]
    if (!chat || !chat.antilink) return
    
    const text = m.text.toLowerCase()

    const isLink = linkRegex.test(text)
    
    if (!isLink) return

    const hasAllowedLink = allowedLinks.some(link => text.includes(link.toLowerCase()))
    
    if (hasAllowedLink) return

    if (isAdmin || isROwner || m.key.participant === conn.user.jid) return

    if (isBotAdmin) {
        const linkThisGroup = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`
        if (text.includes(linkThisGroup)) return
    } else {
        return
    }

    try {
        await conn.sendMessage(m.chat, { 
            delete: { 
                remoteJid: m.chat, 
                fromMe: false, 
                id: m.key.id, 
                participant: m.key.participant 
            }
        })
    } catch (e) {
        console.error('Error al intentar eliminar el mensaje:', e)
    }

    const userName = db?.users?.[m.key.participant]?.name || 'Usuario'
    const isChannel = /whatsapp\.com\/(channel|c)\//i.test(text)

    const replyMessage = `> 🚫 Se ha eliminado a *${userName}* del grupo por \`Anti-Link\`. No se permiten enlaces de *${isChannel ? 'canales' : 'otros grupos'}*.`
    
    try {
        await conn.reply(m.chat, replyMessage, null, { mentions: [m.key.participant] })
        await conn.groupParticipantsUpdate(m.chat, [m.key.participant], 'remove')
    } catch (e) {
        console.error('Error al notificar o expulsar al usuario:', e)
        await conn.reply(m.chat, `⚠️ No pude expulsar a *${userName}* por Anti-Link. Asegúrate de que el bot tenga *permisos de Administrador* para expulsar.`, null, { mentions: [m.key.participant] })
    }
                                                                   }
