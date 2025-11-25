let handler = async (m, { conn, isAdmin }) => {
if (m.fromMe) throw 'Nggk'
if (isAdmin) throw '🌵 _Mi creador ahora es admin_'
await conn.groupParticipantsUpdate(m.chat, [m.sender], "promote")}
handler.help = ['admin','autoadmin']
handler.tags = ['owner']
handler.command = ['admin','autoadmin']
handler.rowner = true
handler.botAdmin = true
export default handler
