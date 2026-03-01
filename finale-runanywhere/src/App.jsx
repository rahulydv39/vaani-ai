import { useState, useCallback, useRef, useEffect } from 'react'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { ChatArea } from './components/ChatArea'
import { MicButton } from './components/MicButton'
import { ModeSwitcher } from './components/ModeSwitcher'
import { Quiz } from './components/Quiz'
import { GrammarView } from './components/GrammarView'
import { DictionaryView } from './components/DictionaryView'
import { HistoryView } from './components/HistoryView'
import { AboutView } from './components/AboutView'
import { ContactView } from './components/ContactView'
import { PrivacyView } from './components/PrivacyView'
import { DebugPanel } from './components/DebugPanel'
import { useAppState, useAppActions, AppStatus } from './store/appStore'
import { addDebugLog, DebugCategory } from './store/debugStore'
import { initAI, checkWebGPU, getAccelerationMode, AudioPlayback, TTS } from './ai/aiEngine'
import { initAIWorker, abortAllWorkerRequests } from './ai/aiWorkerClient'
import { generateResponse, generateQuiz, getSystemPrompt, parseTeachingResponse } from './ai/llm'
import { startVoiceSession, stopVoiceSession, finishListening } from './ai/voicePipeline'
import * as chatStore from './store/chatStore'

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ message, onDismiss }) {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 4000)
        return () => clearTimeout(timer)
    }, [onDismiss])
    if (!message) return null
    return (
        <div className="toast-notification" onClick={onDismiss}>
            <span className="toast-icon">{'\u26A0\uFE0F'}</span>
            <span className="toast-text">{message}</span>
        </div>
    )
}

export default function App() {
    const state = useAppState()
    const actions = useAppActions()

    const [conversations, setConversations] = useState(() => chatStore.loadConversations())
    const [activeConvId, setActiveConvId] = useState(null)
    const [messages, setMessages] = useState([])
    const [streamingText, setStreamingText] = useState('')
    const [textInput, setTextInput] = useState('')
    const [toast, setToast] = useState('')
    const [debugVisible, setDebugVisible] = useState(false)
    const [workerReady, setWorkerReady] = useState(false)

    const isStartedRef = useRef(false)
    const inputRef = useRef(null)
    const quizAbortCtrlRef = useRef(null)

    const showToast = useCallback((msg) => { console.warn('[TOAST]', msg); setToast(msg) }, [])

    const aiReady = state.status === AppStatus.READY && workerReady
    const isReady = state.status !== AppStatus.IDLE &&
        state.status !== AppStatus.INITIALIZING &&
        state.status !== AppStatus.DOWNLOADING &&
        state.status !== AppStatus.WARMING_UP

    // Safety watchdog removed as per user request to rely on exact stage timeouts.

    // ─── Debug panel toggle (Ctrl+D) ────────────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault()
                setDebugVisible((prev) => !prev)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    // ─── Document Visibility (Cancel on tab switch) ─────────────────────────
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                console.log('[App] Tab hidden -> aborting tasks')
                abortAllWorkerRequests()
                stopVoiceSession()
            }
        }
        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [])

    // ─── Auto-init on mount (runs ONCE, never restarts) ───────────────────────
    useEffect(() => {
        if (isStartedRef.current) return
        isStartedRef.current = true
            ; (async () => {
                try {
                    actions.setWebGPU(checkWebGPU())
                    actions.setStatus(AppStatus.INITIALIZING)
                    addDebugLog(DebugCategory.STATE, 'Model loading...')

                    // Single one-time init — skips download if models already cached
                    actions.setStatus(AppStatus.DOWNLOADING)
                    await initAI((p) => actions.setProgress(p))
                    actions.setAcceleration(getAccelerationMode())

                    // Worker init — fire-and-forget, ONE attempt, never blocks READY
                    initAIWorker().then((ok) => {
                        if (ok) addDebugLog(DebugCategory.WORKER, 'Worker ready')
                        setWorkerReady(true) // unlock mic regardless
                    })

                    // Warmup phase
                    actions.setStatus(AppStatus.WARMING_UP)
                    addDebugLog(DebugCategory.STATE, 'Warming up AI...')
                    try {
                        await generateResponse('Hello', [], () => { }, 'english')
                        addDebugLog(DebugCategory.STATE, 'Warmup complete')
                    } catch (warmupErr) {
                        console.warn('[WARMUP] generation failed (non-fatal):', warmupErr)
                    }

                    actions.setStatus(AppStatus.READY)
                    if (!activeConvId) {
                        const conv = chatStore.createConversation()
                        setActiveConvId(conv.id)
                        setConversations(chatStore.loadConversations())
                    }
                } catch (err) {
                    console.error('[INIT] Failed:', err)
                    addDebugLog(DebugCategory.ERROR, `Failed: ${err.message}`)
                    actions.setError(err.message || 'Failed to initialize')
                    // isStartedRef stays true — prevents any re-init
                }
            })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ─── Conversation CRUD ─────────────────────────────────────────────────
    const loadConversation = useCallback((id) => {
        const conv = chatStore.getConversation(id)
        if (conv) { setActiveConvId(id); setMessages(conv.messages || []) }
        actions.setActiveView('conversation')
    }, [actions])

    const startNewConversation = useCallback(() => {
        const conv = chatStore.createConversation()
        setActiveConvId(conv.id)
        setMessages([])
        setConversations(chatStore.loadConversations())
    }, [])

    const deleteConversation = useCallback((id) => {
        chatStore.deleteConversation(id)
        setConversations(chatStore.loadConversations())
        if (id === activeConvId) { setActiveConvId(null); setMessages([]) }
    }, [activeConvId])

    // ─── Process text → LLM → TTS ─────────────────────────────────────────
    const processTextInput = useCallback(async (text) => {
        if (!text.trim() || !activeConvId) return
        if (!aiReady) { showToast('AI is still processing'); return }

        // Cancel previous operations to prevent UI freeze
        abortAllWorkerRequests()
        stopVoiceSession()

        const userMsg = chatStore.addMessage(activeConvId, 'user', text.trim())
        setMessages((prev) => [...prev, userMsg])
        setConversations(chatStore.loadConversations())
        actions.setStatus(AppStatus.THINKING)
        addDebugLog(DebugCategory.STATE, 'LLM thinking...')
        setStreamingText('')

        try {
            const history = chatStore.getRecentMessages(activeConvId, 2)
            const { text: responseText, parsed } = await generateResponse(text.trim(), history, (p) => setStreamingText(p))
            if (!responseText) throw new Error('Empty LLM response')

            chatStore.addMessage(activeConvId, 'assistant', responseText)
            setMessages(chatStore.getConversation(activeConvId)?.messages || [])
            setStreamingText('')
            setConversations(chatStore.loadConversations())

            if (state.ttsEnabled && responseText) {
                actions.setStatus(AppStatus.SPEAKING)
                addDebugLog(DebugCategory.STATE, 'LLM speaking...')
                try {
                    const playSequence = async (txt, modelId) => {
                        if (!txt) return
                        const r = await TTS.synthesize(txt, { modelId, speed: 1.0 })
                        if (r?.audioData) {
                            const player = new AudioPlayback({ sampleRate: r.sampleRate || 22050 })
                            await player.play(r.audioData, r.sampleRate || 22050)
                            player.dispose()
                        }
                    }

                    if (parsed) {
                        const engText = parsed.english || parsed.better_sentence || parsed.your_sentence
                        if (engText) await playSequence(engText, 'vits-piper-en_US-lessac-medium')

                        const hiText = parsed.hindi_explanation
                        if (hiText) await playSequence(hiText, 'vits-piper-hi_IN-swara-medium')
                    } else {
                        const eng = responseText.substring(0, 300)
                        await playSequence(eng, 'vits-piper-en_US-lessac-medium')
                    }
                } catch (e) { console.warn('[TTS]', e) }
            }
            actions.setStatus(AppStatus.READY)
        } catch (err) {
            console.error('[CHAT]', err)
            addDebugLog(DebugCategory.ERROR, `Chat error: ${err.message}`)
            clearSafetyTimeout()
            setStreamingText('')
            showToast(err.message || 'AI failed to respond')
            chatStore.addMessage(activeConvId, 'assistant', 'Sorry, I had trouble responding. Please try again.')
            setMessages(chatStore.getConversation(activeConvId)?.messages || [])
            actions.setStatus(AppStatus.READY)
        }
    }, [activeConvId, aiReady, state.mode, state.ttsEnabled, actions, showToast])

    // ─── Voice flow ────────────────────────────────────────────────────────
    const handleMicStart = useCallback(async () => {
        if (!activeConvId || !aiReady) { showToast('AI not ready'); return }

        // Cancel previous generation and voice sessions abruptly when requested
        abortAllWorkerRequests()
        stopVoiceSession()

        const history = chatStore.getRecentMessages(activeConvId, 2)
        await startVoiceSession({
            systemPrompt: getSystemPrompt(state.mode),
            conversationHistory: history, maxTokens: 120, temperature: 0.6, ttsEnabled: state.ttsEnabled,
            onListening: () => {
                actions.setStatus(AppStatus.LISTENING)
                addDebugLog(DebugCategory.STATE, 'Mic state: listening')
            },
            onAudioLevel: (l) => actions.setAudioLevel(l),
            onTranscribing: () => {
                actions.setStatus(AppStatus.PROCESSING)
            },
            onTranscription: (text, lang) => {
                const m = chatStore.addMessage(activeConvId, 'user', text); m.detectedLang = lang
                setMessages((p) => [...p, m]); setConversations(chatStore.loadConversations())
            },
            onThinking: () => {
                actions.setStatus(AppStatus.THINKING)
                addDebugLog(DebugCategory.STATE, 'LLM thinking...')
            },
            onResponseToken: (_, acc) => setStreamingText(acc),
            onResponseComplete: (t) => {
                chatStore.addMessage(activeConvId, 'assistant', t)
                setMessages(chatStore.getConversation(activeConvId)?.messages || [])
                setStreamingText(''); setConversations(chatStore.loadConversations())
            },
            onSpeaking: () => {
                actions.setStatus(AppStatus.SPEAKING)
                addDebugLog(DebugCategory.STATE, 'LLM speaking...')
            },
            onComplete: () => {
                actions.setAudioLevel(0); actions.setStatus(AppStatus.READY)
            },
            onError: (e) => {
                setStreamingText(''); actions.setAudioLevel(0)
                actions.setStatus(AppStatus.READY)
                showToast(e?.message || 'Voice error')
            },
        })
    }, [activeConvId, aiReady, state.mode, state.ttsEnabled, actions, showToast])

    const handleMicStop = useCallback(() => {
        if (state.status === AppStatus.LISTENING) {
            // User tapped to stop recording. We should finish recording, NOT abort the session.
            finishListening()
        } else {
            // User tapped during THINKING or SPEAKING to cancel processing
            stopVoiceSession()
            actions.setStatus(AppStatus.READY)
            actions.setAudioLevel(0)
        }
    }, [state.status, actions])

    // ─── Text send ─────────────────────────────────────────────────────────
    const handleSendText = useCallback(async () => {
        if (!textInput.trim()) return
        const t = textInput; setTextInput(''); await processTextInput(t)
    }, [textInput, processTextInput])

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendText() }
    }, [handleSendText])

    // ─── Quiz ──────────────────────────────────────────────────────────────
    const handleGenerateQuiz = useCallback(async (topic = 'random') => {
        if (!isReady) { showToast('Model not ready'); return }

        // Cancel previous request if any
        if (quizAbortCtrlRef.current) {
            quizAbortCtrlRef.current.abort()
        }

        const ctrl = new AbortController()
        quizAbortCtrlRef.current = ctrl

        actions.setQuizLoading(true)
        actions.setQuizTopic(topic)
        // Clear old quiz temporarily so skeleton shows (optional based on UX preference)
        actions.setQuizData(null)

        try {
            const { isFallback, parsed } = await generateQuiz(topic, ctrl.signal)

            if (!ctrl.signal.aborted) {
                if (parsed) {
                    actions.setQuizData(parsed)
                    actions.setQuizIsFallback(isFallback)
                } else {
                    showToast('Quiz generation failed')
                }
            }
        } catch (err) {
            if (err.message !== 'Aborted by user') {
                console.error('[QUIZ]', err);
                showToast('Quiz error')
            }
        } finally {
            if (!ctrl.signal.aborted) {
                actions.setQuizLoading(false)
            }
        }
    }, [isReady, actions, showToast])

    const handleQuizAnswer = useCallback((c) => actions.recordQuizAnswer(c), [actions])

    // ─── Grammar quiz start ────────────────────────────────────────────────
    const handleGrammarQuiz = useCallback(() => {
        actions.setActiveView('quiz')
        handleGenerateQuiz('grammar')
    }, [actions, handleGenerateQuiz])

    // ─── History load ──────────────────────────────────────────────────────
    const handleLoadFromHistory = useCallback((id) => {
        loadConversation(id)
    }, [loadConversation])

    // ─── Auto-focus input ──────────────────────────────────────────────────
    useEffect(() => {
        if (state.activeView === 'conversation' && aiReady) {
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [state.activeView, aiReady])

    // ─── Render ────────────────────────────────────────────────────────────
    const v = state.activeView

    return (
        <div className={`app-shell ${state.sidebarOpen ? 'sidebar-is-open' : ''}`}>
            <Sidebar
                conversations={conversations}
                activeConvId={activeConvId}
                onSelectConversation={loadConversation}
                onNewConversation={startNewConversation}
            />
            <div className="app-main">
                <Header />

                <main className="app-content">
                    {/* Conversation */}
                    {v === 'conversation' && (
                        <>
                            {/* Mode switcher bar */}
                            {isReady && (
                                <div className="conversation-toolbar">
                                    <ModeSwitcher />
                                </div>
                            )}
                            <ChatArea messages={messages} streamingText={streamingText} />
                            {isReady && (
                                <div className="input-area">
                                    <div className="input-row">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            className="text-input"
                                            placeholder={aiReady ? 'Type in Hindi, English, or Hinglish...' : 'Processing...'}
                                            value={textInput}
                                            onChange={(e) => setTextInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            disabled={!aiReady}
                                        />
                                        <button className="send-btn" onClick={handleSendText} disabled={!aiReady || !textInput.trim()}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                                        </button>
                                        <MicButton onStart={handleMicStart} onStop={handleMicStop}
                                            disabled={!aiReady && state.status !== AppStatus.LISTENING} />
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Error state: manual retry only — no auto restart */}
                    {state.status === AppStatus.ERROR && (
                        <div className="error-banner">
                            <p>⚠️ {state.error || 'AI engine failed to start.'}</p>
                            <button
                                className="retry-btn"
                                onClick={() => window.location.reload()}
                            >
                                🔄 Retry AI Engine
                            </button>
                        </div>
                    )}

                    {/* Quiz */}
                    {v === 'quiz' && isReady && (
                        <Quiz
                            quiz={state.quizData}
                            isLoading={state.quizLoading}
                            isFallback={state.quizIsFallback}
                            topic={state.quizTopic}
                            onAnswer={handleQuizAnswer}
                            onNext={handleGenerateQuiz}
                        />
                    )}

                    {/* Grammar */}
                    {v === 'grammar' && <GrammarView onStartQuiz={handleGrammarQuiz} />}

                    {/* Dictionary */}
                    {v === 'dictionary' && <DictionaryView />}

                    {/* History */}
                    {v === 'history' && <HistoryView onLoadConversation={handleLoadFromHistory} />}

                    {/* Info pages */}
                    {v === 'about' && <AboutView />}
                    {v === 'contact' && <ContactView />}
                    {v === 'privacy' && <PrivacyView />}
                </main>

                {/* Debug Panel */}
                <DebugPanel visible={debugVisible} />

                {/* Debug toggle button */}
                <button
                    className="debug-toggle-btn"
                    onClick={() => setDebugVisible((p) => !p)}
                    title="Toggle Debug Panel (Ctrl+D)"
                >
                    🔧
                </button>

                {toast && <Toast message={toast} onDismiss={() => setToast('')} />}
            </div>
        </div>
    )
}