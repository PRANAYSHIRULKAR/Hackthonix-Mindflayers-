import { useState, useRef, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { ChatMessage, Message } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { VoiceOrb } from "@/components/VoiceOrb";
import { useSpeechRecognition, useTTS } from "@/hooks/use-speech";
import { streamChat } from "@/lib/chat-api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import LiquidEther from "@/components/ui/LiquidEther";
import SplitText from "@/components/ui/SplitText";

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceState, setVoiceState] = useState<
    "listening" | "processing" | "speaking" | null
  >(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const { isSpeaking, speak, stop: stopTTS } = useTTS();

  const handleAnimationComplete = () => {
    console.log("All letters have animated!");
  };

  const handleVoiceResult = useCallback((text: string) => {
    setVoiceState("processing");
    handleSend(text);
  }, []);

  const { isListening, toggle: toggleMic } =
    useSpeechRecognition(handleVoiceResult);

  useEffect(() => {
    if (isListening) setVoiceState("listening");
    else if (voiceState === "listening") setVoiceState(null);
  }, [isListening]);

  useEffect(() => {
    if (isSpeaking) setVoiceState("speaking");
    else if (voiceState === "speaking") setVoiceState(null);
  }, [isSpeaking]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = async (input: string) => {
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let assistantSoFar = "";

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;

      setMessages((prev) => {
        const last = prev[prev.length - 1];

        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }

        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMsg],
        onDelta: upsertAssistant,
        onDone: () => {
          setIsLoading(false);
        },
      });
    } catch (e: any) {
      console.error(e);
      setIsLoading(false);
      toast.error(e.message || "Failed to get response");
    }
  };

  const handleMicClick = () => {
    if (
      !(window as any).SpeechRecognition &&
      !(window as any).webkitSpeechRecognition
    ) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }

    toggleMic();
  };

  const handleCloseOrb = () => {
    if (isListening) toggleMic();
    if (isSpeaking) stopTTS();
    setVoiceState(null);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">

      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <LiquidEther
          colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
          mouseForce={20}
          cursorSize={100}
          isViscous
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          autoDemo
        />
      </div>

      {/* UI */}
      <div className="relative z-10 flex flex-col h-screen bg-background/40 backdrop-blur-sm">

        <Header />

        <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-3">

          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center px-6 gap-5"
            >

             

              {/* Animated Heading */}
              <SplitText
                text="Welcome to CampusFlow"
                className="font-display text-4xl md:text-5xl font-bold text-white tracking-tight"
                delay={50}
                duration={1.25}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                textAlign="center"
                onLetterAnimationComplete={handleAnimationComplete}
                showCallback
              />

              {/* Subtitle */}
              <p className="text-sm md:text-base text-muted-foreground max-w-md">
                Ask me anything about Nagpur colleges — placements, fees,
                hostel, campus life, rankings and more!
              </p>

            </motion.div>
          )}

        </div>

        <ChatInput
          onSend={handleSend}
          onMicClick={handleMicClick}
          isListening={isListening}
          disabled={isLoading}
          placeholder="Ask about any Nagpur college..."
        />

        <VoiceOrb state={voiceState} onClose={handleCloseOrb} />

      </div>
    </div>
  );
};

export default Index;

