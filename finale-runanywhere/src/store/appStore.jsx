import { createContext, useContext, useReducer, useCallback } from 'react'

export const AppStatus = {
    IDLE: 'idle',
    INITIALIZING: 'initializing',
    DOWNLOADING: 'downloading',
    READY: 'ready',
    LISTENING: 'listening',
    PROCESSING_STT: 'processing_stt',
    THINKING: 'thinking',
    SPEAKING: 'speaking',
    WARMING_UP: 'warming_up',
    ERROR: 'error',
}


const initialState = {
    status: AppStatus.IDLE,
    downloadProgress: 0,
    activeView: 'conversation',
    activeConversationId: null,
    mode: 'casual',
    error: null,
    hasWebGPU: false,
    accelerationMode: 'unknown',
    audioLevel: 0,
    ttsEnabled: true,
    quizScore: { correct: 0, total: 0, streak: 0 },
    difficulty: 'medium',
    sidebarOpen: typeof window !== 'undefined' && window.innerWidth >= 1024,
    // Independent Quiz State
    quizLoading: false,
    quizData: null,
    quizTopic: '',
    quizIsFallback: false,
}

function reducer(state, action) {
    switch (action.type) {
        case 'SET_STATUS':
            return { ...state, status: action.payload, error: null }
        case 'SET_DOWNLOAD_PROGRESS':
            return { ...state, downloadProgress: action.payload }
        case 'SET_ACTIVE_VIEW':
            return { ...state, activeView: action.payload }
        case 'SET_ACTIVE_CONVERSATION':
            return { ...state, activeConversationId: action.payload }
        case 'SET_MODE':
            return { ...state, mode: action.payload }
        case 'SET_ERROR':
            return { ...state, status: AppStatus.ERROR, error: action.payload }
        case 'SET_WEBGPU':
            return { ...state, hasWebGPU: action.payload }
        case 'SET_ACCELERATION':
            return { ...state, accelerationMode: action.payload }
        case 'SET_AUDIO_LEVEL':
            return { ...state, audioLevel: action.payload }
        case 'SET_TTS_ENABLED':
            return { ...state, ttsEnabled: action.payload }
        case 'SET_DIFFICULTY':
            return { ...state, difficulty: action.payload }
        case 'SET_SIDEBAR_OPEN':
            return { ...state, sidebarOpen: action.payload }
        case 'SET_QUIZ_LOADING':
            return { ...state, quizLoading: action.payload }
        case 'SET_QUIZ_DATA':
            return { ...state, quizData: action.payload }
        case 'SET_QUIZ_TOPIC':
            return { ...state, quizTopic: action.payload }
        case 'SET_QUIZ_IS_FALLBACK':
            return { ...state, quizIsFallback: action.payload }
        case 'QUIZ_ANSWER': {
            const isCorrect = action.payload
            const correct = isCorrect ? state.quizScore.correct + 1 : state.quizScore.correct
            const total = state.quizScore.total + 1
            const streak = isCorrect ? state.quizScore.streak + 1 : 0
            const ratio = total > 0 ? correct / total : 0.5
            const difficulty = ratio > 0.8 ? 'hard' : ratio < 0.4 ? 'easy' : 'medium'
            return { ...state, quizScore: { correct, total, streak }, difficulty }
        }
        case 'RESET_QUIZ_SCORE':
            return { ...state, quizScore: { correct: 0, total: 0, streak: 0 }, difficulty: 'medium' }
        default:
            return state
    }
}

const AppStateContext = createContext(null)
const AppDispatchContext = createContext(null)

export function AppStateProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState)
    return (
        <AppStateContext.Provider value={state}>
            <AppDispatchContext.Provider value={dispatch}>
                {children}
            </AppDispatchContext.Provider>
        </AppStateContext.Provider>
    )
}

export function useAppState() {
    const ctx = useContext(AppStateContext)
    if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
    return ctx
}

export function useAppDispatch() {
    const ctx = useContext(AppDispatchContext)
    if (!ctx) throw new Error('useAppDispatch must be used within AppStateProvider')
    return ctx
}

export function useAppActions() {
    const dispatch = useAppDispatch()
    return {
        setStatus: useCallback((s) => dispatch({ type: 'SET_STATUS', payload: s }), [dispatch]),
        setProgress: useCallback((p) => dispatch({ type: 'SET_DOWNLOAD_PROGRESS', payload: p }), [dispatch]),
        setActiveView: useCallback((v) => dispatch({ type: 'SET_ACTIVE_VIEW', payload: v }), [dispatch]),
        setActiveConversation: useCallback((id) => dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: id }), [dispatch]),
        setMode: useCallback((m) => dispatch({ type: 'SET_MODE', payload: m }), [dispatch]),
        setError: useCallback((e) => dispatch({ type: 'SET_ERROR', payload: e }), [dispatch]),
        setWebGPU: useCallback((h) => dispatch({ type: 'SET_WEBGPU', payload: h }), [dispatch]),
        setAcceleration: useCallback((m) => dispatch({ type: 'SET_ACCELERATION', payload: m }), [dispatch]),
        setAudioLevel: useCallback((l) => dispatch({ type: 'SET_AUDIO_LEVEL', payload: l }), [dispatch]),
        setTtsEnabled: useCallback((t) => dispatch({ type: 'SET_TTS_ENABLED', payload: t }), [dispatch]),
        setDifficulty: useCallback((d) => dispatch({ type: 'SET_DIFFICULTY', payload: d }), [dispatch]),
        setSidebarOpen: useCallback((o) => dispatch({ type: 'SET_SIDEBAR_OPEN', payload: o }), [dispatch]),
        setQuizLoading: useCallback((loading) => dispatch({ type: 'SET_QUIZ_LOADING', payload: loading }), [dispatch]),
        setQuizData: useCallback((data) => dispatch({ type: 'SET_QUIZ_DATA', payload: data }), [dispatch]),
        setQuizTopic: useCallback((topic) => dispatch({ type: 'SET_QUIZ_TOPIC', payload: topic }), [dispatch]),
        setQuizIsFallback: useCallback((isFallback) => dispatch({ type: 'SET_QUIZ_IS_FALLBACK', payload: isFallback }), [dispatch]),
        recordQuizAnswer: useCallback((correct) => dispatch({ type: 'QUIZ_ANSWER', payload: correct }), [dispatch]),
        resetQuizScore: useCallback(() => dispatch({ type: 'RESET_QUIZ_SCORE' }), [dispatch]),
    }
}
