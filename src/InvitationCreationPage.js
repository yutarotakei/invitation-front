// InvitationCreationPage.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// ------------------
// 共通のカードアニメーション設定
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

// ModernCard: 丸みのある境界線と影付きカード
function ModernCard({ children, className = '' }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={`bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl p-8 mb-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}

// TitleBlock: タイトルと幹事入力（中央揃え）
function TitleBlock({ title, setTitle, organizer, setOrganizer }) {
  return (
    <ModernCard className="text-center">
      <h2 className="text-3xl font-bold text-purple-800 mb-6">タイトル</h2>
      <input 
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="バーベキュー会"
        required
        className="w-full border border-purple-300 rounded-full py-3 px-4 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-center transition placeholder-gray-500"
      />
      <div className="mt-8">
        <label className="block text-lg font-semibold text-purple-700 mb-2">幹事</label>
        <input 
          type="text"
          value={organizer}
          onChange={(e) => setOrganizer(e.target.value)}
          placeholder="幹事名"
          required
          className="w-full max-w-xs mx-auto border border-purple-300 rounded-full py-3 px-4 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-center transition placeholder-gray-500"
        />
      </div>
    </ModernCard>
  );
}

// ヘルパー関数: YYYY-MM-DD を "M月D日" に変換
function formatDateJP(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${parseInt(month, 10)}月${parseInt(day, 10)}日`;
}

// DateBlock: 日付入力（イベント日、時間、終日チェック）
// 入力欄は中央揃え
function DateBlock({ eventDate, setEventDate, eventTime, setEventTime, allDay, setAllDay }) {
  return (
    <ModernCard className="text-center">
      <h2 className="text-3xl font-bold text-purple-800 mb-4">日付</h2>
      
      {/* 日付入力（オーバーレイで "-年-月-日" を表示） */}
      <div className="mb-6 relative">
        <input 
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          required
          className="mx-auto border border-purple-300 rounded-full py-3 px-4 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-center transition"
        />
        {!eventDate && (
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400">
            -年-月-日
          </span>
        )}
      </div>
      
      {/* 時間入力＋終日チェック */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="relative w-full">
          <input 
            type="time"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            disabled={allDay}
            required={!allDay}
            className={`w-full border border-purple-300 rounded-full py-3 px-4 text-center transition ${
              allDay
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-white focus:outline-none focus:ring-2 focus:ring-purple-400'
            }`}
          />
          {!eventTime && (
            <span className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400">
              :
            </span>
          )}
        </div>
        <div className="flex items-center justify-center">
          <input 
            type="checkbox"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
            id="allDay"
            className="h-5 w-5 text-purple-600 focus:ring-purple-400"
          />
          <label htmlFor="allDay" className="ml-2 text-gray-700 font-medium">終日</label>
        </div>
      </div>
    </ModernCard>
  );
}

// LocationBlock: 場所情報入力（検索バー、Google Map、メモ）
// 入力欄は中央揃え
function LocationBlock({ location, setLocation, meetingMemo, setMeetingMemo }) {
  const mapQuery =
    location.trim() !== '' ? encodeURIComponent(location) : encodeURIComponent('東京都新宿区');
  return (
    <ModernCard className="text-center">
      <h2 className="text-3xl font-bold text-purple-800 mb-4">場所</h2>
      <div className="relative w-full mb-4">
        <input 
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="場所を検索"
          required
          className="w-full border border-purple-300 rounded-full py-3 px-4 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-center transition placeholder-gray-500 pr-12"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      <div className="w-full aspect-square rounded-xl overflow-hidden mb-4 shadow-md">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFtHIML9rRnOnQ-BYX9RIQLa3vHiCBXYw&q=${mapQuery}`}
          allowFullScreen
          title="Google Map"
        ></iframe>
      </div>
      <div className="mb-2">
        <input 
          type="text"
          value={meetingMemo}
          onChange={(e) => setMeetingMemo(e.target.value)}
          placeholder="集合場所の目印（例：五反田駅東口改札前）"
          className="w-full border border-purple-300 rounded-full py-3 px-4 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-center transition placeholder-gray-500"
        />
      </div>
    </ModernCard>
  );
}

// Confirmation: 入力内容の確認
function Confirmation({ data, onEdit, onConfirm }) {
  const finalDate = data.allDay
    ? `${formatDateJP(data.eventDate)} (終日)`
    : `${formatDateJP(data.eventDate)} ${data.eventTime}`;
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-2xl shadow-md p-8 mb-6"
    >
      <h2 className="text-3xl font-bold text-purple-800 mb-6 text-center">確認</h2>
      <div className="space-y-4 text-left">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">タイトル</h3>
          <p className="text-gray-600">{data.title || '-'}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">幹事</h3>
          <p className="text-gray-600">{data.organizer || '-'}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">日時</h3>
          <p className="text-gray-600">{finalDate || '-'}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">場所</h3>
          <p className="text-gray-600">{data.location || '-'}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">集合場所メモ</h3>
          <p className="text-gray-600">{data.meetingMemo || '-'}</p>
        </div>
      </div>
      <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          onClick={onEdit}
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition"
        >
          編集する
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          onClick={onConfirm}
          className="px-6 py-3 bg-gradient-to-r from-teal-400 to-blue-500 text-white rounded-full hover:opacity-90 transition"
        >
          作成する
        </motion.button>
      </div>
    </motion.div>
  );
}

// InvitationCreationPage: イベント作成フォーム
export function InvitationCreationPage() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    title: '',
    organizer: '',
    eventDate: '',
    eventTime: '',
    allDay: false,
    location: '',
    meetingMemo: '',
  });
  const [confirmMode, setConfirmMode] = useState(false);

  const handleSubmit = () => {
    // 必須項目チェック：タイトル、幹事、日付、（終日でなければ時間）、場所
    if (
      !data.title || 
      !data.organizer || 
      !data.eventDate || 
      (!data.allDay && !data.eventTime) ||
      !data.location
    ) {
      alert('必須項目を入力してください。');
      return;
    }
    setConfirmMode(true);
  };

  // バックエンドにイベント作成リクエストを送信
  const handleConfirm = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || ''}/api/events`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }
      );
      if (!response.ok) {
        throw new Error('イベント作成に失敗しました');
      }
      const result = await response.json();
      // 作成成功後、取得したイベントIDの固有リンクへ遷移
      navigate(`/invitation/${result.eventId}`);
    } catch (error) {
      console.error(error);
      alert('イベント作成に失敗しました');
    }
  };

  const handleEdit = () => {
    setConfirmMode(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 p-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {/* ページ上部に「作成」というタイトル */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-purple-800">作成</h1>
      </div>
      <div className="w-full max-w-md mx-auto">
        <TitleBlock 
          title={data.title} 
          setTitle={(value) => setData({ ...data, title: value })}
          organizer={data.organizer}
          setOrganizer={(value) => setData({ ...data, organizer: value })}
        />
        <DateBlock 
          eventDate={data.eventDate}
          setEventDate={(value) => setData({ ...data, eventDate: value })}
          eventTime={data.eventTime}
          setEventTime={(value) => setData({ ...data, eventTime: value })}
          allDay={data.allDay}
          setAllDay={(value) => setData({ ...data, allDay: value })}
        />
        <LocationBlock 
          location={data.location}
          setLocation={(value) => setData({ ...data, location: value })}
          meetingMemo={data.meetingMemo}
          setMeetingMemo={(value) => setData({ ...data, meetingMemo: value })}
        />
        {!confirmMode ? (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            onClick={handleSubmit}
            className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-teal-400 to-blue-500 text-white rounded-full hover:opacity-90 transition"
          >
            作成
          </motion.button>
        ) : (
          <Confirmation data={data} onEdit={handleEdit} onConfirm={handleConfirm} />
        )}
      </div>
    </div>
  );
}
