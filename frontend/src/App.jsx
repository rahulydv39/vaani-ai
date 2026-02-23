import { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import MicButton from './components/MicButton';
import ListeningAnimation from './components/ListeningAnimation';
import ProcessingState from './components/ProcessingState';
import ConversationHistory from './components/ConversationHistory';
import Footer from './components/Footer';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import './App.css';

const API_BASE = 'http://127.0.0.1:8000';

const STATUS_LABELS = {
  idle: '✦ Tap the mic and speak in Hindi',
  listening: '🎙 Listening…',
  processing: '',
  result: '✅ Ready for next question',
  error: '⚠️ Something went wrong',
};

export default function App() {
  // --- State ---
  const [status, setStatus] = useState('idle'); // idle | listening | processing | result | error
  const [coachResponse, setCoachResponse] = useState(null); // raw string from backend
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]); // [{ id, text }]

  const responseRef = useRef(null);

  // --- Audio Recording ---
  const handleRecordingComplete = useCallback(async (audioBlob) => {
    setStatus('processing');
    setError('');
    setCoachResponse(null);

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.wav');

      const res = await fetch(`${API_BASE}/voice-chat`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      console.log('API response:', data);

      // Store the full raw response as-is
      setCoachResponse(data.response || '');
      setStatus('result');

      // Add to conversation history
      setHistory((prev) => {
        const updated = [
          ...prev,
          { id: Date.now(), text: data.response || '' },
        ];
        return updated.slice(-5);
      });
    } catch (err) {
      console.error('Voice chat error:', err);
      setStatus('error');
      setError(
        err.message.includes('Failed to fetch')
          ? 'Model is loading… please wait and try again.'
          : `Something went wrong: ${err.message}`
      );
    }
  }, []);

  const { isRecording, startRecording } = useAudioRecorder({
    onRecordingComplete: handleRecordingComplete,
    recordingDuration: 4500,
  });

  // Sync recording state
  useEffect(() => {
    if (isRecording) {
      setStatus('listening');
    }
  }, [isRecording]);

  // Auto-scroll to response
  useEffect(() => {
    if (coachResponse && responseRef.current) {
      setTimeout(() => {
        responseRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [coachResponse]);

  // --- Mic Click ---
  const handleMicClick = useCallback(async () => {
    if (isRecording || status === 'processing') return;

    setError('');
    try {
      await startRecording();
    } catch {
      setStatus('error');
      setError('Microphone access denied. Please allow microphone permissions.');
    }
  }, [isRecording, status, startRecording]);

  const isDisabled = isRecording || status === 'processing';
  const statusLabel = STATUS_LABELS[status] || '';

  // Past history = all items except the most recent one (which is shown in CoachResponseCard)
  const pastHistory = history.length > 1 ? history.slice(0, -1).slice(-3) : [];

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <div className="main-inner">
          {/* --- Mic Hero Area --- */}
          <section className="mic-section">
            <MicButton
              status={status}
              onClick={handleMicClick}
              disabled={isDisabled}
            />

            {status === 'listening' && <ListeningAnimation />}

            {status === 'processing' ? (
              <ProcessingState />
            ) : (
              <p className={`mic-status-text ${status}`}>
                {statusLabel}
              </p>
            )}
          </section>

          {/* --- Error --- */}
          {error && (
            <div className="error-card glass-card">
              <p className="error-text">⚠️ {error}</p>
            </div>
          )}

          {/* --- Coach Response --- */}
          <div ref={responseRef} className="results-section">
            {coachResponse && (
              <div className="coach-response glass-card">
                <div className="coach-response-header">
                  <span>🎓</span>
                  <span className="coach-response-title">Your English Coach</span>
                </div>
                <pre className="coach-response-text">{coachResponse}</pre>
              </div>
            )}
          </div>

          {/* --- Conversation History --- */}
          {pastHistory.length > 0 && (
            <section className="history-section">
              <ConversationHistory items={pastHistory} />
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}