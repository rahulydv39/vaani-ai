import { useState, useRef, useCallback } from 'react';

export function useAudioRecorder({ onRecordingComplete, recordingDuration = 4500 }) {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const streamRef = useRef(null);

    const stopStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    const startRecording = useCallback(async () => {
        try {
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
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
                chunksRef.current = [];
                stopStream();
                setIsRecording(false);
                if (onRecordingComplete) {
                    onRecordingComplete(audioBlob);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);

            // Auto-stop after duration
            setTimeout(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    mediaRecorderRef.current.stop();
                }
            }, recordingDuration);
        } catch (err) {
            console.error('Microphone access error:', err);
            setIsRecording(false);
            stopStream();
            throw err;
        }
    }, [onRecordingComplete, recordingDuration, stopStream]);

    return { isRecording, startRecording };
}
