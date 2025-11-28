import fetch from 'node-fetch';

let handler = async (m, { conn, text, command, usedPrefix }) => {
    if (!text) {
        return m.reply(`❌ Por favor, proporciona el texto para el sticker.\n\nEjemplo de uso:\n${usedPrefix}${command} Hola Mundo`);
    }

    let apiUrl;
    let successMessage;
    let mimeType;
    let isVideo = false;

    const encodedText = encodeURIComponent(text);

    if (command === 'brat') {
        apiUrl = `https://shadow-apis.vercel.app/maker/brat?text=${encodedText}`;
        successMessage = '🌵 Sticker Brat estático creado.';
        mimeType = 'image/webp';
        isVideo = false;
    } else if (command === 'bratvid') {
        apiUrl = `https://shadow-apis.vercel.app/maker/bratvid?text=${encodedText}`;
        successMessage = '🌵 Sticker Brat de video creado.';
        mimeType = 'video/mp4'; 
        isVideo = true;
    } else {
        return;
    }

    try {
        await m.react('⏳');

        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            let errorText = `La API respondió con estado ${response.status}`;
            try {
                const responseBody = await response.text();
                const errorJson = JSON.parse(responseBody);
                errorText += `: ${errorJson.message || responseBody}`;
            } catch {
            }
            throw new Error(`[API Fallida] ${errorText}. La API podría estar caída o el texto es muy largo.`);
        }

        const buffer = await response.buffer();

        if (buffer.length === 0) {
            throw new Error('La API devolvió una respuesta vacía (0 bytes).');
        }

        await conn.sendFile(
            m.chat, 
            buffer, 
            'sticker.webp',
            successMessage, 
            m, 
            false, 
            { asSticker: true, mimetype: isVideo ? 'video/webp' : 'image/webp' }
        );

        await m.react('✅');
        
    } catch (error) {
        console.error('Error al crear el sticker:', error);
        await m.reply(`❌ Ocurrió un error al intentar crear el sticker: ${error.message}`);
        await m.react('❌');
    }
}

handler.help = ['brat <texto>', 'bratvid <texto>'];
handler.tags = ['sticker'];
handler.command = ['brat', 'bratvid'];

export default handler;
