'use client';

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechCaptureState = {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  error?: string;
};

type RecognitionInstance = {
  start: () => void;
  stop: () => void;
  onresult: ((event: any) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
  lang: string;
};

export function useSpeechCapture() {
  const recognitionRef = useRef<RecognitionInstance | null>(null);
  const [state, setState] = useState<SpeechCaptureState>({
    isSupported: false,
    isListening: false,
    transcript: ""
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setState((prev) => ({ ...prev, isSupported: false }));
      return;
    }
    const NativeRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition: RecognitionInstance = new NativeRecognition();
    recognition.lang = "en-US";
    recognitionRef.current = recognition;
    setState((prev) => ({ ...prev, isSupported: true }));

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as any[])
        .map((result: any) => result[0].transcript)
        .join(" ");
      setState((prev) => ({ ...prev, transcript }));
    };

    recognition.onstart = () => {
      setState((prev) => ({ ...prev, isListening: true, error: undefined }));
    };

    recognition.onend = () => {
      setState((prev) => ({ ...prev, isListening: false }));
    };

    recognition.onerror = (event: any) => {
      setState((prev) => ({
        ...prev,
        error: event.error,
        isListening: false
      }));
    };

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.start();
  }, []);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
  }, []);

  const resetTranscript = useCallback(() => {
    setState((prev) => ({ ...prev, transcript: "" }));
  }, []);

  return { ...state, start, stop, resetTranscript };
}
