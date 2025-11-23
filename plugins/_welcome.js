import fs from 'fs';
import { WAMessageStubType } from '@whiskeysockets/baileys';

async function generarBienvenida({ conn, userId, groupMetadata, chat }) {
  const username = `@${userId.split('@')[0]}`;
  
  const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 
    'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg'
  );

  const fecha = new Date().toLocaleDateString("es-ES", { 
    timeZone: "America/Mexico_City", 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric'
  });
  
  const groupSize = groupMetadata.participants.length; 
  const desc = groupMetadata.desc?.toString() || 'Sin descripción';
  
  const mensajeBase = chat.sWelcome || 'Edita con el comando "setwelcome"';

  const mensaje = mensajeBase
    .replace(/{usuario}/g, username)
    .replace(/{grupo}/g, `*${groupMetadata.subject}*`)
    .replace(/{desc}/g, desc);
  
  const caption = `🌱 Bienvenido a *"_${groupMetadata.subject}_"*\n🌾 _Usuario_ » ${username}\n🌵 ${mensaje}\n🌑 _Ahora somos ${groupSize} Miembros._\n🌾 Fecha » ${fecha}\n🌱 Disfruta tu estadía en el grupo!\n> *➮ Puedes usar _#help_ para ver la lista de comandos.*`;

  return {
    pp,
    caption,
    contextInfo: {
      externalAdReply: {
        title: 'Shadow - Bot',
        body: 'Shadow - MD',
        thumbnailUrl: 'https://files.catbox.moe/12zb63.jpg',
        mediaType: 1,
        renderLargerThumbnail: true,
        showAdAttribution: true,
        sourceUrl: null
      }
    }
  };
}

async function generarDespedida({ conn, userId, groupMetadata, chat }) {
  const username = `@${userId.split('@')[0]}`;
  
  const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 
    'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg'
  );

  const fecha = new Date().toLocaleDateString("es-ES", { 
    timeZone: "America/Mexico_City", 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric'
  });

  const groupSize = groupMetadata.participants.length; 
  const desc = groupMetadata.desc?.toString() || 'Sin descripción';
  
  const mensajeBase = chat.sBye || 'Edita con el comando "setbye"';

  const mensaje = mensajeBase
    .replace(/{usuario}/g, username)
    .replace(/{grupo}/g, groupMetadata.subject)
    .replace(/{desc}/g, `*${desc}*`);
    
  const caption = `🌱 Adiós de *"_${groupMetadata.subject}_"*\n🌾 _Usuario_ » ${username}\n🌵 ${mensaje}\n🌑 _Ahora somos ${groupSize} Miembros._\n🌾 Fecha » ${fecha}\n🌱 ¡Te esperamos pronto!\n> *➮ Puedes usar _#help_ para ver la lista de comandos.*`;

  return {
    pp,
    caption,
    contextInfo: {
      externalAdReply: {
        title: 'Shadow - Bot',
        body: 'Shadow - MD',
        thumbnailUrl: 'https://files.catbox.moe/12zb63.jpg',
        mediaType: 1,
        renderLargerThumbnail: true,
        showAdAttribution: true,
        sourceUrl: null
      }
    }
  };
}

let handler = m => m;

handler.before = async function (m, { conn, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) {
    return true;
  }

  const chat = global.db.data.chats[m.chat];
  const primaryBot = chat.primaryBot;
  if (primaryBot && conn.user.jid !== primaryBot) {
    return false;
  }

  const userId = m.messageStubParameters && m.messageStubParameters[0];
  if (!userId) {
    return false;
  }

  if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    const { pp, caption, contextInfo } = await generarBienvenida({ conn, userId, groupMetadata, chat });
    
    await conn.sendMessage(m.chat, {
      image: { url: pp },
      caption,
      mentions: [userId], 
      contextInfo
    }, { quoted: null });
    
  } else if (chat.welcome && 
             (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE || 
              m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE)) {
    const { pp, caption, contextInfo } = await generarDespedida({ conn, userId, groupMetadata, chat });
    
    await conn.sendMessage(m.chat, {
      image: { url: pp },
      caption,
      mentions: [userId], 
      contextInfo
    }, { quoted: null });
  }

  return true; 
};

export { generarBienvenida, generarDespedida };
export default handler;
