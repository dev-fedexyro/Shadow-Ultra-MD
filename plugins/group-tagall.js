const handler = async (m, { isOwner, isAdmin, conn, participants, args, usedPrefix}) => {
  if (usedPrefix.toLowerCase() === 'a') return;
  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    return;
}

  const mensaje = args.join(' ').trim();
  const invocador = m.pushName || 'una sombra anónima';
  const imagen = 'https://files.catbox.moe/32d81v.jpg';

  const sombras = participants.map(p => `• @${p.id.split('@')[0]}`).join('\n');

  const texto = `
\`\`\`🌑 Invocación grupal de Shadow\`\`\`

Hola, soy ${invocador}, y he reunido a las sombras...

${mensaje || '_El silencio también es parte del ritual..._'} 🕯️

👥 *Sombras presentes:* ${participants.length}
${sombras}

Enviando desde el rincón más oscuro del jardín...
`;

  await conn.sendFile(m.chat, imagen, 'shadow.jpg', texto.trim(), m, false, {
    mentions: participants.map(p => p.id)
});
};

handler.help = ['tagall *<mensaje>*', 'invocar *<mensaje>*'];
handler.tags = ['group'];
handler.command = ['tagall', 'invocar'];
handler.admin = true;
handler.group = true;

export default handler;
