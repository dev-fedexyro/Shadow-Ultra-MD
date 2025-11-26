const handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin }) => {
    const imageUrl = 'https://files.catbox.moe/kz8m77.jpg';
    
    const contextInfo = {
        externalAdReply: {
            title: 'Shadow config',
            body: 'Shadow Ultra MD',
            sourceUrl: '',
            thumbnailUrl: imageUrl,
            mediaType: 1,
            renderLargerThumbnail: true
        }
    };

    const primaryBot = global.db.data.chats[m.chat].primaryBot
    if (primaryBot && conn.user.jid !== primaryBot) throw false

    const chat = global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
    
    let type = command.toLowerCase()
    
    let propertyName;
    switch (type) {
        case 'welcome':
        case 'bienvenida':
            propertyName = 'welcome';
            break;
        case 'modoadmin':
        case 'onlyadmin':
            propertyName = 'modoadmin';
            break;
        case 'antilink':
        case 'antienlace':
            propertyName = 'antiLink';
            break;
        case 'nsfw':
        case 'modohorny':
            propertyName = 'nsfw';
            break;
        default:
            return;
    }

    let isEnable = chat[propertyName] !== undefined ? chat[propertyName] : false

    if (args[0] === 'on' || args[0] === 'enable') {
        if (isEnable) return conn.reply(m.chat, `🌱 *${propertyName}* ya estaba *activado*.`, m, { contextInfo })
        isEnable = true
    } else if (args[0] === 'off' || args[0] === 'disable') {
        if (!isEnable) return conn.reply(m.chat, `🍒 *${propertyName}* ya estaba *desactivado*.`, m, { contextInfo })
        isEnable = false
    } else {
        const usageMessage = `「★」Un administrador puede activar o desactivar el *${command}* utilizando:\n\n● _Activar_ » *${usedPrefix}${command} enable*\n● _Desactivar_ » *${usedPrefix}${command} disable*\n\nꕥ Estado actual » *${isEnable ? '✓ Activado' : '✗ Desactivado'}*`;
        
        return conn.reply(m.chat, usageMessage, m, { contextInfo })
    }

    if (m.isGroup) {
        if (!isAdmin) {
            global.dfail('admin', m, conn)
            throw false
        }
    } else {
        if (!isOwner) {
            global.dfail('group', m, conn)
            throw false
        }
    }
    
    chat[propertyName] = isEnable
    
    conn.reply(m.chat, `🌵 Has *${isEnable ? 'activado' : 'desactivado'}* el *${propertyName}* para este grupo.`, m, { contextInfo })
}

handler.help = ['welcome', 'bienvenida', 'modoadmin', 'antilink', 'nsfw']
handler.tags = ['group']
handler.command = ['welcome', 'bienvenida', 'modoadmin', 'antilink', 'nsfw']
handler.group = true

export default handler
