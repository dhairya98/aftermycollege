"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

interface Heading {
	id: string;
	text: string;
	level: number;
}

export default function TableOfContents({ contentId }: { contentId: string }) {
	const [headings, setHeadings] = useState<Heading[]>([]);
	const [activeId, setActiveId] = useState<string>("");

	useEffect(() => {
		const root = document.getElementById(contentId);
		if (!root) return;

		const elements = Array.from(
			root.querySelectorAll<HTMLHeadingElement>("h2, h3")
		);

		const mapped = elements.map((el, index) => {
			if (!el.id) {
				el.id =
					el.textContent
						?.toLowerCase()
						.replace(/\s+/g, "-")
						.replace(/[^a-z0-9-]/g, "") + `-${index}`;
			}

			return {
				id: el.id,
				text: el.textContent || "",
				level: Number(el.tagName.replace("H", "")),
			};
		});

		setHeadings(mapped);

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
					}
				});
			},
			{
				rootMargin: "-96px 0px -70% 0px",
				threshold: 0,
			}
		);

		elements.forEach((el) => observer.observe(el));

		return () => observer.disconnect();
	}, [contentId]);

	if (!headings.length) return null;

	return (
		<nav className="sticky top-24">
			<h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">
				On this page
			</h2>

			<ul className="space-y-2 border-l border-gray-200 text-sm">
				{headings.map((h) => (
					<li
						key={h.id}
						className={clsx(
							"pl-4 border-l-2 transition-colors",
							h.level === 3 && "ml-4",
							activeId === h.id
								? "border-blue-600 text-blue-600 font-medium"
								: "border-transparent text-gray-600 hover:text-gray-900"
						)}
					>
						<a href={`#${h.id}`}>{h.text}</a>
					</li>
				))}
			</ul>
		</nav>
	);
}
