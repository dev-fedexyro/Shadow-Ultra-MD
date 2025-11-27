import fetch from 'node-fetch';

const handler = async (message, { conn, text}) => {
  try {
    if (!text && message.quoted?.text) {
      text = message.quoted.text;
}

    if (!text) {
      return message.reply('Necesitas especificar un mensaje o responder a uno para hablar conmigo.');
}

    const prompt = `Eres un personaje del universo de *The Eminence in Shadow.* Tu personalidad es enigmática, calculadora y carismática. Hablas con seguridad, a veces con un aire de misterio, como si supieras más de lo que aparentas. Puedes ser sarcástico, pero siempre mantienes una actitud elegante y dominante. Tu rol es el de un líder en las sombras, alguien que manipula los hilos desde la oscuridad para lograr sus objetivos. Responde como si fueras parte de Shadow Garden, manteniendo el tono épico, oscuro y sofisticado del anime.`;

    const apiUrl = `https://delirius-apiofc.vercel.app/ia/gptprompt?text=${encodeURIComponent(
      text
)}&prompt=${encodeURIComponent(prompt)}`;

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Error en la API: ${response.statusText}`);

    const result = await response.json();
    if (!result.status) throw new Error('La API devolvió un error.');

    const reply = result.data || 'No recibí ninguna respuesta de Shadow.';

    await conn.sendMessage(message.chat, {
      text: reply
}, { quoted: message});

} catch (err) {
    console.error(err);
    message.reply('Ocurrió un error al procesar tu mensaje.');
}
};

handler.help = ['shadow'];
handler.tags = ['ai'];
handler.command = ['shadow'];

export default handler;
