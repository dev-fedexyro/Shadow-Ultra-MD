import { fileURLToPath } from 'url'
import { watch } from 'fs'

const videoUrl = 'https://cdn.russellxz.click/14cf14e9.mp4';

const handler = async (m, { conn, command }) => {
    
    if (command === 'shadow') {
        
        const caption = '👻 Vídeo de Shadow'; 

        try {

          await conn.sendMessage(m.chat, {
                video: { url: videoUrl },
                caption: caption,
                mimetype: 'video/mp4'
            }, { quoted: m });

        } catch (error) {
            console.error('Error al enviar el video de Shadow:', error);
            m.reply('❌ Lo siento, hubo un error al enviar el video.');
        }
    }
};

handler.help = ['shadow']; 
handler.tags = ['herramientas']; 
handler.command = ['shadow']; 
handler.customPrefix = /^(shadow|Shadow)$/i;
handler.fail = null;

export default handler;
