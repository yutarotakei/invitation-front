// InvitationViewPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function InvitationViewPage() {
  // URL例: /view/:id となっているので、id を受け取る
  const { id } = useParams();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // メンバー追加用の状態
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberStatus, setNewMemberStatus] = useState('参加');

  // メンバー編集用の状態
  const [isEditMemberDialogOpen, setIsEditMemberDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  // 立替取引用の状態
  const [newTransDescription, setNewTransDescription] = useState('');
  const [newTransPayer, setNewTransPayer] = useState('');
  const [newTransBeneficiaries, setNewTransBeneficiaries] = useState([]);
  const [newTransAmount, setNewTransAmount] = useState('');

  // 清算結果表示のオンオフ用
  const [showSettlement, setShowSettlement] = useState(false);

  // イベント詳細を取得する関数
  const fetchEvent = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || ''}/api/events/${id}`
      );
      if (!response.ok) {
        throw new Error('イベント情報の取得に失敗しました');
      }
      const data = await response.json();
      setEventData(data);
      if (data.members && data.members.length > 0) {
        setNewTransPayer(data.members[0].name);
      }
    } catch (err) {
      console.error(err);
      setError('イベント情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // メンバー追加処理
  const handleAddMember = async () => {
    if (!newMemberName.trim()) {
      alert('名前を入力してください');
      return;
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || ''}/api/events/${id}/members`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newMemberName, status: newMemberStatus }),
        }
      );
      if (!response.ok) {
        throw new Error('メンバー追加に失敗しました');
      }
      setNewMemberName('');
      setNewMemberStatus('参加');
      setIsMemberDialogOpen(false);
      fetchEvent();
    } catch (err) {
      console.error(err);
      alert('メンバー追加に失敗しました');
    }
  };

  // メンバーのステータス更新処理
  const handleUpdateMemberStatus = async (memberId, newStatus) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || ''}/api/events/${id}/members/${memberId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!response.ok) {
        throw new Error('メンバー更新に失敗しました');
      }
      setIsEditMemberDialogOpen(false);
      fetchEvent();
    } catch (err) {
      console.error(err);
      alert('メンバー更新に失敗しました');
    }
  };

  // 取引作成時に対象メンバーのON/OFF 切替
  const toggleBeneficiary = (memberName) => {
    if (newTransBeneficiaries.includes(memberName)) {
      setNewTransBeneficiaries(
        newTransBeneficiaries.filter((name) => name !== memberName)
      );
    } else {
      setNewTransBeneficiaries([...newTransBeneficiaries, memberName]);
    }
  };

  // 全員チェック機能
  const handleCheckAllBeneficiaries = () => {
    // 表示されている全メンバーの名前を取得
    const allNames = displayedMembers.map((member) => member.name);
    setNewTransBeneficiaries(allNames);
  };

  // 立替取引追加処理
  const handleAddTransaction = async () => {
    if (
      !newTransDescription.trim() ||
      !newTransPayer ||
      !newTransAmount ||
      newTransBeneficiaries.length === 0
    ) {
      alert('全ての項目を入力してください');
      return;
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || ''}/api/events/${id}/transactions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: newTransDescription,
            payer: newTransPayer,
            amount: parseFloat(newTransAmount),
            beneficiaries: newTransBeneficiaries,
          }),
        }
      );
      if (!response.ok) {
        throw new Error('取引追加に失敗しました');
      }
      setNewTransDescription('');
      setNewTransAmount('');
      setNewTransBeneficiaries([]);
      setShowSettlement(false);
      fetchEvent();
    } catch (err) {
      console.error(err);
      alert('立替取引の追加に失敗しました');
    }
  };

  // 立替取引削除処理（削除前に確認）
  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm('本当に削除しますか？')) return;
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || ''}/api/events/${id}/transactions/${transactionId}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) {
        throw new Error('取引削除に失敗しました');
      }
      setShowSettlement(false);
      fetchEvent();
    } catch (err) {
      console.error(err);
      alert('取引削除に失敗しました');
    }
  };

  const displayedMembers = [...(eventData?.members || [])];
  if (
    eventData?.organizer &&
    !displayedMembers.some((member) => member.name === eventData.organizer)
  ) {
    displayedMembers.unshift({
      id: 'organizer', // 固有IDがなければ文字列でもOK
      name: eventData.organizer,
      status: '参加',
    });
  }
  
  // メンバーをステータスによってソート
  const sortedMembers = [...displayedMembers].sort((a, b) => {
    // 主催者は常に最初
    if (a.id === 'organizer') return -1;
    if (b.id === 'organizer') return 1;
    
    // それ以外はステータス順
    const statusOrder = { '参加': 1, '不参加': 2, '未定': 3 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const computeSettlement = () => {
    if (!eventData || !eventData.transactions) {
      return { netBalances: {}, settlements: [] };
    }
  
    const netBalances = {};
  
    // displayedMembers を使って、organizer も含む全員の初期残高を設定
    displayedMembers.forEach((member) => {
      netBalances[member.name] = 0;
    });
  
    // 各取引を処理
    eventData.transactions.forEach((tx) => {
      const share = tx.amount / tx.beneficiaries.length;
      tx.beneficiaries.forEach((beneficiary) => {
        if (netBalances.hasOwnProperty(beneficiary)) {
          netBalances[beneficiary] -= share;
        } else {
          netBalances[beneficiary] = -share;
        }
      });
      if (netBalances.hasOwnProperty(tx.payer)) {
        netBalances[tx.payer] += tx.amount;
      } else {
        netBalances[tx.payer] = tx.amount;
      }
    });
  
    // 小数点以下を丸める（必要に応じて調整してください）
    Object.keys(netBalances).forEach((name) => {
      netBalances[name] = Math.round(netBalances[name]);
    });
  
    const settlements = [];
    let creditors = [];
    let debtors = [];
    Object.keys(netBalances).forEach((name) => {
      const balance = netBalances[name];
      if (balance > 0) {
        creditors.push({ name, balance });
      } else if (balance < 0) {
        debtors.push({ name, balance });
      }
    });
  
    creditors.sort((a, b) => b.balance - a.balance);
    debtors.sort((a, b) => a.balance - b.balance);
  
    let i = 0,
      j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(creditor.balance, -debtor.balance);
      if (amount > 0) {
        settlements.push({ from: debtor.name, to: creditor.name, amount });
        debtor.balance += amount;
        creditor.balance -= amount;
      }
      if (debtor.balance === 0) i++;
      if (creditor.balance === 0) j++;
    }
  
    return { netBalances, settlements };
  };
  
  // 精算結果（「精算を計算する！」ボタン押下時に利用）
  const settlementResult = computeSettlement();

  // 清算結果のテキスト（コピー用）
  const settlementText = settlementResult.settlements && settlementResult.settlements.length > 0
    ? settlementResult.settlements
        .map((s) => `${s.from} → ${s.to} : ¥${s.amount}`)
        .join('\n')
    : '全員清算済みです';

  // 精算結果をクリップボードにコピーする処理
  const handleCopySettlement = () => {
    navigator.clipboard.writeText(settlementText).then(() => {
      alert('精算結果をコピーしました');
    });
  };

  if (loading) return <div>読み込み中…</div>;
  if (error) return <div>{error}</div>;
  if (!eventData) return <div>イベントが見つかりません</div>;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 p-8 sm:p-12"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      {/* ホームへ戻るボタン */}
      <div className="mb-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-indigo-800 text-lg focus:outline-none"
        >
          &larr; ホームへ
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl p-8 space-y-12"
      >
        {/* ヘッダー：タイトル・日付 */}
        <div className="text-center pb-8 border-b-2 border-purple-200">
          <h1 className="text-4xl font-bold text-indigo-800 mb-4 tracking-wide">
            {eventData.title}
          </h1>
          <p className="text-2xl font-medium text-gray-600">
            {eventData.eventDate}
          </p>
        </div>

        {/* クイックナビゲーション */}
        <div className="sticky top-0 z-10 bg-white shadow-md rounded-2xl mt-8 mb-4">
          <div className="flex justify-around p-4 space-x-2">
            <a 
              href="#location" 
              className="flex-1 flex flex-col items-center px-4 py-2 rounded-xl text-gray-600 hover:bg-gradient-to-br hover:from-purple-100 hover:via-pink-100 hover:to-yellow-100 transition-all"
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium">場所</span>
            </a>
            <a 
              href="#expenses" 
              className="flex-1 flex flex-col items-center px-4 py-2 rounded-xl text-gray-600 hover:bg-gradient-to-br hover:from-purple-100 hover:via-pink-100 hover:to-yellow-100 transition-all"
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm font-medium">立替登録</span>
            </a>
            <a 
              href="#transactions" 
              className="flex-1 flex flex-col items-center px-4 py-2 rounded-xl text-gray-600 hover:bg-gradient-to-br hover:from-purple-100 hover:via-pink-100 hover:to-yellow-100 transition-all"
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-sm font-medium">取引一覧</span>
            </a>
          </div>
        </div>

        {/* メンバーセクション */}
        <div className="space-y-8">
          <h2 className="text-3xl font-semibold text-purple-800 text-center">
            メンバー
          </h2>
          <div className="flex justify-center">
            <button
              onClick={() => setIsMemberDialogOpen(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full shadow hover:opacity-90 transition"
            >
              メンバーを追加
            </button>
          </div>
          {/* グリッド表示：モバイルの場合、1行2列表示 */}
          <div className="grid grid-cols-2 gap-4">
            {sortedMembers.map((member) => (
              <div
                key={member.id}
                // 幹事は編集不可
                onClick={member.id !== 'organizer' ? () => {
                  setEditingMember(member);
                  setIsEditMemberDialogOpen(true);
                } : undefined}
                className="transform transition-all duration-200 hover:scale-102 hover:-translate-y-1 cursor-pointer"
              >
                <div className={`flex items-center rounded-2xl shadow px-2 py-2.5 border 
                  ${member.status === '参加'
                    ? 'bg-white border-green-200'
                    : member.status === '不参加'
                    ? 'bg-white border-red-200'
                    : 'bg-white border-yellow-200'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full z-20
                      ${member.status === '参加'
                        ? 'bg-green-400'
                        : member.status === '不参加'
                        ? 'bg-red-400'
                        : 'bg-yellow-400'
                      } shadow-sm`}
                    ></div>
                    <div className="w-8 h-8 rounded-xl shadow bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white">
                      <span className="text-lg font-bold">{member.name.charAt(0)}</span>
                    </div>
                  </div>
                  <div className="flex-1 pl-2 overflow-hidden">
                    <p className="font-medium text-sm tracking-wide text-gray-800 whitespace-nowrap overflow-hidden truncate">
                      {member.name.length > 5 ? `${member.name.slice(0, 5)}...` : member.name}
                    </p>
                    {member.id === 'organizer' && (
                      <span className="text-xs text-gray-500">幹事</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 場所＆集合メモセクション */}
        <div className="space-y-10" id="location">
          <h2 className="text-3xl font-semibold text-purple-800 text-center">
            場所
          </h2>
          {/* 場所テキスト表示 */}
          {eventData.location && (
            <p className="text-center text-lg text-gray-700 mb-2">
              {eventData.location}
            </p>
          )}
          <div className="rounded-xl overflow-hidden shadow-md hover:shadow-xl">
            {eventData.location ? (
              <iframe
                width="100%"
                height="320"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(
                  eventData.location
                )}`}
                allowFullScreen
                title="Google Map"
              ></iframe>
            ) : (
              <div className="w-full h-80 bg-gray-200 flex items-center justify-center">
                <p className="text-gray-600">
                  地図を表示するには場所を入力してください
                </p>
              </div>
            )}
            {eventData.meetingMemo && (
              <div className="p-4 bg-white border-t border-gray-200">
                <p className="text-sm text-gray-700 text-center">
                  {eventData.meetingMemo}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 立替登録セクション */}
        <div id="expenses" className="space-y-6">
          <h2 className="text-3xl font-semibold text-purple-800 text-center">
            立替を登録する
          </h2>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-md hover:shadow-xl p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-2">
                <label className="text-lg text-gray-700">何代</label>
                <input
                  type="text"
                  value={newTransDescription}
                  onChange={(e) => setNewTransDescription(e.target.value)}
                  placeholder="例: タクシー代"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-lg text-gray-700">誰が</label>
                <select
                  value={newTransPayer}
                  onChange={(e) => setNewTransPayer(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-indigo-500 transition"
                >
                  {displayedMembers.map((member) => (
                    <option key={member.id} value={member.name}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center mb-2">
                <label className="text-lg text-gray-700">誰の分の</label>
                <button
                  onClick={handleCheckAllBeneficiaries}
                  className="bg-gradient-to-r from-purple-100 via-pink-100 to-yellow-100 text-gray-700 px-4 py-1.5 rounded-full text-sm font-medium hover:shadow-md transition-all flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>全員を選択</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {displayedMembers.map((member) => (
                  <label
                    key={member.id}
                    className={`flex items-center space-x-2 p-2 rounded-lg border border-gray-200 
                      ${newTransBeneficiaries.includes(member.name) 
                        ? 'bg-gradient-to-r from-purple-50 via-pink-50 to-yellow-50 border-purple-200' 
                        : 'bg-white'
                      } transition-all cursor-pointer hover:shadow-sm`}
                  >
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                      checked={newTransBeneficiaries.includes(member.name)}
                      onChange={() => toggleBeneficiary(member.name)}
                    />
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {member.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-lg text-gray-700">いくら払った</label>
              <input
                type="number"
                value={newTransAmount}
                onChange={(e) => setNewTransAmount(e.target.value)}
                placeholder="例: 5000"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <button
              onClick={handleAddTransaction}
              className="w-full bg-gradient-to-r from-teal-400 to-blue-500 text-white rounded-full px-6 py-3 text-lg hover:opacity-90 transition"
            >
              取引を追加
            </button>
          </div>

          {/* 取引一覧 */}
          {eventData.transactions && eventData.transactions.length > 0 && (
            <div className="space-y-6" id="transactions">
              <h3 className="text-2xl font-semibold text-gray-800">取引一覧</h3>
              <ul className="space-y-4">
                {eventData.transactions.map((tx) => (
                  <li
                    key={tx.id}
                    className="p-6 bg-gray-50 rounded-lg shadow flex justify-between items-center"
                  >
                    <div>
                      <p className="text-xl font-medium text-gray-700">
                        {tx.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {tx.payer} → {tx.beneficiaries.join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-xl font-bold text-gray-900">
                        ¥{tx.amount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDeleteTransaction(tx.id)}
                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                        aria-label="削除"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 精算計算ボタン */}
          {eventData.transactions && eventData.transactions.length >= 2 && (
            <div className="flex justify-center">
              <button
                onClick={() => setShowSettlement(true)}
                className="mt-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-full text-2xl hover:opacity-90 transition"
              >
                精算を計算する！
              </button>
            </div>
          )}

          {/* 清算結果表示（デザイン改善） */}
          {showSettlement && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-8">
              <h3 className="text-center text-2xl font-semibold mb-6 text-purple-800">
                清算結果
              </h3>
              {settlementResult.settlements && settlementResult.settlements.length > 0 ? (
                <div className="space-y-4">
                  {settlementResult.settlements.map((s, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                      <span>{s.from} → {s.to}</span>
                      <span className="font-bold">¥{s.amount}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-lg text-green-600">全員清算済みです</p>
              )}
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleCopySettlement}
                  className="bg-gray-200 text-gray-800 p-2 rounded-full hover:opacity-90 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10m-10 4h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2h-4l-2-2H9L7 5H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* メンバー追加ダイアログ */}
      {isMemberDialogOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white border border-gray-200 rounded-xl shadow-lg p-10 w-full max-w-md space-y-6"
          >
            <h3 className="text-3xl font-semibold text-center text-purple-800">
              メンバーを追加
            </h3>
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="名前を入力"
              className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:border-indigo-500 transition"
            />
            <div className="flex justify-around">
              <button
                onClick={() => setNewMemberStatus('参加')}
                className={`px-6 py-3 rounded-full text-xl transition ${
                  newMemberStatus === '参加'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                }`}
              >
                参加
              </button>
              <button
                onClick={() => setNewMemberStatus('不参加')}
                className={`px-6 py-3 rounded-full text-xl transition ${
                  newMemberStatus === '不参加'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-red-100'
                }`}
              >
                不参加
              </button>
              <button
                onClick={() => setNewMemberStatus('未定')}
                className={`px-6 py-3 rounded-full text-xl transition ${
                  newMemberStatus === '未定'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-yellow-100'
                }`}
              >
                未定
              </button>
            </div>
            <button
              onClick={handleAddMember}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full px-6 py-3 text-xl hover:opacity-90 transition"
            >
              追加
            </button>
            <button
              onClick={() => setIsMemberDialogOpen(false)}
              className="w-full mt-4 bg-gray-200 text-gray-700 rounded-full px-6 py-3 text-xl hover:bg-gray-300 transition"
            >
              キャンセル
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* メンバー編集ダイアログ */}
      {isEditMemberDialogOpen && editingMember && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white border border-gray-200 rounded-xl shadow-lg p-10 w-full max-w-md space-y-6"
          >
            <h3 className="text-3xl font-semibold text-center text-purple-800">
              ステータス変更
            </h3>
            <p className="text-xl text-gray-700 text-center">
              {editingMember.name}
            </p>
            <div className="flex justify-around mt-4">
              <button
                onClick={() =>
                  handleUpdateMemberStatus(editingMember.id, '参加')
                }
                className="bg-green-600 text-white px-6 py-3 rounded-full text-xl hover:bg-green-700 transition"
              >
                参加
              </button>
              <button
                onClick={() =>
                  handleUpdateMemberStatus(editingMember.id, '不参加')
                }
                className="bg-red-600 text-white px-6 py-3 rounded-full text-xl hover:bg-red-700 transition"
              >
                不参加
              </button>
              <button
                onClick={() =>
                  handleUpdateMemberStatus(editingMember.id, '未定')
                }
                className="bg-yellow-500 text-white px-6 py-3 rounded-full text-xl hover:bg-yellow-600 transition"
              >
                未定
              </button>
            </div>
            <button
              onClick={() => setIsEditMemberDialogOpen(false)}
              className="w-full mt-4 bg-gray-200 text-gray-700 rounded-full px-6 py-3 text-xl hover:bg-gray-300 transition"
            >
              キャンセル
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
