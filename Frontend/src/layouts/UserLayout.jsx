import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

export default function UserLayout() {
    return (
        <div className="bg-white min-h-screen">
            {/* Page gap wrapper */}
            <div className="max-w-full mx-auto px-4">
                <Navbar />
                <main className="rounded-b-2xl pt-20 h-[calc(100vh-16px)]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
