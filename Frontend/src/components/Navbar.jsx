import { FaShoppingCart } from "react-icons/fa";
import { motion } from "framer-motion"; // Animations

export default function Navbar() {

    // Left side links
    const leftLinks = [
        { name: "Poshaks", link: "/poshaks" },
        { name: "Sarees", link: "/sarees" },
        { name: "Kurtis", link: "/kurtis" },
        { name: "Accessories", link: "/accessories" },
    ];

    // Right side links
    const rightLinks = [
        { name: "Our Story", link: "/our-story" },
        { name: "Contact Us", link: "/contact" },
    ];

    const isLoggedIn = true;
    const userInitial = "D"; // to be changed after implementing auth

    return (

        // Navbar animation 
        <motion.nav
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 80, damping: 12, duration: 1.2 }}
            className="rounded-t-2xl bg-[var(--color-primary)] fixed top-4 left-4 right-4 flex items-center h-[65px] z-50"
        >
            {/* Left */}
            <div className="flex-1 h-full flex items-center justify-around px-4 text-[var(--color-txt)] font-medium">
                {leftLinks.map((link, i) => (
                    <motion.a
                        key={link.name}
                        href={link.link}
                        whileHover={{ y: -2 }}
                        whileTap={{ y: 0 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.4 }}
                        className="cursor-pointer relative after:content-[''] after:block after:h-[2px] after:bg-[var(--color-txt)] after:w-0 after:absolute after:-bottom-1 after:left-0 after:transition-all after:duration-150 hover:after:w-full"
                    >
                        {link.name}
                    </motion.a>
                ))}
            </div>

            {/* Center */}
            <div
                className="bg-white flex-1 h-full flex items-center justify-center px-6 relative"
                style={{
                    clipPath: "polygon(0 0,100% 0, 86% 100%, 14% 100%)",
                }}
            >
                <motion.a
                    href="/"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 120, damping: 10, duration: 1.2 }}
                >
                    <img
                        src="/assets/rp-logo.png"
                        alt="Raghav Poshaak Logo"
                        className="h-[70px] object-contain relative -mt-1 mb-1"
                    />
                </motion.a>
            </div>

            {/* Right */}
            <div className="flex-1 h-full flex items-center justify-around px-4 text-[var(--color-txt)] font-medium">
                {rightLinks.map((link, i) => (
                    <motion.a
                        key={link.name}
                        href={link.link}
                        whileHover={{ y: -2 }}
                        whileTap={{ y: 0 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
                        className="cursor-pointer relative after:content-[''] after:block after:h-[2px] after:bg-[var(--color-txt)] after:w-0 after:absolute after:-bottom-1 after:left-0 after:transition-all after:duration-150 hover:after:w-full"
                    >
                        {link.name}
                    </motion.a>
                ))}

                {/* Cart + User/Auth */}
                <div className="flex items-center gap-12">
                    <motion.div
                        whileHover={{ scale: 1.2, rotate: -10 }}
                        whileTap={{ scale: 0.9, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 10 }}
                        className="relative cursor-pointer"
                    >
                        <FaShoppingCart className="h-6 w-6" />
                        <motion.span
                            animate={{ y: [0, -3, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="absolute -top-2 -right-2 bg-red-300 text-xs rounded-full h-4 w-4 flex items-center justify-center"
                        >
                            2
                        </motion.span>
                    </motion.div>

                    {isLoggedIn ? (
                        <motion.div
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-8 h-8 rounded-full bg-txt text-primary flex items-center justify-center font-bold cursor-pointer shadow-md"
                        >
                            {userInitial}
                        </motion.div>
                    ) : (
                        <motion.a
                            href="/signin"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 rounded-xl text-sm font-semibold tracking-wide 
                  bg-[var(--color-txt)] shadow-md text-[var(--color-primary)] transition-all duration-200 cursor-pointer inline-block text-center"
                        >
                            Sign In
                        </motion.a>
                    )}
                </div>
            </div>
        </motion.nav>
    );
}
