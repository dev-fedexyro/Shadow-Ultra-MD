let handler = async (m, { conn, text}) => {
  let id = text? text.trim(): m.chat;

  await conn.reply(id, '👻 Me voy de este grupo...');
  await conn.groupLeave(id);
};

handler.help = ['salir', 'leave'];
handler.tags = ['owner'];
handler.command = ['salir', 'leave'];
handler.group = true;
handler.rowner = true;

export default handler;
