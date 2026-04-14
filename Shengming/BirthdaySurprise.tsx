"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const PHOTOS = [
	"/images/birthday/rizz.jpeg",
	"/images/birthday/IMG_7439.jpeg",
	"/images/birthday/DSC03281.jpg",
	"/images/birthday/IMG_2104.jpg",
	"/images/birthday/IMG_3053.jpg",
	"/images/birthday/IMG_3105.jpg",
	"/images/birthday/IMG_3106.jpg",
	"/images/birthday/IMG_3134.jpg",
	"/images/birthday/IMG_3419.JPG",
	"/images/birthday/IMG_3451.jpg",
	"/images/birthday/IMG_3500.jpg",
	"/images/birthday/IMG_3501.jpg",
	"/images/birthday/IMG_4601.jpg",
	"/images/birthday/IMG_5377.jpg",
	"/images/birthday/IMG_5749.jpg",
	"/images/birthday/IMG_6402.png",
	"/images/birthday/IMG_7038.jpg",
	"/images/birthday/IMG_7440.JPG",
	"/images/birthday/IMG_7441.JPG",
	"/images/birthday/a8706a076c7af2a5422a69aaf39ba58d.jpg",
];

const RIZZ_CAPTIONS = [
	"NO CAP HE'S THE BLUEPRINT 👑",
	"CERTIFIED OHIO RIZZ LORD 🔥",
	"BRO IS NOT REAL 💯",
	"LOWKEY THE FINAL BOSS FR FR",
	"THIS MAN IS BUSSIN RESPECTFULLY 🥶",
	"THE AURA IS UNMATCHED",
	"SLAY KING ATE AND LEFT NO CRUMBS 🏆",
	"GIVING MAIN CHARACTER NO CAP 🫡",
	"RENT FREE IN EVERYONE'S HEAD ✨",
	"MEWING ARC COMPLETE 🔓",
	"ITS GIVING LEGENDARY 💀",
	"HE REALLY SAID 'BET' AND COOKED 🧑‍🍳",
	"SKIBIDI BIRTHDAY SIGMA 🗿",
	"ONG THIS MAN IS VALID 😮‍💨",
	"LITERALLY THE GOAT NO DEBATE",
];

const CONFETTI_COLORS = [
	"#ff0000",
	"#ff2200",
	"#ff4400",
	"#ff6600",
	"#ff8800",
	"#ffaa00",
	"#ffcc00",
	"#ffdd00",
	"#ffee00",
	"#ffff00",
];

function ConfettiPiece({ index }: { index: number }) {
	const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
	const left = Math.random() * 100;
	const delay = Math.random() * 3;
	const duration = 2.5 + Math.random() * 3;
	const rotation = Math.random() * 720 - 360;
	const size = 6 + Math.random() * 10;
	const shape = index % 3;

	return (
		<motion.div
			initial={{ y: -20, x: 0, opacity: 1, rotate: 0 }}
			animate={{
				y: typeof window !== "undefined" ? window.innerHeight + 50 : 1000,
				x: (Math.random() - 0.5) * 200,
				opacity: [1, 1, 0],
				rotate: rotation,
			}}
			transition={{
				duration,
				delay,
				repeat: Infinity,
				ease: "linear",
			}}
			style={{
				position: "fixed",
				left: `${left}%`,
				top: -20,
				width: shape === 2 ? size : size * 0.4,
				height: shape === 0 ? size * 0.4 : size,
				backgroundColor: color,
				borderRadius: shape === 1 ? "50%" : shape === 2 ? "2px" : "0",
				zIndex: 9999,
				pointerEvents: "none",
			}}
		/>
	);
}

const ORBIT_POSITIONS = (() => {
	const count = 12;
	const positions: Array<{ x: number; y: number; rotate: number; size: number }> = [];
	for (let i = 0; i < count; i++) {
		const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
		const radius = 280;
		positions.push({
			x: Math.cos(angle) * radius,
			y: Math.sin(angle) * radius,
			rotate: (Math.random() - 0.5) * 24,
			size: 110 + Math.floor(Math.random() * 20),
		});
	}
	return positions;
})();

function FloatingPhoto({
	src,
	index,
}: {
	src: string;
	index: number;
}) {
	const pos = ORBIT_POSITIONS[index]!;

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0, rotate: 0 }}
			animate={{
				opacity: 1,
				scale: 1,
				rotate: [pos.rotate, pos.rotate + 4, pos.rotate - 4, pos.rotate],
			}}
			transition={{
				delay: 0.5 + index * 0.12,
				duration: 0.6,
				rotate: {
					duration: 4,
					repeat: Infinity,
					ease: "easeInOut",
					delay: index * 0.3,
				},
			}}
			className="absolute rounded-lg overflow-hidden shadow-2xl border-[3px] border-yellow-300/80"
			style={{
				width: pos.size,
				height: pos.size,
				left: "50%",
				top: "50%",
				marginLeft: pos.x - pos.size / 2,
				marginTop: pos.y - pos.size / 2,
				zIndex: 50 + index,
			}}
		>
			<Image
				src={src}
				alt={`Shengming birthday photo ${index + 1}`}
				fill
				className="object-cover"
				sizes="130px"
				unoptimized
			/>
		</motion.div>
	);
}

function GallerySlideshow() {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [caption, setCaption] = useState(RIZZ_CAPTIONS[0]);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % PHOTOS.length);
			setCaption(RIZZ_CAPTIONS[Math.floor(Math.random() * RIZZ_CAPTIONS.length)]);
		}, 1800);
		return () => clearInterval(interval);
	}, []);

	return (
		<div className="flex flex-col items-center gap-3">
			<motion.div
				animate={{
					scale: [1, 1.02, 1],
					rotate: [0, 1, -1, 0],
				}}
				transition={{ duration: 2, repeat: Infinity }}
				className="relative w-[320px] h-[320px] rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(255,150,0,0.6)] border-4 border-yellow-400/40"
			>
				<AnimatePresence mode="wait">
					<motion.div
						key={currentIndex}
						initial={{ opacity: 0, scale: 1.2, rotate: 5 }}
						animate={{ opacity: 1, scale: 1, rotate: 0 }}
						exit={{ opacity: 0, scale: 0.8, rotate: -5 }}
						transition={{ duration: 0.5 }}
						className="absolute inset-0"
					>
						<Image
							src={PHOTOS[currentIndex]!}
							alt="Shengming"
							fill
							className="object-cover"
							sizes="320px"
							unoptimized
							priority
						/>
					</motion.div>
				</AnimatePresence>
			</motion.div>

		<AnimatePresence mode="wait">
			<motion.p
				key={caption}
				initial={{ opacity: 0, y: 20, scale: 0.8 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				exit={{ opacity: 0, y: -20, scale: 0.8 }}
				className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-red-400 to-orange-400 relative z-[200] drop-shadow-[0_0_20px_rgba(255,150,0,0.6)]"
			>
				{caption}
			</motion.p>
		</AnimatePresence>
		</div>
	);
}

export function BirthdaySurprise() {
	const [visible, setVisible] = useState(true);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const startMusic = useCallback(() => {
		if (audioRef.current) return;
		const audio = new Audio("/images/birthday/rizz-music.mp3");
		audio.loop = true;
		audio.volume = 0.7;
		audio.play().catch(() => {});
		audioRef.current = audio;
	}, []);

	useEffect(() => {
		startMusic();
	}, [startMusic]);

	const handleDismiss = () => {
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current = null;
		}
		setVisible(false);
	};

	if (!visible) return null;

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 z-[9998] flex items-center justify-center"
			style={{
				background:
					"radial-gradient(ellipse at center, rgba(180,30,0,0.95) 0%, rgba(40,0,0,0.98) 100%)",
			}}
		>
			{Array.from({ length: 80 }).map((_, i) => (
				<ConfettiPiece key={i} index={i} />
			))}

			<div className="relative flex flex-col items-center justify-center z-[9999]">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="flex flex-col items-center"
				>
					<motion.h1
						initial={{ opacity: 0, y: -30, scale: 0.8 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						transition={{ duration: 0.6, type: "spring", stiffness: 150 }}
						className="text-5xl md:text-7xl font-black text-center mb-1 text-transparent bg-clip-text relative z-[200]"
						style={{
							backgroundImage: "linear-gradient(90deg, #ffee00, #ff2200, #ff6600)",
							WebkitBackgroundClip: "text",
						}}
					>
						HAPPY BIRTHDAY SHENGMING 🎂
					</motion.h1>

					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.3 }}
						className="text-xl text-yellow-200/80 font-bold tracking-wide mb-1 relative z-[200]"
					>
						BRO IS NOT REAL. THE AURA IS INSANE 😮‍💨
					</motion.p>

					<motion.div
						initial={{ opacity: 0, scale: 0 }}
						animate={{ opacity: 1, scale: [1, 1.1, 1] }}
						transition={{
							delay: 0.5,
							scale: { duration: 0.8, repeat: Infinity },
						}}
						className="text-2xl px-6 py-2 rounded-full relative z-[200] mb-2 text-yellow-100 font-black"
						style={{
							background: "linear-gradient(135deg, rgba(255,60,0,0.4), rgba(255,200,0,0.3))",
							border: "2px solid rgba(255,255,255,0.2)",
							backdropFilter: "blur(8px)",
						}}
					>
						🔥 RIZZ MODE: ACTIVATED 🔥
					</motion.div>

					<div className="relative flex items-center justify-center" style={{ width: 700, height: 700 }}>
						<div className="relative z-[100]">
							<GallerySlideshow />
						</div>

						{PHOTOS.slice(0, 12).map((src, i) => (
							<FloatingPhoto
								key={src}
								src={src}
								index={i}
							/>
						))}
					</div>
				</motion.div>

				<motion.button
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 3 }}
					onClick={handleDismiss}
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.95 }}
					className="fixed bottom-8 right-8 px-6 py-3 bg-yellow-500/10 backdrop-blur-md text-yellow-200/60 rounded-full text-sm font-medium border border-yellow-500/30 hover:bg-yellow-500/20 hover:text-yellow-100 transition-colors z-[10000]"
				>
					IGHT BET SHOW ME THE PRICING 💀
				</motion.button>
			</div>
		</motion.div>
	);
}
