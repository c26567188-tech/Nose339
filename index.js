import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import pino from 'pino'

const BOT_NAME = '🍥 Obito - Nose339'
const OWNER = 'c26567188-tech'
const TU_NUMERO = '51935313602'

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./sesion-obito')
  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    auth: state,
    printQRInTerminal: false,
    browser: ['Obito - Nose339', 'Chrome', '1.0']
  })

  sock.ev.on('creds.update', saveCreds)

  if (!sock.authState.creds.registered) {
    console.log('🍥 Pidiendo codigo para Obito...')
    await new Promise(r => setTimeout(r, 3000))
    try {
      const code = await sock.requestPairingCode(TU_NUMERO)
      console.log(`\n👑 TU CODIGO DE OBITO ES: ${code}\n`)
      console.log('Ve a WhatsApp > Dispositivos vinculados > Vincular con numero y pon ese codigo')
    } catch (e) {
      console.log('Error pidiendo codigo:', e)
    }
  }

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('Obito desconectado, reintentando...')
      if (shouldReconnect) start()
    } else if (connection === 'open') {
      console.log('✅ OBITO CONECTADO - Nose339 ACTIVO')
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message || m.key.fromMe) return
    const from = m.key.remoteJid
    const text = m.message.conversation || m.message.extendedTextMessage?.text || ''
    const isGroup = from.endsWith('@g.us')
    if (!text.startsWith('.')) return

    const cmd = text.split(' ')[0].toLowerCase()
    const args = text.slice(cmd.length).trim()
    const pushname = m.pushName || 'Ninja'

    const reply = async (txt) => {
      await sock.sendMessage(from, { text: txt }, { quoted: m })
    }

    // ===== MENU PRINCIPAL =====
    if (cmd === '.menu' || cmd === '.help' || cmd === '.ayuda' || cmd === '.bot' || cmd === '.comandos') {
      await reply(`🍥 *${BOT_NAME}*
━━━━━━━━━━━━━━━━━━
Hola @${pushname} soy Obito Uchiha.

*👑 MENÚ PRINCIPAL:*

*🔥 OBITO:*
- .obito
- .kamui
- .rin
- .madara
- .sharingan

*🎵 DIVERSIÓN:*
- .play + cancion
- .sticker
- .hola
- .info

*👑 INFO:*
- .ping
- .owner
- .creador
- .nose339

━━━━━━━━━━━━━━━━━━
*🔥 Nose339 - Bots para todos*
Creador: ${OWNER}`)
    }

    // ===== OBITO =====
    else if (cmd === '.obito') {
      await reply(`🍥 *Yo soy Obito Uchiha...*

El héroe que se convirtió en villano.
El que perdió a Rin y quiso crear un mundo nuevo.

Ahora vivo en Nose339.
Mi Kamui te protege.

"No hay esperanza en este mundo..." pero conmigo sí hay bots 😈`)
    }
    else if (cmd === '.kamui') {
      await reply(`🌀 *¡KAMUI!* 🌀

*Te he mandado a otra dimensión...*

Ahí no hay lag, no hay enemigos.
Solo Nose339 y yo.

¿Quieres volver? Escribe .menu`)
    }
    else if (cmd === '.rin') {
      await reply(`💔 *Rin Nohara...*

Ella fue mi luz.
Por ella hice todo lo que hice.

Rin... siempre te protegeré.
Aunque sea en otra dimensión.`)
    }
    else if (cmd === '.madara') {
      await reply(`👺 *Madara Uchiha...*

Él me encontró cuando estaba roto.
Me enseñó el Plan Ojo de Luna.

Pero yo ya no soy su peón.
Ahora soy Obito de Nose339.`)
    }
    else if (cmd === '.sharingan') {
      await reply(`👁️ *¡SHARINGAN ACTIVADO!*

Veo todo.
Veo tu chakra, veo tus movimientos.

Nadie puede engañar al Sharingan de Obito.
Nose339 está bajo mi mirada.`)
    }

    // ===== DIVERSIÓN =====
    else if (cmd === '.ping') {
      await reply(`🍥 *PONG!*
Obito está vivo... Kamui activo ⚡
Velocidad: Rápido como el Kamui
Estado: Conectado en Nose339`)
    }
    else if (cmd === '.hola' || cmd === '.hi' || cmd === '.hello') {
      await reply(`🍥 Hola @${pushname}! 👋

Bienvenido a Nose339.
Yo soy Obito, ¿qué quieres hacer hoy?
Escribe .menu para ver todo lo que puedo hacer.`)
    }
    else if (cmd === '.play') {
      if (!args) return reply(`🎧 *¿Qué quieres escuchar?*\n\nEscribe: .play + nombre\nEjemplo: .play Naruto opening\nEjemplo: .play Bad Bunny`)
      await reply(`🎧 *Buscando:* ${args}\n\nObito está buscando tu música en la dimensión Kamui...\nEspera un momento 🌀\n\n_Esta función de música se activa con tu API en la próxima actualización_`)
    }
    else if (cmd === '.sticker') {
      await reply(`🍥 *STICKER OBITO*

Manda una foto o video con el caption .sticker y te lo convierto en sticker al estilo Obito!

Prueba ahora: manda una foto y pon .sticker`)
    }
    else if (cmd === '.info' || cmd === '.bot' && false) {
      await reply(`🍥 *INFO DE OBITO*\n\nNombre: Obito - Nose339\nCreador: ${OWNER}\nVersión: 1.0\nEstado: Activo ✅\nPlataforma: GitHub + Render\n\nBots para todos - Nose339`)
    }

    // ===== INFO / OWNER =====
    else if (cmd === '.owner' || cmd === '.creador' || cmd === '.dueño') {
      await reply(`👑 *Mi creador es:* ${OWNER}\n\nEl que me trajo de vuelta con Nose339.\nRespétalo, es el Hokage de este bot.\n\nSi quieres tu propio bot, habla con él.`)
    }
    else if (cmd === '.nose339') {
      await reply(`🔥 *NOSE339 - BOTS PARA TODOS*

Somos la comunidad de bots más chimba.

¿Quieres tu propio bot como Obito?
Habla con el creador: ${OWNER}

*Bots, diversión y Kamui para todos.*`)
    }
    else if (cmd === '.info') {
      await reply(`🍥 *INFO DE OBITO*

Nombre: Obito - Nose339
Creador: ${OWNER}
Versión: 1.0 GitHub
Estado: Activo ✅
Grupo: ${isGroup ? 'Si, estoy en grupo' : 'No, chat privado'}

Escribe .menu para ver comandos`)
    }
  })
}

start()
