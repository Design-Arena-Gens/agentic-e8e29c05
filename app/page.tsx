'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { useCompanionVoice } from "../hooks/useCompanionVoice";
import { useSpeechCapture } from "../hooks/useSpeechCapture";

const AvatarCanvas = dynamic(
  () => import("../components/AvatarCanvas").then((mod) => mod.AvatarCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="avatar-fallback">
        <div className="glow-orb" />
      </div>
    )
  }
);

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const initialGreeting: ChatMessage = {
  id: "intro",
  role: "assistant",
  content:
    "Hi, I'm Lumos. I'm here to listen, reflect, and support you. Feel free to talk or tap the mic to speak."
};

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [companionAwake, setCompanionAwake] = useState(false);
  const { isSpeaking, speak, cancel } = useCompanionVoice();
  const { isSupported, isListening, transcript, error, start, stop, resetTranscript } =
    useSpeechCapture();
  const transcriptRef = useRef(transcript);

  useEffect(() => {
    transcriptRef.current = transcript;
    if (transcript && !isListening) {
      setInput(transcript);
    }
  }, [transcript, isListening]);

  const sendMessage = useCallback(
    async (userMessage: string) => {
      const trimmed = userMessage.trim();
      if (!trimmed) return;

      const userEntry: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed
      };
      setMessages((prev) => [...prev, userEntry]);
      setInput("");
      resetTranscript();
      setCompanionAwake(true);
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: trimmed,
            history: messages.slice(-6)
          })
        });

        if (!response.ok) {
          throw new Error("Request failed");
        }

        const data = (await response.json()) as { reply: string };
        const replyText = data.reply.trim();
        const assistantEntry: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: replyText
        };
        setMessages((prev) => [...prev, assistantEntry]);
        speak(replyText);
      } catch (err) {
        console.error(err);
        const fallback =
          "I'm here with you. Something went wrong on my side, but your feelings are still important.";
        const assistantEntry: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: fallback
        };
        setMessages((prev) => [...prev, assistantEntry]);
        speak(fallback);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, resetTranscript, speak]
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      await sendMessage(input);
    },
    [input, sendMessage]
  );

  const handleVoiceToggle = useCallback(() => {
    if (!isSupported) return;
    if (isListening) {
      stop();
    } else {
      cancel();
      resetTranscript();
      start();
    }
  }, [cancel, isListening, isSupported, resetTranscript, start, stop]);

  const chatHistory = useMemo(
    () =>
      messages.map((message) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className={clsx("bubble", {
            "bubble-assistant": message.role === "assistant",
            "bubble-user": message.role === "user"
          })}
        >
          {message.content}
        </motion.div>
      )),
    [messages]
  );

  return (
    <main className="page">
      <section className="hero">
        <h1>Lumos Companion</h1>
        <p>
          A gentle mental health companion that listens, speaks, and mirrors your presence
          through an expressive 3D guide.
        </p>
      </section>

      <section className="content">
        <div className="chat-section">
          <div className="chat-log">
            <AnimatePresence initial={false}>{chatHistory}</AnimatePresence>
            {isLoading ? <div className="typing">Lumos is reflecting...</div> : null}
          </div>
          <form className="chat-input" onSubmit={handleSubmit}>
            <label htmlFor="message" className="sr-only">
              Share what is on your mind
            </label>
            <textarea
              id="message"
              name="message"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="How are you feeling right now?"
              rows={2}
              required
              disabled={isLoading}
            />
            <div className="input-actions">
              <button type="submit" className="send-btn" disabled={isLoading || !input.trim()}>
                Send
              </button>
              <button
                type="button"
                className={clsx("voice-btn", { active: isListening })}
                onClick={handleVoiceToggle}
                disabled={!isSupported}
              >
                {isListening ? "Listening…" : "Speak"}
              </button>
            </div>
            {!isSupported ? (
              <p className="hint">Voice controls need a modern browser like Chrome.</p>
            ) : null}
            {error ? <p className="hint error">Voice error: {error}</p> : null}
          </form>
        </div>

        <div className={clsx("avatar-section", { awake: companionAwake })}>
          <div className="avatar-shell">
            <AvatarCanvas active={companionAwake} speaking={isSpeaking} />
          </div>
          <div className="avatar-caption">
            {isSpeaking
              ? "Lumos is speaking with you."
              : companionAwake
              ? "Feel free to keep sharing whenever you're ready."
              : "Send a message to invite Lumos into the space."}
          </div>
        </div>
      </section>
    </main>
  );
}
