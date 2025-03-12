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

  // 立替取引削除処理
  const handleDeleteTransaction = async (transactionId) => {
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
  // 精算結果のテキスト（各行：「支払者 → 対象者 : ¥金額」）
  const settlementText =
    settlementResult.settlements && settlementResult.settlements.length > 0
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
                onClick={() => {
                  // 幹事の場合はクリックイベントを無効化
                  if (member.id !== 'organizer') {
                    setEditingMember(member);
                    setIsEditMemberDialogOpen(true);
                  }
                }}
                className={`flex items-center p-2 rounded-lg transition-all 
                  ${member.id !== 'organizer' ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed opacity-75'}`}
              >
                {/* アバター部分：ステータスを円の枠線で表現 */}
                <div className="relative flex-shrink-0 mr-2">
                  {/* 幹事の場合は王冠アイコンを表示 */}
                  {member.id === 'organizer' && (
                    <div className="absolute -top-2 -right-2 text-yellow-400">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z"/>
                      </svg>
                    </div>
                  )}
                  <div className={`w-9 h-9 rounded-full 
                    ${member.status === '参加'
                      ? 'border-4 border-green-400 shadow-[0_0_0_3px_rgba(74,222,128,0.5)]'
                      : member.status === '不参加'
                      ? 'border-4 border-red-400 shadow-[0_0_0_3px_rgba(248,113,113,0.5)]'
                      : 'border-4 border-yellow-400 shadow-[0_0_0_3px_rgba(250,204,21,0.5)]'
                    } p-0.5`}
                  >
                    <div className="w-full h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-700 flex items-center justify-center text-white text-sm font-bold">
                      {member.name.charAt(0)}
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-normal text-gray-700 bg-gray-50 px-3 py-1.5 rounded-md">
                    {member.name.length > 4 
                      ? `${member.name.slice(0, 4)}...` 
                      : member.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* クイックナビゲーション */}
        <div className="sticky top-0 z-10 bg-white shadow-md rounded-lg mt-8 mb-4 p-4">
          <div className="flex justify-around text-sm">
            <a href="#location" className="flex flex-col items-center text-gray-600 hover:text-indigo-600">
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              場所
            </a>
            <a href="#expenses" className="flex flex-col items-center text-gray-600 hover:text-indigo-600">
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              立替登録
            </a>
            <a href="#transactions" className="flex flex-col items-center text-gray-600 hover:text-indigo-600">
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              取引一覧
            </a>
          </div>
        </div>

        {/* 場所セクション */}
        <div id="location" className="space-y-4">
          <h2 className="text-3xl font-semibold text-purple-800 text-center">場所</h2>
          <p className="text-lg text-gray-700 text-center">{eventData.location}</p>
          {/* 既存のマップコード */}
        </div>

        {/* 立替登録セクション */}
        <div id="expenses" className="space-y-6">
          {/* 既存のコード */}
          <div className="flex flex-col space-y-2">
            <label className="text-lg text-gray-700">誰の分の</label>
            <div className="space-y-2">
              <button
                onClick={() => {
                  const allMembers = displayedMembers.map(m => m.name);
                  setNewTransBeneficiaries(allMembers);
                }}
                className="mb-2 w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition"
              >
                全員を選択
              </button>
              <div className="flex flex-wrap gap-2">
                {/* 既存のチェックボックス */}
              </div>
            </div>
          </div>
        </div>

        {/* 取引一覧セクション */}
        <div id="transactions" className="space-y-6">
          {/* 既存のコードを修正 */}
          {eventData.transactions && eventData.transactions.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-800">取引一覧</h3>
              <ul className="space-y-4">
                {eventData.transactions.map((tx) => (
                  <li key={tx.id} className="p-6 bg-gray-50 rounded-lg shadow flex justify-between items-center">
                    <div>
                      <p className="text-xl font-medium text-gray-700">{tx.description}</p>
                      <p className="text-sm text-gray-500">{tx.payer} → {tx.beneficiaries.join(', ')}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-xl font-bold text-gray-900">¥{tx.amount.toLocaleString()}</span>
                      <button
                        onClick={() => {
                          if (window.confirm('この取引を削除してもよろしいですか？')) {
                            handleDeleteTransaction(tx.id);
                          }
                        }}
                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                        aria-label="削除"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 精算結果表示 */}
        {showSettlement && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-8">
            <h3 className="text-center text-2xl font-semibold mb-6 text-purple-800">
              清算結果
            </h3>
            <div className="space-y-4">
              {settlementResult.settlements.map((settlement, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-700">{settlement.from}</span>
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <span className="font-medium text-gray-700">{settlement.to}</span>
                  </div>
                  <span className="text-lg font-bold text-indigo-600">
                    ¥{settlement.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={handleCopySettlement}
              className="mt-6 w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-200 transition"
            >
              結果をコピー
            </button>
          </div>
        )}
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
            {/* ステータス選択ボタン群 */}
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
