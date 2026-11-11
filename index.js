import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import pino from 'pino'
import readline from 'readline'

const BOT_NAME = '🍥 Obito - Nose339'
const OWNER = 'c26567188-tech'

// PON TU NUMERO AQUI SIN + NI ESPACIOS
// Ejemplo Peru: 51987654321
const TU_NUMERO = '51XXXXXXXXX'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (txt) => new Promise(r => rl.question(txt, r))

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('sesion-obito')
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
      if (shouldReconnect) start()
    } else if (connection === 'open') {
      console.log('✅ OBITO CONECTADO - Nose339 ACTIVO')
      rl.close()
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message || m.key.fromMe) return
    const from = m.key.remoteJid
    const text = m.message.conversation || m.message.extendedTextMessage?.text || ''
    if (!text.startsWith('.')) return
    const cmd = text.split(' ')[0].toLowerCase()
    const args = text.slice(cmd.length).trim()
    const reply = async (txt) => {
      await sock.sendMessage(from, { text: txt }, { quoted: m })
    }

    if (cmd === '.menu' || cmd === '.help' || cmd === '.obito') {
      await reply(`🍥 *${BOT_NAME}*\n━━━━━━━━━━━━━━━\nSoy Obito Uchiha.\n\n*COMANDOS:*\n- .menu\n- .ping\n- .play + cancion\n- .sticker\n- .kamui\n- .owner\n\n*Nose339 - Bots para todos*`)
    }
    else if (cmd === '.ping') {
      await reply('🍥 *PONG!* Obito esta vivo... Kamui activo ⚡')
    }
    else if (cmd === '.kamui') {
      await reply('🌀 *¡KAMUI!* Te he mandado a otra dimension...')
    }
    else if (cmd === '.owner') {
      await reply(`👑 Mi creador es: ${OWNER}`)
    }
    else if (cmd === '.play') {
      if (!args) return reply('Escribe: .play + nombre')
      await reply(`🎧 Buscando: ${args}...`)
    }
  })
}

start()
