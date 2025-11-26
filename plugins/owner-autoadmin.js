let handler = async (m, { conn, isAdmin, isBotAdmin, command}) => {
    if (!isBotAdmin) {
        throw '🤖 *Necesito ser administrador* para poder modificar permisos.';
}

    if (command === 'autoadmin') {
        if (isAdmin) {
            throw '👑 *Ya eres administrador* en este grupo.';
}

        await conn.groupParticipantsUpdate(m.chat, [m.sender], "promote");
        m.reply('✅ *¡Hecho!* Ahora eres administrador del grupo.');
}

    if (command === 'deladmin') {
        if (!isAdmin) {
            throw '⚠️ *No eres administrador* actualmente.';
}

        await conn.groupParticipantsUpdate(m.chat, [m.sender], "demote");
        m.reply('✅ *Listo.* Ya no eres administrador del grupo.');
}
};

handler.help = ['autoadmin', 'deladmin'];
handler.tags = ['owner'];
handler.command = ['autoadmin', 'deladmin'];
handler.rowner = true;
handler.botAdmin = true;

export default handler;
