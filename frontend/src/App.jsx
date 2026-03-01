import { useState, useCallback, useEffect, useRef } from 'react';
import AppShell from './layouts/AppShell';

import ConversationView from './views/ConversationView';
import QuizView from './views/QuizView';
import GrammarView from './views/GrammarView';
import DictionaryView from './views/DictionaryView';
import HistoryView from './views/HistoryView';
import AboutView from './views/AboutView';
import ContactView from './views/ContactView';
import PrivacyView from './views/PrivacyView';

import { useAudioRecorder } from './hooks/useAudioRecorder';
import './App.css';

const API_BASE = 'http://127.0.0.1:8000';

export default function App() {
  const [activeView, setActiveView] = useState('conversation');

  // --- External State Pipeline ---
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [coachResponse, setCoachResponse] = useState(null); // { text, audio_url }
  const [error, setError] = useState('');

  const audioRef = useRef(null);
  const startRecordingRef = useRef(null);

  // Single active session
  const [history, setHistory] = useState([]); // [{ id, text }]

  // All historical sessions
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('vaani_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [currentSessionId] = useState(() => Date.now().toString());

  useEffect(() => {
    localStorage.setItem('vaani_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // --- Unified Message Pipeline ---
  const handleUserMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    // Instantly show user message before API call
    setHistory((prev) => {
      const updated = [
        ...prev,
        { id: Date.now(), text: text, isUser: true },
      ];
      return updated.slice(-5);
    });

    console.log('[PIPELINE] sending to LLM');
    setIsThinking(true);
    setError('');
    setCoachResponse(null);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      console.log('[LLM] response received:', data);

      setCoachResponse(data);

      if (data.audio_url) {
        setIsSpeaking(true);
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        audioRef.current.src = data.audio_url;
        audioRef.current.onended = () => {
          setIsSpeaking(false);
        };
        audioRef.current.play().catch(e => {
          console.error('Audio playback failed', e);
          setIsSpeaking(false);
        });
      }

      setHistory((prev) => {
        const updated = [
          ...prev,
          { id: Date.now(), text: data.response || '', isUser: false },
        ];
        return updated.slice(-5);
      });

      // Save into sessions
      setSessions((prev) => {
        const existing = prev.find(s => s.id === currentSessionId);
        const newMsg = { id: Date.now(), text: data.response || '', isUser: false };
        const userMsg = { id: Date.now() - 1, text: text, isUser: true };

        if (existing) {
          return prev.map(s => s.id === currentSessionId ?
            { ...s, messages: [...s.messages, userMsg, newMsg], lastUpdated: new Date().toISOString() } : s
          );
        } else {
          return [{
            id: currentSessionId,
            title: `Conversation on ${new Date().toLocaleDateString()}`,
            date: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            messages: [userMsg, newMsg]
          }, ...prev];
        }
      });

    } catch (err) {
      console.error('Chat error:', err);
      setError(
        err.message.includes('Failed to fetch')
          ? 'Model is loading... please wait and try again.'
          : `Message failed: ${err.message}`
      );
    } finally {
      console.log('[STATE] thinking false');
      setIsThinking(false);
    }
  }, [currentSessionId]);

  // --- Audio Recording ---
  const handleRecordingComplete = useCallback(async (audioBlob) => {
    console.log('[STT] recording stopped');
    console.log(`[STT] blob size: ${audioBlob.size}`);

    if (audioBlob.size > 10 * 1024 * 1024) {
      console.error('[STT] Audio > 10MB');
      setError('Recording too large (max 10MB).');
      return;
    }

    console.log('[STT] sending request to /voice-chat');
    // Remove local "thinking on device" lock during STT? 
    // We just set isThinking to true because we are awaiting both STT and LLM from the backend simultaneously.
    setIsThinking(true);
    setError('');

    // Performance Guard Array
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 180000); // 180s STT timeout abort

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');

      const res = await fetch(`${API_BASE}/voice-chat`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      console.log('[STT] response received');
      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        throw new Error(`Server returned non-JSON response: ${res.status}`);
      }

      if (!res.ok) {
        throw new Error(data.error || data.detail || `Server error: ${res.status}`);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      console.log('[LLM] tutor text: ', data.response);

      setCoachResponse(data);

      if (data.audio_url) {
        setIsSpeaking(true);
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        audioRef.current.src = data.audio_url;
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          // Restart mic recursively.
          if (startRecordingRef.current) {
            startRecordingRef.current();
          }
        };
        audioRef.current.play().catch(e => {
          console.error('Audio playback failed', e);
          setIsSpeaking(false);
        });
      }

      setHistory((prev) => {
        const updated = [
          ...prev,
          { id: Date.now(), text: data.response || '', isUser: false },
        ];
        return updated.slice(-5);
      });

    } catch (err) {
      if (err.name === 'AbortError') {
        console.error('STT/LLM Timeout');
        setError('Speech took too long — please try again');
      } else {
        console.error('Voice STT error:', err);
        setError(`STT error: ${err.message}`);
      }
    } finally {
      setIsTranscribing(false);
      setIsThinking(false);
    }
  }, []);

  const { isRecording, startRecording, stopRecording } = useAudioRecorder({
    onRecordingComplete: handleRecordingComplete,
    recordingDuration: 4500,
  });

  useEffect(() => {
    startRecordingRef.current = startRecording;
  }, [startRecording]);

  const handleMicClick = useCallback(async () => {
    if (isSpeaking) {
      // Interrupt AI
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsSpeaking(false);
      await startRecording();
      return;
    }

    if (isRecording || isTranscribing || isThinking) {
      if (isRecording && stopRecording) stopRecording();
      return;
    }

    setError('');
    try {
      await startRecording();
    } catch {
      setError('Microphone access denied. Please allow microphone permissions.');
    }
  }, [isRecording, isTranscribing, isThinking, isSpeaking, startRecording, stopRecording]);

  const isDisabled = isTranscribing || isThinking;

  let status = 'idle';
  if (error) status = 'error';
  else if (isSpeaking) status = 'speaking';
  else if (isTranscribing || isThinking) status = 'thinking';
  else if (isRecording) status = 'listening';

  // --- Render Router ---
  const renderView = () => {
    switch (activeView) {
      case 'conversation':
        return (
          <ConversationView
            status={status}
            coachResponse={coachResponse}
            error={error}
            history={history}
            isRecording={isRecording}
            handleMicClick={handleMicClick}
            handleSend={handleUserMessage}
            isDisabled={isDisabled}
          />
        );
      case 'quiz': return <QuizView />;
      case 'grammar': return <GrammarView />;
      case 'dictionary': return <DictionaryView />;
      case 'history': return <HistoryView setActiveView={setActiveView} sessions={sessions} />;
      case 'about': return <AboutView />;
      case 'contact': return <ContactView />;
      case 'privacy': return <PrivacyView />;
      default: return null;
    }
  };

  return (
    <AppShell activeView={activeView} setActiveView={setActiveView}>
      {renderView()}
    </AppShell>
  );
}