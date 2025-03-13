import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 flex flex-col items-center justify-center p-8 sm:p-12"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 max-w-2xl"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">イベント管理アプリ</h1>
        <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
          旅行、新歓、ディズニー、デートなど<br />
          イベント管理や出欠、立て替え管理、清算に便利なアプリです！
        </p>
      </motion.div>
      
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        onClick={() => navigate('/create')}
        className="bg-gradient-to-r from-teal-400 to-blue-500 text-white px-12 py-4 rounded-full text-3xl shadow-md hover:shadow-xl transition"
      >
        イベントを作成！
      </motion.button>
    </div>
  );
}