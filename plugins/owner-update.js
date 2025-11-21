import { execSync} from 'child_process';

const handler = async (m, { conn, text, isROwner}) => {
  if (!isROwner) return;
  await m.react('⏳');

  await conn.sendMessage(m.chat, '🌱 Procesando la actualización, espere un momento.', m, global.rcanal);

  try {
    const stdout = execSync('git pull' + (m.fromMe && text? ' ' + text: ''));
    let messager = stdout.toString();

    if (messager.includes('❀ Ya está cargada la actualización.')) {
      return conn.sendMessage(m.chat, '☘ Los datos ya están actualizados a la última versión.', m, global.rcanal);
}

    if (messager.includes('ꕥ Actualizando.')) {
      return conn.sendMessage(m.chat, '🌱 Actualización en curso...\n\n' + stdout.toString(), m, global.rcanal);
}

    await m.react('✅');
    return conn.sendMessage(m.chat, messager, m, global.rcanal);

} catch {
    try {
      const status = execSync('git status --porcelain');
      if (status.length> 0) {
        const conflictedFiles = status.toString().split('\n').filter(line => line.trim()!== '').map(line => {
          if (
            line.includes('.npm/') ||
            line.includes('.cache/') ||
            line.includes('tmp/') ||
            line.includes('database.json') ||
            line.includes('sessions/Principal/') ||
            line.includes('npm-debug.log')
) return null;
          return '*→ ' + line.slice(3) + '*';
}).filter(Boolean);

        if (conflictedFiles.length> 0) {
          const errorMessage = `❌ No se pudo realizar la actualización:\n\n> Se han encontrado cambios locales en los archivos del bot que entran en conflicto con las nuevas actualizaciones del repositorio.\n\n${conflictedFiles.join('\n')}.`;
          await m.react('❌');
          return conn.sendMessage(m.chat, errorMessage, m, global.rcanal);
}
}
} catch (error) {
      console.error(error);
      let errorMessage2 = '❌ Ocurrió un error inesperado.';
      if (error.message) {
        errorMessage2 += '\n🌱 Mensaje de error: ' + error.message;
}
      return conn.sendMessage(m.chat, errorMessage2, m, global.rcanal);
}
}
};

handler.help = ['update', 'fix', 'actualizar'];
handler.tags = ['owner'];
handler.command = ['update', 'fix', 'actualizar'];

export default handler;
