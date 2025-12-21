import { useEffect, useRef, useState } from "react";

export default function Header({ siteTitle = "", menuItems = [] }) {
	const [open, setOpen] = useState(false);
	const menuRef = useRef(null);
	const btnRef = useRef(null);

	// click outside to close
	useEffect(() => {
		function onDoc(e) {
			if (
				open &&
				menuRef.current &&
				btnRef.current &&
				!menuRef.current.contains(e.target) &&
				!btnRef.current.contains(e.target)
			) {
				setOpen(false);
			}
		}
		document.addEventListener("click", onDoc);
		return () => document.removeEventListener("click", onDoc);
	}, [open]);

	// escape key to close
	useEffect(() => {
		function onKey(e) {
			if (e.key === "Escape") setOpen(false);
		}
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, []);

	return (
		<header
			className="site-header sticky top-0 z-50 w-full
             bg-white/90 border-b border-gray-200
             supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:backdrop-blur"
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div
					className={`nav-inner relative flex items-center justify-between h-20`}
				>
					{/* Left: Explore */}
					<div className="flex items-center">
						<div className="relative explore-group">
							<button
								ref={btnRef}
								id="exploreBtn"
								aria-haspopup="true"
								aria-expanded={open}
								onClick={() => setOpen((s) => !s)}
								className="px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 nav-btn bg-white"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M4 6h16M4 12h16M4 18h16"
									></path>
								</svg>
								<span>Explore</span>
							</button>

							<div
								ref={menuRef}
								id="exploreMenu"
								role="menu"
								aria-label="Explore menu"
								className={`absolute left-0 mt-2 w-56 rounded-md shadow-lg border border-gray-200 bg-white z-[100] transform transition-all origin-top
									${
										open
											? "opacity-100 translate-y-0 scale-100 block"
											: "opacity-0 -translate-y-1 scale-95 pointer-events-none hidden"
									}`}
								style={{ display: open ? "block" : "none" }}
							>
								<div className="py-1">
									{menuItems.map((item, idx) => (
										<a
											key={idx}
											href={item.href || "#"}
											role="menuitem"
											className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
										>
											{item.label}
										</a>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Center: Logo */}
					<a
						href="/"
						className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 logo-center "
					>
						<img
							src="/assets/after_my_college.png"
							alt={siteTitle}
							style={{ height: 40 }}
						/>
					</a>

					{/* Right: Actions */}
					{/* <div className="flex items-center space-x-4">
						<a href="#" className="text-sm">
							Log in
						</a>
						<a href="#" className="px-3 py-2 rounded-md text-sm">
							Sign up
						</a>
					</div> */}
				</div>
			</div>
		</header>
	);
}
