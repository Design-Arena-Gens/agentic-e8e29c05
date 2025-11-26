'use client';

import { useCallback, useEffect, useRef, useState } from "react";

type UseCompanionVoiceOptions = {
  onUtteranceEnd?: () => void;
};

export function useCompanionVoice(options: UseCompanionVoiceOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    synthRef.current = window.speechSynthesis;
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!synthRef.current) return;
      if (!text) return;

      if (currentUtteranceRef.current) {
        currentUtteranceRef.current.onend = null;
        currentUtteranceRef.current.onstart = null;
        synthRef.current.cancel();
        setIsSpeaking(false);
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;
      const voices = synthRef.current.getVoices();
      const preferredVoice =
        voices.find((voice) => /en(-US)?/i.test(voice.lang) && voice.name.includes("Female")) ||
        voices.find((voice) => /en(-US)?/i.test(voice.lang));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        options.onUtteranceEnd?.();
      };

      currentUtteranceRef.current = utterance;
      synthRef.current.speak(utterance);
    },
    [options]
  );

  const cancel = useCallback(() => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setIsSpeaking(false);
    if (currentUtteranceRef.current) {
      currentUtteranceRef.current.onend = null;
      currentUtteranceRef.current.onstart = null;
      currentUtteranceRef.current = null;
    }
  }, []);

  return { isSpeaking, speak, cancel };
}
