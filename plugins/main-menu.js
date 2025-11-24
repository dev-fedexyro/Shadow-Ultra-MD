const handler = async (m, { conn, usedPrefix}) => {
  const nombre = await conn.getName(m.sender);
  const totalreg = Object.keys(global.db.data.users).length;
  const uptime = clockString(process.uptime());
  const prefix = usedPrefix || '/';
  const groupsCount = Object.values(conn.chats).filter(v => v.id.endsWith('@g.us') &&!v.read_only && v.presence!== 'unavailable').length;

  const categories = {};
  for (const plugin of Object.values(global.plugins)) {
    if (!plugin.help ||!plugin.tags || plugin.tags.length === 0) continue;
    const commands = plugin.help
.filter(cmd =>!cmd.startsWith('#') &&!['menu', 'menú', 'help'].includes(cmd))
.map(cmd => `${prefix}${cmd}`);
    if (commands.length === 0) continue;
    for (const tag of plugin.tags) {
      const key = tag.toLowerCase();
      if (!categories[key]) categories[key] = [];
      categories[key].push(...commands.filter(cmd =>!categories[key].includes(cmd)));
}
}

  const infoUser = `
❐ ʜᴏʟᴀ, sᴏʏ *_sʜᴀᴅᴏᴡ - ʙᴏᴛ_* 🌱

╰┈□ ɪɴғᴏ-ᴜsᴇʀ
❐ _ᴜsᴜᴀʀɪᴏ:_ ${nombre}
❐ _ʀᴇɢɪsᴛʀᴀᴅᴏs:_ ${totalreg}

╰┈□ ɪɴғᴏ-ʙᴏᴛ
❐ _ᴛɪᴇᴍᴘᴏ ᴀᴄᴛɪᴠᴏ:_ ${uptime}
❐ _ᴘʀᴇғɪᴊᴏ:_ [ ${prefix} ]
❐ _ɢʀᴜᴘᴏs ᴀᴄᴛɪᴠᴏs:_ ${groupsCount}
❐ _ғᴇᴄʜᴀ:_ ${new Date().toLocaleString('es-ES', { timeZone: 'America/Argentina/Buenos_Aires'})}
`.trim();

  let menuText = infoUser + '\n\n';

  const sortedTags = Object.keys(tags).filter(tag => categories[tag] && categories[tag].length> 0);
  for (const tag of sortedTags) {
    const tagName = tags[tag];
    const cmds = categories[tag].sort();
    menuText += `╭─「${tagName}」\n${cmds.map(cmd => `➩ ${cmd}`).join('\n')}\n\n`;
}

  const buttonMessage = {
    text: menuText,
    footer: '© Shadow - Bot',
    templateButtons: [
      {
        index: 1,
        urlButton: {
          displayText: '🌱 Canal Oficial ',
          url: 'https://whatsapp.com/channel/0029VbBG4i2GE56rSgXsqw2W'
}
}
    ],
    headerType: 1,
    contextInfo: {
      mentionedJid: [m.sender]
}
};

  try {
    await conn.sendMessage(m.chat, buttonMessage, { quoted: m});
} catch (e) {
    console.error('❌ Error al enviar el menú con botón:', e);
    await conn.sendMessage(m.chat, { text: menuText}, { quoted: m});
    await m.reply('❌ Ocurrió un error al enviar el menú. Se envió como texto simple.');
}
};

function clockString(seconds) {
  if (typeof seconds!== 'number' || isNaN(seconds) || seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

const tags = {
  info: 'ɪɴғᴏʀᴍᴀᴄɪᴏ́ɴ',
  anime: 'ᴀɴɪᴍᴇ & ᴡᴀɪғᴜs',
  buscador: 'ʙᴜsᴄᴀᴅᴏʀᴇs',
  downloader: 'ᴅᴇsᴄᴀʀɢᴀs',
  economy: 'ᴇᴄᴏɴᴏᴍɪ́ᴀ & ᴊᴜᴇɢᴏs',
  fun: 'ᴊᴜᴇɢᴏs ᴅɪᴠᴇʀᴛɪᴅᴏs',
  group: 'ғᴜɴᴄɪᴏɴᴇs ᴅᴇ ɢʀᴜᴘᴏ',
  ai: 'ɪɴᴛᴇʟɪɢᴇɴᴄɪᴀ ᴀʀᴛɪғɪᴄɪᴀʟ',
  game: 'ᴊᴜᴇɢᴏs ᴄʟᴀ́sɪᴄᴏs',
  serbot: 'sᴜʙ-ʙᴏᴛs',
  main: 'ᴄᴏᴍᴀɴᴅᴏs ᴘʀɪɴᴄɪᴘᴀʟᴇs',
  nable: 'ᴀᴄᴛɪᴠᴀʀ / ᴅᴇsᴀᴄᴛɪᴠᴀʀ',
  nsfw: 'ɴsғᴡ',
  owner: 'ᴅᴜᴇñᴏ / ᴀᴅᴍɪɴ',
  sticker: 'sᴛɪᴄᴋᴇʀs & ʟᴏɢᴏs',
  herramientas: 'ʜᴇʀʀᴀᴍɪᴇɴᴛᴀs'
};

handler.help = ['menu', 'menú', 'help'];
handler.tags = ['main'];
handler.command = ['menu', 'menú', 'help'];
handler.register = true;

export default handler;
