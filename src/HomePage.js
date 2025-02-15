import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 flex items-center justify-center p-8 sm:p-12"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        onClick={() => navigate('/create')}
        className="bg-gradient-to-r from-teal-400 to-blue-500 text-white px-12 py-4 rounded-full text-3xl shadow-md hover:shadow-xl transition"
      >
        イベントを作成する！
      </motion.button>
    </div>
  );
}
