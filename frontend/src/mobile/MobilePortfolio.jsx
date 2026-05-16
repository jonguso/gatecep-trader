import { motion } from "framer-motion";
import MobileBottomNav from "../components/mobile/MobileBottomNav";
import MobilePortfolioDashboard from "./MobilePortfolioDashboard";

export default function MobilePortfolio() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-slate-950 min-h-screen text-white pb-24"
    >
      
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-5">
          My Portfolio
        </h1>

        <MobilePortfolioDashboard />
      </div>

      <MobileBottomNav />
    </motion.div>
  );
}