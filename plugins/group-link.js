const handler = async (m, { conn, groupMetadata}) => {
  try {
    const inviteCode = await conn.groupInviteCode(m.chat);
    const groupLink = `https://chat.whatsapp.com/${inviteCode}`;
    const groupName = groupMetadata.subject;

    const message = `
📌 *Nombre del grupo:* ${groupName}
🆔 *ID del grupo:* ${m.chat}

🌱 Usa el botón de abajo para copiar el enlace de invitación.
`;

    await conn.sendMessage(
      m.chat,
      {
        text: message.trim(),
        footer: "© 2024–2025 Shadow Project",
        contextInfo: {
          externalAdReply: {
            title: "🔗 Enlace de invitación al grupo",
            body: "Tocá para copiar el link y compartirlo",
            mediaType: 1,
            thumbnailUrl: "https://files.catbox.moe/12zb63.jpg",
            sourceUrl: groupLink,
            renderLargerThumbnail: true
}
},
        interactiveButtons: [
          {
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
              display_text: "Copiar enlace",
              copy_code: groupLink
})
}
        ]
},
      { quoted: m}
);
} catch (e) {
    conn.logger?.error(e);
    m.reply(`❌ Ocurrió un error al generar el enlace:\n${e.message}`);
}
};

handler.help = ['link'];
handler.tags = ['group'];
handler.command = ['link', 'enlace'];
handler.group = true;
handler.botAdmin = true;

export default handler;
