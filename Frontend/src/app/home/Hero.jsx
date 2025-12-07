"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";

export default function Hero() {
    const router = useRouter();

    // turns div into a  animated slider
    const [emblaRef, embla] = useEmblaCarousel({
        align: "center",
        dragFree: true,
        containScroll: "trimSnaps",
    });

    const categoryIcons = [
        { name: "Poshaks", src: "/assets/icon-poshaks.png", to: "/poshaks" },
        { name: "Mukuts", src: "/assets/icon-mukut.png", to: "/mukuts" },
        { name: "Garland", src: "/assets/icon-mala.png", to: "/garlands" },
        { name: "Sarees", src: "/assets/icon-saree.png", to: "/sarees" },
        { name: "Kurtis", src: "/assets/icon-kurtis.png", to: "/kurtis" },
        { name: "Accessories", src: "/assets/icon-accessories.png", to: "/accessories" },
        { name: "Others", src: "/assets/icon-others.png", to: "/others" },
    ];

    const preventDrag = useCallback((e) => e.preventDefault(), []);

    // Motion variants (entrance-only)
    const headingV = {
        hidden: { y: -32, opacity: 0 },
        show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 90, damping: 16 } },
    };

    const taglineV = {
        hidden: { y: 24, opacity: 0 },
        show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 90, damping: 16, delay: 0.04 } },
    };

    const iconsContainerV = {
        hidden: {},
        show: { transition: { staggerChildren: 0.06, delayChildren: 0.16 } },
    };

    const iconV = {
        hidden: { y: 18, opacity: 0, scale: 0.98 },
        show: { y: 0, opacity: 1, scale: 1, transition: { duration: 0.36, ease: "easeOut" } },
    };

    // slider resize correctly when the browser window size changes
    useEffect(() => {
        if (!embla) return;
        const onResize = () => embla.reInit();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [embla]);

    return (
        <section className="w-full h-full px-6 lg:px-12">
            {/* header row */}
            <div className="flex justify-between items-center mb-16 lg:mb-20">
                <motion.h1
                    variants={headingV}
                    initial="hidden"
                    animate="show"
                    className="
            text-6xl md:text-7xl lg:text-7xl font-semibold leading-[1.4]
            bg-gradient-to-r from-[#b77b86] via-[#b55a64] to-[#702f3c]
            text-transparent bg-clip-text tracking-wide"
                >
                    Elegance
                </motion.h1>

                <motion.p
                    variants={taglineV}
                    initial="hidden"
                    animate="show"
                    className="text-xl md:text-3xl text-[var(--color-txt)] font-semibold text-right tracking-wide max-w-sm"
                >
                    Traditional charm
                    <br />
                    crafted with devotion.
                </motion.p>
            </div>

            {/* ICON CAROUSEL */}
            <motion.div variants={iconsContainerV} initial="hidden" animate="show" className="relative">

                <div ref={emblaRef} className="overflow-hidden" style={{ touchAction: "pan-x" }} aria-label="Category carousel">
                    <div className="flex items-center gap-12 md:gap-20 lg:gap-24">
                        {categoryIcons.map((icon, idx) => (
                            <motion.button
                                key={icon.name}
                                variants={iconV}
                                initial="hidden"
                                animate="show"
                                onClick={() => router.push(icon.to)}
                                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") router.push(icon.to); }}
                                onDragStart={preventDrag}
                                aria-label={icon.name}
                                className="flex-shrink-0 hover:cursor-pointer w-28 md:w-36 lg:w-44 flex flex-col items-center gap-3 bg-transparent rounded-lg focus:outline-none"
                                type="button"
                            >
                                <div className="w-16 md:w-20 lg:w-24 h-16 md:h-20 lg:h-24 rounded-full flex items-center justify-center">
                                    <img
                                        src={icon.src}
                                        alt={icon.name}
                                        className="w-12 md:w-14 lg:w-20 h-auto object-contain"
                                        draggable={false}
                                        onDragStart={preventDrag}
                                    />
                                </div>

                                <span className="text-xs md:text-sm text-[var(--color-txt)] opacity-90">
                                    {icon.name}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* subtle left/right fades */}
                <div
                    className="pointer-events-none absolute inset-y-0 left-0 w-24 md:w-32 lg:w-40"
                    style={{ background: "linear-gradient(90deg, rgba(242,228,201,1) 0%, rgba(242,228,201,0) 60%)" }}
                />
                <div
                    className="pointer-events-none absolute inset-y-0 right-0 w-24 md:w-32 lg:w-40"
                    style={{ background: "linear-gradient(270deg, rgba(242,228,201,1) 0%, rgba(242,228,201,0) 60%)" }}
                />
            </motion.div>
        </section>
    );
}
