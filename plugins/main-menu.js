import fs from 'fs';
import fetch from 'node-fetch';

const getBuffer = async (url) => {
    try {
        const res = await fetch(url);
        if (res.status !== 200) {
            console.error(`Error al descargar la imagen: Código de estado ${res.status}`);
            return null;
        }
        return await res.buffer();
    } catch (e) {
        console.error("Error en getBuffer:", e);
        return null;
    }
};

let tags = {
    info: '𓂂𓏸  𐅹੭੭   *`𝖨𝗇ẜᨣ`* 🪐 ᦡᦡ',
    anime: '𓂂𓏸  𐅹੭੭   *`𝖠𝗇ı𝗆ᧉ`* 🥞 ᦡᦡ',
    buscador: '𓂂𓏸  𐅹੭੭   *`Ｓᧉ𝖺ꭇ𝖼𝗁`* 🌿 ᦡᦡ',
    downloader: '𓂂𓏸  𐅹੭੭   *`𝖣ᨣ𝗐𝗇𝗅ᨣ𝖺𝖽ᧉꭇ𝗌`* 🍇 ᦡᦡ',
    economy: '𓂂𓏸  𐅹੭੭   *`𝖾𝖼𝗈𝗆𝗈𝗆𝗂𝖺`* 🌵 ᦡᦡ',
    fun: '𓂂𓏸  𐅹੭੭   *`𝖥𝗎𝗇`* 🌱 ᦡᦡ',
    group: '𓂂𓏸  𐅹੭੭   *`Gꭇußꭇ𝗎𝗉ᨣ𝗌`* ☕ ᦡ',
    ai: '𓂂𓏸  𐅹੭੭   *`𝖨𝗇ƚᧉ𝖨ı𝗀ᧉ𝗇𝖼ı𝖺𝗌`* 🧋 ᦡᦡ',
    game: '𓂂𓏸  𐅹੭੭   *`Game`* 🥞 ᦡᦡ',
    serbot: '𓂂𓏸  𐅹੭੭   *`𝖩𝖺𝖽ı-ᗷᨣƚ𝗌`* 🍂 ᦡᦡ',
    main: '𓂂𓏸  𐅹੭੭   *`𝖯ꭇ𝗂𝗇𝖼𝗂𝗉𝖺𝗅`* ☁️ ᦡᦡ',
    nable: '𓂂𓏸  𐅹੭੭   *`𝖮𝗇-𝖮ẜẜ`* 🍭 ᦡᦡ',
    nsfw: '𓂂𓏸  𐅹੭੭   *`𝖭𝗌ẜɯ`* 🪼 ᦡᦡ',
    owner: '𓂂𓏸  𐅹੭੭   *`Oɯ𝗇ᧉꭇ`* 🧇 ᦡᦡ',
    sticker: '𓂂𓏸  𐅹੭੭   *`𝖲ƚ𝗂𝖼𝗄ᧉꭇ`* ☘ ᦡᦡ',
    herramientas: '𓂂𓏸  𐅹੭੭   *`𝖨𝗇ƚᧉꭇ𝗇ᧉƚ`* 🌻 ᦡᦡ'
};

function clockString(seconds) {
    let h = Math.floor(seconds / 3600);
    let m = Math.floor(seconds % 3600 / 60);
    let s = Math.floor(seconds % 60);
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

let handler = async (m, { conn, args}) => {
    let userId = m.mentionedJid?.[0] || m.sender;
    let categories = {};

    let nombre = await conn.getName(m.sender);
    let user = global.db.data.users[m.sender];
    let premium = user?.premium ? 'sɪ́' : 'ɴᴏ';
    let totalreg = Object.keys(global.db.data.users).length;
    let groupsCount = Object.values(conn.chats).filter(v => v.id.endsWith('@g.us')).length;
    let uptime = clockString(process.uptime());
    
    const defaultTag = 'Otros';

    for (let plugin of Object.values(global.plugins)) {
        if (plugin.help && plugin.tags) {
            for (let tag of plugin.tags) {
                if (!categories[tag]) categories[tag] = [];
                categories[tag].push(...plugin.help.map(cmd => `${cmd}`));
            }
        } else if (plugin.command) {
            let cmdArray = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
            
            let displayCmd = cmdArray[0]; 

            let tagKey = plugin.tags && plugin.tags.length > 0 ? plugin.tags[0] : defaultTag;
            
            if (!categories[tagKey]) categories[tagKey] = [];
            
            if (!categories[tagKey].includes(displayCmd)) {
                 categories[tagKey].push(displayCmd);
            }
        }
    }

    let infoUser = `
❐ 𝖧𝗈𝗅𝖺, 𝖲𝗈𝗒 *_𝖲𝗁𝖺𝖽𝗈𝗐 - 𝖡𝗈𝗍_* 🌱

╰┈□ 𝖨𝖭𝖥𝖮-𝖴𝖲𝖤𝖱
❐ _𝖴𝗌𝗎𝖺𝗋𝗂𝗈:_ ${nombre}
❐ _𝖯𝗋𝖾𝗆𝗂𝗎𝗆:_ ${premium}
❐ _𝖱𝖾𝗀𝗂𝗌𝗍𝗋𝖺𝖽𝗈𝗌:_ ${totalreg}

╰┈□ 𝖨𝖭𝖥𝖮-𝖡𝖮𝖳
❐ _𝖳𝗂𝖾𝗆𝗉𝗈 𝖺𝖼𝗍𝗂𝗏𝗈:_ ${uptime}
❐ _𝖦𝗋𝗎𝗉𝗈𝗌 𝖺𝖼𝗍𝗂𝗏𝗈𝗌:_ ${groupsCount}
❐ _𝖥𝖾𝖼𝗁𝖺:_ ${new Date().toLocaleString('es-ES')}
`.trim();

    let menuText = infoUser + '\n\n';

    for (let [tag, cmds] of Object.entries(categories)) {
        let tagName = tags[tag] || `𓂂𓏸  𐅹੭੭   *`${tag.toUpperCase()}`* 🌾 ᦡᦡ`;
        menuText += `${tagName}\n${cmds.map(cmd => `➩ ${cmd}`).join('\n')}\n\n`;
    }

    await conn.sendMessage(m.chat, {
        text: menuText,
        contextInfo: {
            externalAdReply: {
                title: global.canalNombreM[0],
                body: '𝖲𝗁𝖺𝖽𝗈𝗐 - 𝖡𝗈𝗍',
                thumbnailUrl: 'https://files.catbox.moe/12zb63.jpg',
                sourceUrl: 'https://github.com/Shadows-club',
                mediaType: 1,
                renderLargerThumbnail: true
            },
            mentionedJid: [m.sender, userId],
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.canalIdM[0],
                newsletterName: '𝖲𝗁𝖺𝖽𝗈𝗐 - 𝖡𝗈𝗍',
                serverMessageId: -1
            }
        }
    }, { quoted: m});
};

handler.help = ['menu', 'menú', 'help'];
handler.tags = ['main'];
handler.command = ['menu', 'menú', 'help'];
handler.register = true;

export default handler;
