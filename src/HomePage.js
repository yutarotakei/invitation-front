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

  // サンプル立替データ
  const sampleExpenses = [
    { title: "ポップコーン", amount: 2800 },
    { title: "パークチケット", amount: 32000 },
    { title: "グッズ", amount: 4562 }
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
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
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
        
        {/* CTA Button - MOVED UP */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
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
              className="relative z-10 flex items-center justify-center w-full"
            >
              <span className="flex items-center justify-center">
              イベントを作成！
                <motion.span
                  initial={false}
                  animate={{ x: isHovered ? 5 : 0, opacity: isHovered ? 1 : 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="ml-2"
                >
                  →
                </motion.span>
              </span>
            </motion.span>
          </motion.button>
          <p className="mt-4 text-gray-600">完全無料でご利用いただけます</p>
        </motion.div>

        {/* How to Use Section - NEW */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-white bg-opacity-90 rounded-2xl p-6 mb-12 shadow-lg"
        >
          <h2 className="text-3xl font-bold text-purple-800 mb-6 text-center">簡単4ステップ</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Step 1 */}
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 shadow-md relative overflow-hidden"
            >
              <div className="absolute top-4 left-4 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
              <h3 className="font-bold text-xl mb-3 pl-10">イベントを作成</h3>
              <p className="text-gray-700 mb-3">イベント名、幹事、日付を入力します</p>
              <div className="bg-white rounded-lg p-3 shadow-inner">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-purple-600">✓</span>
                  <span className="text-gray-700">イベント名：ディズニー旅行</span>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-purple-600">✓</span>
                  <span className="text-gray-700">幹事：タロウ</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-purple-600">✓</span>
                  <span className="text-gray-700">日時：6月15日</span>
                </div>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 shadow-md relative overflow-hidden"
            >
              <div className="absolute top-4 left-4 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
              <h3 className="font-bold text-xl mb-3 pl-10">みんなでシェア</h3>
              <p className="text-gray-700 mb-3">リンクが生成されるのでみんなにシェア</p>
              <div className="bg-white rounded-lg p-3 shadow-inner flex items-center justify-between">
                <span className="text-gray-600 truncate">https://event-app.jp/view/abc123</span>
                <span className="text-blue-500 whitespace-nowrap">コピー</span>
              </div>
              <div className="mt-3 flex space-x-2 justify-center">
                <div className="bg-green-500 text-white p-2 rounded-md text-xs">LINE</div>
                <div className="bg-blue-500 text-white p-2 rounded-md text-xs">Twitter</div>
                <div className="bg-gray-700 text-white p-2 rounded-md text-xs">メール</div>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 shadow-md relative overflow-hidden"
            >
              <div className="absolute top-4 left-4 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
              <h3 className="font-bold text-xl mb-3 pl-10">イベントを管理</h3>
              <p className="text-gray-700 mb-3">参加状況の管理・立替記録を入力</p>
              
              <div className="space-y-2 mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 border-2 border-green-500 flex-shrink-0"></div>
                  <span className="text-gray-800">タロウ（幹事）</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 border-2 border-green-500 flex-shrink-0"></div>
                  <span className="text-gray-800">ハナコ</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 border-2 border-red-500 flex-shrink-0"></div>
                  <span className="text-gray-800">ジロウ</span>
                  <span className="text-xs text-red-500">不参加</span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 shadow-inner">
                {sampleExpenses.map((expense, index) => (
                  <div key={index} className="flex justify-between items-center mb-1">
                    <span className="text-gray-700">{expense.title}</span>
                    <span className="font-semibold">¥{expense.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Step 4 */}
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 shadow-md relative overflow-hidden"
            >
              <div className="absolute top-4 left-4 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">4</div>
              <h3 className="font-bold text-xl mb-3 pl-10">かんたん精算</h3>
              <p className="text-gray-700 mb-3">自動計算された精算額をコピペで共有</p>
              
              <div className="bg-white rounded-lg p-3 shadow-inner space-y-2">
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-gray-800">ハナコ → タロウ</span>
                  <span className="font-bold text-indigo-600">¥19,681</span>
                </div>
                <div className="flex items-center text-gray-700 text-sm pt-1">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>コピーしてLINEで送信</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2 bg-gray-50 p-2 rounded">
                  <span className="text-gray-600">支払い方法</span>
                  <span className="font-medium text-gray-700">楽天ペイで送ってね</span>
                </div>
              </div>
            </motion.div>
          </div>
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
              <p className="text-center text-gray-600">「誰が参加するの？」を一目で確認</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-bold mb-1">立て替え管理</h3>
              <p className="text-center text-gray-600">「誰が何を払った？」をしっかり記録</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-2">🔄</div>
              <h3 className="font-bold mb-1">清算機能</h3>
              <p className="text-center text-gray-600">「誰が誰にいくら払うべき？」を自動計算</p>
            </div>
          </div>
        </motion.div>

        {/* Scenarios Section - NEW */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="bg-white bg-opacity-80 rounded-2xl p-6 mb-12 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">こんなシーンで使えます</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Disney Scenario */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 shadow-sm">
              <div className="flex items-center mb-3">
                <span className="text-3xl mr-3">🏰</span>
                <h3 className="font-bold text-lg">ディズニー旅行</h3>
              </div>
              <p className="text-gray-700 mb-3">チケット代、ホテル代、お土産代など、複数人での支払いを簡単管理！</p>
              <div className="bg-white bg-opacity-60 rounded-lg p-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>タロウ：パークチケット</span>
                  <span className="font-medium">¥32,000</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>ハナコ：ポップコーン</span>
                  <span className="font-medium">¥2,800</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>タロウ：グッズ</span>
                  <span className="font-medium">¥4,562</span>
                </div>
              </div>
            </div>
            
            {/* Group Travel Scenario */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-5 shadow-sm">
              <div className="flex items-center mb-3">
                <span className="text-3xl mr-3">🧳</span>
                <h3 className="font-bold text-lg">友達との旅行</h3>
              </div>
              <p className="text-gray-700 mb-3">急な予定変更でも参加状況をリアルタイムで更新、立て替え金も記録！</p>
              <div className="bg-white bg-opacity-60 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0"></div>
                  <span className="text-sm">タロウ：参加</span>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 flex-shrink-0"></div>
                  <span className="text-sm">ハナコ：未定→参加</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-red-500 flex-shrink-0"></div>
                  <span className="text-sm">ジロウ：参加→不参加</span>
                </div>
              </div>
            </div>
            
            {/* Date Scenario */}
            <div className="bg-gradient-to-r from-pink-50 to-red-50 rounded-xl p-5 shadow-sm">
              <div className="flex items-center mb-3">
                <span className="text-3xl mr-3">💑</span>
                <h3 className="font-bold text-lg">デート</h3>
              </div>
              <p className="text-gray-700 mb-3">デートの支払いを交互に、または割り勘で。もう「誰が払った？」が曖昧になりません！</p>
              <div className="bg-white bg-opacity-60 rounded-lg p-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>タロウ：映画代</span>
                  <span className="font-medium">¥3,600</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>ハナコ：ディナー</span>
                  <span className="font-medium">¥7,800</span>
                </div>
                <div className="text-sm mt-2 pt-2 border-t border-gray-200">
                  <span className="font-medium">精算：タロウ → ハナコ ¥2,100</span>
                </div>
              </div>
            </div>
            
            {/* Welcome Party Scenario */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-5 shadow-sm">
              <div className="flex items-center mb-3">
                <span className="text-3xl mr-3">🎉</span>
                <h3 className="font-bold text-lg">新歓・歓迎会</h3>
              </div>
              <p className="text-gray-700 mb-3">大人数でもスムーズに！幹事の負担を減らして、会計もスッキリ！</p>
              <div className="bg-white bg-opacity-60 rounded-lg p-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>幹事：会場予約金</span>
                  <span className="font-medium">¥10,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>会計：飲食代</span>
                  <span className="font-medium">¥45,000</span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200 text-sm">
                  <div className="flex justify-between">
                    <span>参加者一人あたり</span>
                    <span className="font-bold">¥3,667</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Button - SECOND INSTANCE REMOVED */}
      </div>
    </div>
  );
}