import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function HomePage() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
  const features = [
    { icon: "🧳", text: "旅行" },
    { icon: "🎉", text: "新歓" },
    { icon: "🏰", text: "ディズニー" },
    { icon: "💑", text: "デート" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-200 p-6 sm:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 pt-8"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 mb-4" 
              style={{ fontFamily: "'Nunito', sans-serif" }}>
            イベント管理アプリ
          </h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed"
          >
            友達との予定を簡単に管理、出欠確認から精算まで全てカンタン！
          </motion.p>
        </motion.div>

        {/* Features */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white bg-opacity-80 rounded-xl p-4 text-center shadow-md"
            >
              <div className="text-4xl mb-2">{feature.icon}</div>
              <div className="font-semibold text-gray-800">{feature.text}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Benefits */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="bg-white bg-opacity-80 rounded-2xl p-6 mb-12 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">こんな悩みを解決します</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-2">📋</div>
              <h3 className="font-bold mb-1">イベント管理</h3>
              <p className="text-center text-gray-600">日程調整や参加者の管理が簡単に</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-bold mb-1">立て替え管理</h3>
              <p className="text-center text-gray-600">誰が何を支払ったか記録できる</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-2">🔄</div>
              <h3 className="font-bold mb-1">清算機能</h3>
              <p className="text-center text-gray-600">複雑な割り勘も自動計算</p>
            </div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => navigate('/create')}
            className="relative bg-gradient-to-r from-teal-400 to-blue-500 text-white px-12 py-5 rounded-full text-2xl font-bold shadow-lg hover:shadow-xl transition overflow-hidden"
          >
            <motion.span
              initial={false}
              animate={{ x: isHovered ? 10 : 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative z-10 flex items-center justify-center"
            >
              イベントを作成！
              <motion.span
                initial={false}
                animate={{ x: isHovered ? 5 : 0, opacity: isHovered ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="ml-2"
              >
                →
              </motion.span>
            </motion.span>
          </motion.button>
          <p className="mt-4 text-gray-600">完全無料でご利用いただけます</p>
        </motion.div>
      </div>
    </div>
  );
}