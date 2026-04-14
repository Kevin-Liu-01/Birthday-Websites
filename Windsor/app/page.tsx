"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// All images except captcha.png for the chaos phase
const CHAOS_IMAGES = [
  "/images/aegyo.png",
  "/images/cowboy.png",
  "/images/cute.jpeg",
  "/images/joyous.png",
  "/images/jrr.jpg",
  "/images/selfie.jpeg",
  "/images/sleep.png",
  "/images/thumbsup.png",
  "/images/young.jpg",
  "/images/platypus.png",
  "/images/moresleep.png",
  "/images/icecream.png",
  "/images/suitcase.png",
  "/images/dynamicduo.png",
];

// Removed metal-pipe-clang
const MEME_SOUNDS = [
  "/memes/applepay.mp3",
  "/memes/baby-laughing-meme.mp3",
  "/memes/fahhhhhhhhhhhhhh.mp3",
  "/memes/gayy.mp3",
  "/memes/i-got-this-fahhhhhh.mp3",
  "/memes/oh-my-god-bro-oh-hell-nah-man.mp3",
  "/memes/oioioe.mp3",
  "/memes/rizz.mp3",
  "/memes/romanceeeeeeeeeeeeee.mp3",
  "/memes/skeleton-banging.mp3",
  "/memes/what-is-this-diddy-blud-doing-on-the.mp3",
  "/memes/whoinvitedthisblud.mp3",
];

const EMOJIS = ["🎂", "🎉", "🎊", "🥳", "🎁", "🎈", "🍰", "🎵", "💥", "⭐", "🔥", "💀", "😂", "🐐"];

// Pre-generate random values for floating emojis (chaos phase)
const generateFloatingEmojis = () => Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 5,
  duration: 3 + Math.random() * 4,
  emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
}));

// Pre-generate confetti
const COLORS = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#ff8800", "#88ff00"];
const generateConfetti = () => Array.from({ length: 150 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: -10 - Math.random() * 100,
  color: COLORS[Math.floor(Math.random() * COLORS.length)],
  delay: Math.random() * 2,
}));

type Phase = "error" | "captcha" | "loading" | "chaos";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("error");
  const [selectedTiles, setSelectedTiles] = useState<Set<number>>(new Set());
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [chaosImages, setChaosImages] = useState<Array<{ id: number; src: string; x: number; y: number; scale: number; rotation: number; soundIndex: number }>>([]);
  const [showScavengerText, setShowScavengerText] = useState(false);
  const audioRefs = useRef<HTMLAudioElement[]>([]);
  const chaosIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const soundCycleRef = useRef<NodeJS.Timeout | null>(null);
  const imageIdCounter = useRef(0);
  const activeSoundsRef = useRef<Set<number>>(new Set());

  // Pre-generate random values
  const floatingEmojis = useMemo(() => generateFloatingEmojis(), []);
  const generatedConfetti = useMemo(() => generateConfetti(), []);

  // Preload all images and sounds in the background
  const preloadedAudios = useRef<HTMLAudioElement[]>([]);

  useEffect(() => {
    // Preload chaos images
    CHAOS_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    // Preload captcha image
    const captchaImg = new Image();
    captchaImg.src = "/images/captcha.png";

    // Preload sounds - actually load them into memory
    MEME_SOUNDS.forEach((src, index) => {
      const audio = new Audio(src);
      audio.preload = "auto";
      audio.load(); // Force load
      preloadedAudios.current[index] = audio;
    });
  }, []);

  const toggleTile = (index: number) => {
    const newSelected = new Set(selectedTiles);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTiles(newSelected);
  };

  const handleVerify = () => {
    setPhase("loading");
    setLoadingProgress(0);
  };

  // Loading phase animation
  useEffect(() => {
    if (phase === "loading") {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setPhase("chaos"), 200);
            return 100;
          }
          return prev + Math.random() * 15 + 5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [phase]);

  // Function to play a random sound
  const playRandomSound = useCallback(() => {
    // Pick a random sound that isn't currently playing
    const availableSounds = MEME_SOUNDS.map((_, i) => i).filter(i => !activeSoundsRef.current.has(i));
    if (availableSounds.length === 0) return;

    const randomIndex = availableSounds[Math.floor(Math.random() * availableSounds.length)];
    const audio = new Audio(MEME_SOUNDS[randomIndex]);
    audio.volume = 0.7;

    activeSoundsRef.current.add(randomIndex);
    audioRefs.current[randomIndex] = audio;

    audio.onended = () => {
      activeSoundsRef.current.delete(randomIndex);
    };

    audio.play().catch(() => {
      activeSoundsRef.current.delete(randomIndex);
    });
  }, []);

  // Chaos phase - play 3-4 sounds at a time cycling through
  useEffect(() => {
    if (phase === "chaos") {
      // Capture refs at the start of effect
      const currentAudioRefs = audioRefs.current;
      const currentActiveSounds = activeSoundsRef.current;

      // START AUDIO IMMEDIATELY - before images!
      playRandomSound();
      playRandomSound();
      playRandomSound();
      playRandomSound();

      // Keep cycling sounds - add new ones when there's room
      soundCycleRef.current = setInterval(() => {
        if (activeSoundsRef.current.size < 4) {
          playRandomSound();
        }
      }, 800);

      // Spawn images rapidly
      const spawnImage = () => {
        const newImage = {
          id: imageIdCounter.current++,
          src: CHAOS_IMAGES[Math.floor(Math.random() * CHAOS_IMAGES.length)],
          x: -5 + Math.random() * 100,  // Spread across full width (-5% to 95%)
          y: -10 + Math.random() * 100,  // Spread across full height (-5% to 95%)
          scale: 0.3 + Math.random() * 1.2,
          rotation: Math.random() * 360 - 180,
          soundIndex: Math.floor(Math.random() * MEME_SOUNDS.length),
        };
        setChaosImages((prev) => [...prev.slice(-40), newImage]); // Keep max 40 images
      };

      // Delay images slightly so audio hits first (300ms after sounds start)
      const imageStartDelay = setTimeout(() => {
        // Initial burst of images - ALL AT ONCE
        for (let i = 0; i < 15; i++) {
          spawnImage();
        }
        // Keep spawning more
        chaosIntervalRef.current = setInterval(spawnImage, 200);
      }, 300);

      // Switch to scavenger text after 6 seconds (but keep chaos going!)
      const scavengerTimeout = setTimeout(() => {
        setShowScavengerText(true);
      }, 6000);

      return () => {
        currentAudioRefs.forEach((audio) => {
          audio?.pause();
        });
        currentActiveSounds.clear();
        if (chaosIntervalRef.current) {
          clearInterval(chaosIntervalRef.current);
        }
        if (soundCycleRef.current) {
          clearInterval(soundCycleRef.current);
        }
        clearTimeout(scavengerTimeout);
        clearTimeout(imageStartDelay);
      };
    }
  }, [phase, playRandomSound]);

  // Play fahhhhhh when "LOOK UNDER YOUR DESK" appears
  useEffect(() => {
    if (showScavengerText) {
      const fahhhh = new Audio("/memes/fahhhhhhhhhhhhhh.mp3");
      fahhhh.volume = 1;
      fahhhh.play().catch(() => { });
    }
  }, [showScavengerText]);

  const playClickSound = useCallback((soundIndex: number) => {
    const audio = new Audio(MEME_SOUNDS[soundIndex]);
    audio.volume = 1;
    audio.playbackRate = 0.8 + Math.random() * 0.4;
    audio.play().catch(() => { });
  }, []);

  // ERROR PHASE - Fake verification error
  if (phase === "error") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4" style={{ fontFamily: '"articulat-cf", sans-serif' }}>
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
          {/* Main content */}
          <div className="p-8 text-center">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo.png"
                alt="Logo"
                className="h-12 object-contain"
              />
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Verification link is invalid for this device
            </h1>

            {/* Error Description */}
            <p className="text-gray-500 mb-8 leading-relaxed">
              To continue, open the verification link on the device and browser from which you initiated the sign-in
            </p>

            {/* Warning Icon Circle */}
            <div className="flex justify-center mb-8">
              <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            {/* Re-verify link */}
            <button
              onClick={() => setPhase("captcha")}
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline cursor-pointer transition-colors"
            >
              Click here to re-verify →
            </button>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 py-4 px-8">
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
              <span>Secured by</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/clerkbw.webp" alt="Clerk" className="h-5 object-contain" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "captcha") {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full border border-gray-200">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Security Check</h2>
              <p className="text-sm text-gray-500">Verify you&apos;re human</p>
            </div>
          </div>

          {/* Prompt */}
          <div className="bg-blue-600 text-white p-3 rounded-t-lg">
            <p className="font-medium text-center">Select all images with the <span className="font-bold">GOAT 🐐</span></p>
          </div>

          {/* Captcha Grid */}
          <div className="grid grid-cols-3 gap-0.5 bg-gray-300 border-2 border-gray-300">
            {Array.from({ length: 9 }, (_, index) => (
              <button
                key={index}
                onClick={() => toggleTile(index)}
                className={`relative aspect-square overflow-hidden transition-all duration-150 ${selectedTiles.has(index) ? "ring-4 ring-blue-500 ring-inset brightness-110" : "hover:brightness-90"
                  }`}
              >
                <div
                  className="w-full h-full bg-cover bg-no-repeat"
                  style={{
                    backgroundImage: "url(/images/captcha.png)",
                    backgroundSize: "300% 300%",
                    backgroundPosition: `${(index % 3) * 50}% ${Math.floor(index / 3) * 50}%`,
                  }}
                />
                {selectedTiles.has(index) && (
                  <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span>reCAPTCHA</span>
            </div>
            <button
              onClick={handleVerify}
              disabled={selectedTiles.size === 0}
              className={`px-6 py-2 rounded font-medium transition-all ${selectedTiles.size > 0
                ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              VERIFY
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full border border-gray-200 text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying...</h2>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-100 rounded-full"
              style={{ width: `${Math.min(loadingProgress, 100)}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">{Math.min(Math.floor(loadingProgress), 100)}%</p>
        </div>
      </div>
    );
  }

  // CHAOS PHASE (with text that switches to scavenger hunt message)
  return (
    <div className="chaos-container min-h-screen overflow-hidden relative bg-black">
      {/* CENTER TEXT - Outside chaos-screen to avoid transform stacking context issues */}
      <div
        className="fixed inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 99999 }}
      >
        {!showScavengerText ? (
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-white drop-shadow-2xl animate-pulse"
              style={{ textShadow: '0 0 20px #ff00ff, 0 0 40px #ff00ff, 0 0 60px #ff00ff, 0 0 80px #ff00ff' }}>
              🎂 HAPPY BIRTHDAY 🎂
            </h1>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mt-4"
              style={{ textShadow: '0 0 20px #00ffff, 0 0 40px #00ff00, 0 0 60px #ffff00' }}>
              WINDSOR!!! 🎉🎊🥳
            </h2>
          </div>
        ) : (
          <div className="text-center px-4">
            <div className="bg-black/95 backdrop-blur-md rounded-3xl p-8 md:p-12 border-4 border-red-600 shadow-2xl">
              <h1
                className="text-5xl sm:text-7xl md:text-8xl font-black text-white animate-pulse uppercase tracking-wider"
                style={{
                  textShadow: '0 0 20px #ff0000, 0 0 40px #ff0000, 0 0 60px #ff0000',
                  fontFamily: '"articulat-heavy-cf", sans-serif',
                  WebkitTextStroke: '2px #ff0000'
                }}
              >
                LOOK UNDER<br />YOUR DESK
              </h1>
            </div>
          </div>
        )}
      </div>

      {/* Screen wobble effect */}
      <div className="chaos-screen absolute inset-0">
        {/* Flashing background */}
        <div className="flash-bg opacity-20 absolute inset-0" />

        {/* Confetti */}
        {generatedConfetti.map((piece) => (
          <div
            key={piece.id}
            className="confetti absolute w-3 h-3 rounded-sm"
            style={{
              left: `${piece.x}%`,
              top: `${piece.y}%`,
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}s`,
            }}
          />
        ))}

        {/* Chaos Images */}
        {chaosImages.map((img) => (
          <button
            key={img.id}
            onClick={() => playClickSound(img.soundIndex)}
            className="chaos-image absolute cursor-pointer transition-transform hover:scale-125"
            style={{
              left: `${img.x}%`,
              top: `${img.y}%`,
              transform: `scale(${img.scale}) rotate(${img.rotation}deg)`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt="chaos"
              className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-lg border-4 border-white shadow-2xl"
            />
          </button>
        ))}

        {/* Floating emojis */}
        <div className="emoji-rain absolute inset-0 pointer-events-none overflow-hidden">
          {floatingEmojis.map((item) => (
            <span
              key={item.id}
              className="floating-emoji absolute text-4xl"
              style={{
                left: `${item.left}%`,
                animationDelay: `${item.delay}s`,
                animationDuration: `${item.duration}s`,
              }}
            >
              {item.emoji}
            </span>
          ))}
        </div>

        {/* Spinning goat */}
        <div className="absolute top-4 right-4 text-8xl animate-spin" style={{ animationDuration: "0.5s" }}>
          🐐
        </div>
        <div className="absolute bottom-4 left-4 text-8xl animate-spin" style={{ animationDuration: "0.3s", animationDirection: "reverse" }}>
          🐐
        </div>

        {/* Corner explosions */}
        <div className="explosion absolute top-0 left-0 w-64 h-64" />
        <div className="explosion absolute top-0 right-0 w-64 h-64" style={{ animationDelay: "0.5s" }} />
        <div className="explosion absolute bottom-0 left-0 w-64 h-64" style={{ animationDelay: "1s" }} />
        <div className="explosion absolute bottom-0 right-0 w-64 h-64" style={{ animationDelay: "1.5s" }} />
      </div>
    </div>
  );
}
