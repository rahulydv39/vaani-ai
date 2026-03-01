import { useState, useRef, useCallback } from 'react';

export function useAudioRecorder({ onRecordingComplete, recordingDuration = 4500 }) {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const streamRef = useRef(null);

    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const silenceTimerRef = useRef(null);
    const animationFrameRef = useRef(null);

    const stopStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(console.error);
        }
        audioContextRef.current = null;
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            console.log('[STT] recording stopped');
            mediaRecorderRef.current.stop();
        }
    }, []);

    const startRecording = useCallback(async () => {
        try {
            console.log('[STT] recording started');
            chunksRef.current = [];

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            });
            streamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                    ? 'audio/webm;codecs=opus'
                    : 'audio/webm',
            });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                chunksRef.current = [];
                stopStream();
                setIsRecording(false);
                if (onRecordingComplete) {
                    onRecordingComplete(audioBlob);
                }
            };

            // VAD / Silence Detection Setup
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            analyserRef.current = analyser;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            let isSilent = true;

            const checkSilence = () => {
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;

                if (average > 10) { // Speech detected threshold
                    if (isSilent) {
                        isSilent = false;
                        if (silenceTimerRef.current) {
                            clearTimeout(silenceTimerRef.current);
                            silenceTimerRef.current = null;
                        }
                    }
                } else { // Silence threshold reached
                    if (!isSilent) {
                        isSilent = true;
                        silenceTimerRef.current = setTimeout(() => {
                            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                                mediaRecorderRef.current.stop();
                            }
                        }, 2000); // 2.0s of silence auto-stops
                    }
                }

                animationFrameRef.current = requestAnimationFrame(checkSilence);
            };

            // Start checking after a short delay
            setTimeout(() => {
                if (streamRef.current) {
                    checkSilence();
                }
            }, 500);

            mediaRecorder.start();
            setIsRecording(true);

            // Fallback auto-stop if silence detection fails
            setTimeout(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    mediaRecorderRef.current.stop();
                }
            }, recordingDuration * 5); // Fallback is much longer than the original 4.5s
        } catch (err) {
            console.error('Microphone access error:', err);
            setIsRecording(false);
            stopStream();
            throw err;
        }
    }, [onRecordingComplete, recordingDuration, stopStream]);

    return { isRecording, startRecording, stopRecording };
}
