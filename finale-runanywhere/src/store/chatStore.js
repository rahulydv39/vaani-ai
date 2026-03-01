// ─── Chat Store — localStorage-backed conversation persistence ───────────────

const STORAGE_KEY = 'vaani-ai-conversations'
const MAX_CONVERSATIONS = 50

function getAll() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : []
    } catch {
        return []
    }
}

function saveAll(conversations) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
    } catch (e) {
        console.warn('Failed to save conversations:', e)
    }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function loadConversations() {
    return getAll().sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getConversation(id) {
    return getAll().find((c) => c.id === id) || null
}

export function createConversation() {
    const conv = {
        id: crypto.randomUUID(),
        title: 'New Conversation',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
    }
    const all = getAll()
    all.unshift(conv)
    // Keep max conversations
    if (all.length > MAX_CONVERSATIONS) all.length = MAX_CONVERSATIONS
    saveAll(all)
    return conv
}

export function addMessage(conversationId, role, content) {
    const all = getAll()
    const conv = all.find((c) => c.id === conversationId)
    if (!conv) return null

    const message = {
        id: crypto.randomUUID(),
        role, // 'user' | 'assistant'
        content,
        timestamp: Date.now(),
    }

    conv.messages.push(message)
    conv.updatedAt = Date.now()

    // Auto-title from first user message
    if (conv.title === 'New Conversation' && role === 'user' && content) {
        conv.title = content.slice(0, 40) + (content.length > 40 ? '…' : '')
    }

    saveAll(all)
    return message
}

export function updateLastAssistantMessage(conversationId, content) {
    const all = getAll()
    const conv = all.find((c) => c.id === conversationId)
    if (!conv) return

    // Find last assistant message
    for (let i = conv.messages.length - 1; i >= 0; i--) {
        if (conv.messages[i].role === 'assistant') {
            conv.messages[i].content = content
            conv.updatedAt = Date.now()
            saveAll(all)
            return
        }
    }
}

export function deleteConversation(id) {
    const all = getAll().filter((c) => c.id !== id)
    saveAll(all)
}

export function getRecentMessages(conversationId, count = 10) {
    const conv = getConversation(conversationId)
    if (!conv) return []
    return conv.messages.slice(-count)
}
