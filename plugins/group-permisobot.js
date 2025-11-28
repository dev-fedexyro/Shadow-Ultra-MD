let handler = async (m, { conn, command, isOwner, usedPrefix }) => {
    if (!isOwner) {
        global.dfail('owner', m, conn); 
        return false;
    }

    if (!m.isGroup) {
        return conn.reply(m.chat, '❌ Este comando solo puede usarse dentro de un grupo para gestionar la exclusividad.', m);
    }
    
    const botName = conn.user.name || 'el bot';
    const currentChatId = m.chat;
    const currentChatName = (await conn.getName(currentChatId)) || 'este grupo';
    const settings = global.db.data.settings;
    
    if (command.toLowerCase() === 'delpermiso') {
        if (!settings.primaryChat) {
            return conn.reply(m.chat, `✅ *${botName}* ya estaba respondiendo en todos los chats. No hay exclusividad que eliminar.`, m);
        }
        
        if (settings.primaryChat !== currentChatId) {
            const exclusiveGroupName = (await conn.getName(settings.primaryChat)) || 'el grupo exclusivo';
            return conn.reply(m.chat, `⚠️ *¡Error!* El permiso de exclusividad está activo en el grupo *${exclusiveGroupName}*. Debes usar *${usedPrefix}delpermiso* allí para desactivarlo.`, m);
        }
        
        settings.primaryChat = null;
        
        const removeMsg = `✅ *¡Permiso de Exclusividad Eliminado!* ✅\n\n*${botName}* ha sido *desactivado* del modo exclusivo y ahora responderá a *todos* los grupos y chats privados.`;
        return conn.reply(m.chat, removeMsg, m);
    }
    
    else if (command.toLowerCase() === 'darpermiso') {
        if (settings.primaryChat) {

            const otherChatName = (await conn.getName(settings.primaryChat)) || 'otro grupo';
            return conn.reply(m.chat, `⚠️ *¡Atención!* Ya hay un grupo exclusivo activo: *${otherChatName}*.\n\nDebes usar *${usedPrefix}delpermiso* en ese grupo primero para quitar la exclusividad.`, m);
        }
        
        settings.primaryChat = currentChatId;
        
        const grantMsg = `👑 *¡Permiso de Exclusividad Activado!* 👑\n\nDesde ahora, *${botName}* solo *responderá a los comandos de este grupo* (*${currentChatName}*) y al chat privado de su Creador.\n\nPara quitar este permiso, usa *${usedPrefix}delpermiso* en este mismo grupo.`;
        return conn.reply(m.chat, grantMsg, m);
    }
}

handler.help = ['darpermiso', 'delpermiso'];
handler.tags = ['owner'];
handler.command = ['darpermiso', 'delpermiso'];
handler.rowner = true;

export default handler;
