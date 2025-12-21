"use client";

import { useEffect, useRef } from "react";

export default function ScrollProgress() {
	const barRef = useRef<HTMLDivElement>(null);
	const rafRef = useRef<number | null>(null);

	useEffect(() => {
		const update = () => {
			const scrollTop = window.scrollY;
			const docHeight =
				document.documentElement.scrollHeight - window.innerHeight;

			const progress = docHeight > 0 ? scrollTop / docHeight : 0;

			if (barRef.current) {
				barRef.current.style.transform = `scaleX(${progress})`;
			}

			rafRef.current = requestAnimationFrame(update);
		};

		rafRef.current = requestAnimationFrame(update);

		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, []);

	return (
		<div className="fixed top-20 left-0 right-0 z-[60] h-[3px] bg-transparent">
			<div
				ref={barRef}
				className="h-full origin-left scale-x-0 bg-emerald-500 transition-none will-change-transform"
			/>
		</div>
	);
}
