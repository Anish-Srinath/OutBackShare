import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  getClaimThread, getClaimMessages, sendClaimMessage,
  markClaimMessagesRead, uploadPublicKey, getPublicKeys,
} from '../services/api'
import {
  generateEphemeralKeyPair, exportPublicKeyJwk, importPublicKeyJwk,
  deriveSharedKey, encryptMessage, decryptMessage,
} from '../utils/cryptoChat'
import '../styles/ChatModal.css'

const POLL_INTERVAL_MS = 4000

export default function ChatModal({ claimId, listingTitle, orgCode, onClose }) {
  const [messages, setMessages] = useState([])
  const [thread, setThread] = useState(null)
  const [inputText, setInputText] = useState('')
  const [status, setStatus] = useState('loading')
  const [cryptoPhase, setCryptoPhase] = useState('init') // 'init'|'uploading'|'waiting_peer'|'ready'
  const [sending, setSending] = useState(false)

  const messagesEndRef = useRef(null)
  const pollRef = useRef(null)
  const keyPairRef = useRef(null)       // ephemeral CryptoKeyPair — private key never leaves browser
  const sharedKeyRef = useRef(null)     // derived AES-GCM CryptoKey
  const lastPeerKeyRef = useRef(null)   // peer JWK string used at last derivation — re-derive when it changes
  const threadRef = useRef(null)        // mirrors thread state for use in interval closure
  const cryptoPhaseRef = useRef('init') // mirrors cryptoPhase to avoid stale interval closure

  // Keep both state and ref in sync
  const setPhase = useCallback((phase) => {
    cryptoPhaseRef.current = phase
    setCryptoPhase(phase)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Decrypt a single message row from the API.
  // Falls back to showing the raw content if the key isn't ready yet.
  const decryptRow = useCallback(async (m) => {
    let text = m.content
    if (m.iv && sharedKeyRef.current) {
      try {
        text = await decryptMessage(sharedKeyRef.current, m.content, m.iv)
      } catch {
        text = '[encrypted — key mismatch]'
      }
    }
    return { id: m.message_id, sender: m.sender_org_code, text, time: m.sent_at }
  }, [])

  const fetchMessages = useCallback(async () => {
    try {
      const rows = await getClaimMessages(claimId, orgCode)
      const decrypted = await Promise.all(rows.map(decryptRow))
      setMessages(decrypted)
      markClaimMessagesRead(claimId, orgCode).catch(() => {})
    } catch {
      // Non-fatal — keep polling
    }
  }, [claimId, orgCode, decryptRow])

  // Try to get the peer's public key and derive the shared AES key.
  // Returns true if a (new) key was derived, false if the peer hasn't
  // uploaded yet or their key is unchanged since last derivation.
  const tryDeriveSharedKey = useCallback(async (t) => {
    try {
      const keys = await getPublicKeys(claimId, orgCode)
      const isClaimer = orgCode.toUpperCase() === String(t.claiming_org_code || '').toUpperCase()
      const peerKeyStr = isClaimer ? keys.donor_public_key : keys.claiming_public_key
      if (!peerKeyStr || !keyPairRef.current) return false

      // Short-circuit: if the peer key string hasn't changed since the last
      // successful derivation, the shared key is still valid.
      if (peerKeyStr === lastPeerKeyRef.current) return false

      const peerCryptoKey = await importPublicKeyJwk(JSON.parse(peerKeyStr))
      sharedKeyRef.current = await deriveSharedKey(
        keyPairRef.current.privateKey,
        peerCryptoKey,
        t.donor_org_code,
        t.claiming_org_code,
        t.listing_id,
      )
      lastPeerKeyRef.current = peerKeyStr
      setPhase('ready')
      return true
    } catch {
      return false
    }
  }, [claimId, orgCode, setPhase])

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      try {
        // 1. Fetch thread metadata
        const t = await getClaimThread(claimId, orgCode)
        if (cancelled) return
        setThread(t)
        threadRef.current = t
        setStatus(t.is_closed ? 'closed' : 'ready')

        // 2. Generate ephemeral key pair and upload own public key
        setPhase('uploading')
        const kp = await generateEphemeralKeyPair()
        if (cancelled) return
        keyPairRef.current = kp
        const jwk = await exportPublicKeyJwk(kp)
        await uploadPublicKey(claimId, orgCode, JSON.stringify(jwk))
        if (cancelled) return

        // 3. Try to derive shared key (peer may already be connected)
        const derived = await tryDeriveSharedKey(t)
        if (cancelled) return
        if (!derived) setPhase('waiting_peer')

        // 4. Load messages — decrypted if shared key is already available
        await fetchMessages()
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    init()

    pollRef.current = setInterval(async () => {
      if (cancelled) return
      // Always re-check the peer's public key, not just when waiting. If the
      // peer refreshed their browser they will have uploaded a NEW ephemeral
      // public key — we must re-derive against the new key, otherwise we
      // keep decrypting their fresh messages with a stale shared key and
      // every new message shows up as "[encrypted — key mismatch]".
      // tryDeriveSharedKey is a no-op when the peer key is unchanged.
      if (threadRef.current && cryptoPhaseRef.current !== 'init') {
        const derived = await tryDeriveSharedKey(threadRef.current)
        if (derived) {
          // New key — re-fetch so any messages encrypted with the new key
          // are decrypted on this cycle.
          await fetchMessages()
          return
        }
      }
      await fetchMessages()
    }, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(pollRef.current)
      // Erase ephemeral key material from memory (forward secrecy)
      keyPairRef.current = null
      sharedKeyRef.current = null
      lastPeerKeyRef.current = null
    }
  }, [claimId, orgCode, fetchMessages, tryDeriveSharedKey, setPhase])

  const handleSend = async () => {
    const text = inputText.trim()
    if (!text || sending || status !== 'ready' || cryptoPhase !== 'ready') return

    setSending(true)
    try {
      const { ciphertext, iv } = await encryptMessage(sharedKeyRef.current, text)
      const msg = await sendClaimMessage(claimId, { senderOrgCode: orgCode, content: ciphertext, iv })
      // Show the original plaintext in the local message list (optimistic update)
      setMessages((prev) => [
        ...prev,
        { id: msg.message_id, sender: msg.sender_org_code, text, time: msg.sent_at },
      ])
      setInputText('')
    } catch {
      // ignore
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const isMe = (sender) => String(sender || '').toUpperCase() === String(orgCode || '').toUpperCase()

  const canSend = status === 'ready' && cryptoPhase === 'ready'

  const cryptoLabel = {
    init: 'Setting up secure channel…',
    uploading: 'Setting up secure channel…',
    waiting_peer: 'Waiting for peer to connect…',
    ready: 'End-to-end encrypted',
  }

  const statusLabel = {
    loading: 'Connecting…',
    ready: cryptoLabel[cryptoPhase] ?? 'End-to-end encrypted',
    closed: 'Chat closed — pickup confirmed.',
    error: 'Connection error. Please close and try again.',
  }

  const statusIcon = () => {
    if (status === 'loading') return 'sync'
    if (status === 'closed') return 'check_circle'
    if (status === 'error') return 'error'
    return cryptoPhase === 'ready' ? 'lock' : 'lock_clock'
  }

  return (
    <div className="chat-overlay" onClick={handleOverlayClick}>
      <div className="chat-modal" role="dialog" aria-modal="true" aria-label="Claim Chat">

        <div className="chat-header">
          <div className="chat-header-left">
            <span className="material-symbols-outlined chat-header-icon">forum</span>
            <div>
              <h3 className="chat-title">{listingTitle}</h3>
              {thread && (
                <p className="chat-subtitle">
                  {thread.donor_org_code} ↔ {thread.claiming_org_code}
                </p>
              )}
            </div>
          </div>
          <button className="chat-close-btn" onClick={onClose} aria-label="Close chat">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className={`chat-status-bar status-${status}`}>
          <span className="material-symbols-outlined chat-status-icon">{statusIcon()}</span>
          <span className="chat-status-text">{statusLabel[status]}</span>
        </div>

        <div className="chat-messages">
          {messages.length === 0 && status === 'ready' && (
            <div className="chat-empty">
              <span className="material-symbols-outlined">
                {cryptoPhase === 'ready' ? 'chat_bubble_outline' : 'lock_clock'}
              </span>
              <p>
                {cryptoPhase === 'ready'
                  ? 'No messages yet. Start the conversation.'
                  : cryptoPhase === 'waiting_peer'
                    ? 'Waiting for peer to open chat to establish encryption…'
                    : 'Establishing secure channel…'}
              </p>
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`chat-row ${isMe(m.sender) ? 'chat-row-me' : 'chat-row-them'}`}
            >
              <div className={`chat-bubble ${isMe(m.sender) ? 'bubble-me' : 'bubble-them'}`}>
                <span className="bubble-sender">{isMe(m.sender) ? 'You' : m.sender}</span>
                <span className="bubble-text">{m.text}</span>
                <span className="bubble-time">
                  {m.time
                    ? new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : ''}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {status === 'ready' && (
          <div className="chat-input-row">
            <textarea
              className="chat-input"
              placeholder={canSend ? 'Type a message… (Enter to send)' : 'Waiting for end-to-end encryption…'}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              maxLength={1000}
              disabled={sending || !canSend}
            />
            <button
              className="chat-send-btn"
              onClick={handleSend}
              disabled={!inputText.trim() || sending || !canSend}
              aria-label="Send message"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
