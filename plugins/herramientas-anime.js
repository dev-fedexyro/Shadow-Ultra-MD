import fetch from 'node-fetch';

let handler = async (m, { conn, command }) => {
    const apiUrl = 'https://shadow-apis.vercel.app/random/ba';

    try {
        await m.react('⏳');

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`La API respondió con estado ${response.status}`);
        }

        const data = await response.json();

        if (!data || !data.image || typeof data.image !== 'string') {
            throw new Error('La respuesta de la API no contiene una URL de imagen válida.');
        }

        const imageUrl = data.image;

        await conn.sendFile(m.chat, imageUrl, 'anime.jpg', '🌵 imagen random:', m);
        
    } catch (error) {
        console.error('Error al obtener la imagen de anime:', error);
        await m.reply(`❌ Ocurrió un error al intentar comunicarme con la API o al procesar la imagen: ${error.message}`);
    }
}

handler.help = ['anime'];
handler.tags = ['herramientas', 'imagen'];
handler.command = ['anime'];

export default handler;
