import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import pino from 'pino'

const BOT_NAME = '🍥 Obito - Nose339'
const OWNER = 'c26567188-tech'

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('sesion-obito')
  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    auth: state,
    printQRInTerminal: true,
    browser: ['Obito - Nose339', 'Chrome', '1.0']
  })

  sock.ev.on('creds.update', saveCreds)

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
    if (!text.startsWith('.')) return

    const cmd = text.split(' ')[0].toLowerCase()
    const args = text.slice(cmd.length).trim()

    const reply = async
