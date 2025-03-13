// InvitationViewPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function InvitationViewPage() {
  // URL例: /view/:id となっているので、id を受け取る
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialLoading, setInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [eventData, setEventData] = useState(null);
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

  // 取引詳細モーダルの状態
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // イベントデータの取得
  const fetchEvent = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || ''}/api/events/${id}`
      );
      if (!response.ok) {
        throw new Error('イベントの取得に失敗しました');
      }
      const data = await response.json();
      setEventData(data);
      // 取引が複数ある場合は精算結果を自動表示
      if (data?.transactions?.length > 1) {
        setShowSettlement(true);
      }
      return data;
    } catch (err) {
      console.error('Error fetching event:', err);
      setError(err.message);
      throw err;
    }
  };

  // 初期データ取得
  useEffect(() => {
    const fetchData = async () => {
      setInitialLoading(true);
      try {
        await fetchEvent();
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, [id]); // idが変更されたときのみ実行

  // メンバー追加処理
  const handleAddMember = async () => {
    if (isLoading) return;
    setIsLoading(true);
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
      await fetchEvent();
    } catch (err) {
      console.error(err);
      alert('メンバー追加に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // メンバーのステータス更新処理
  const handleUpdateMemberStatus = async (memberId, newStatus) => {
    if (isLoading) return;
    setIsLoading(true);
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
      await fetchEvent();
    } catch (err) {
      console.error(err);
      alert('メンバー更新に失敗しました');
    } finally {
      setIsLoading(false);
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

  // 支払者の選択処理を改善
  const handlePayerSelect = (payerName) => {
    console.log('Selected payer:', payerName);
    setNewTransPayer(payerName);
  };

  // 立替取引追加処理
  const handleAddTransaction = async (e) => {
    e.preventDefault(); // フォーム送信の防止
    
    // デバッグ用のログ
    console.log('Adding transaction with:', {
      description: newTransDescription,
      payer: newTransPayer,
      amount: newTransAmount,
      beneficiaries: newTransBeneficiaries
    });

    // 入力値の検証（trim()を追加）
    if (
      !newTransDescription.trim() ||
      !newTransPayer ||
      !newTransAmount ||
      newTransBeneficiaries.length === 0
    ) {
      console.log('Validation failed:', {
        descriptionEmpty: !newTransDescription.trim(),
        payerEmpty: !newTransPayer,
        amountEmpty: !newTransAmount,
        beneficiariesEmpty: newTransBeneficiaries.length === 0
      });
      alert('全ての項目を入力してください');
      return;
    }

    setIsLoading(true);
    try {
      const requestBody = {
        description: newTransDescription.trim(),
        payer: newTransPayer,
        amount: parseFloat(newTransAmount),
        beneficiaries: newTransBeneficiaries,
      };

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || ''}/api/events/${id}/transactions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '取引追加に失敗しました');
      }

      // フォームをリセット
      setNewTransDescription('');
      setNewTransPayer(''); // 支払者もリセット
      setNewTransAmount('');
      setNewTransBeneficiaries([]);
      setShowSettlement(false);

      // データを再取得
      await fetchEvent();

      // 取引一覧までスクロール
      setTimeout(() => {
        document.querySelector('#transactions')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Error adding transaction:', err);
      alert(err.message || '立替取引の追加に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 立替取引削除処理（削除前に確認）
  const handleDeleteTransaction = async (transactionId, e) => {
    e?.stopPropagation(); // イベントの伝播を停止
    if (isLoading) return;
    setIsLoading(true);
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
      await fetchEvent();
    } catch (err) {
      console.error('Error:', err);
      alert('取引削除に失敗しました');
    } finally {
      setIsLoading(false);
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

  // 精算結果をクリップボードにコピーする処理を改善
  const handleCopySettlement = async () => {
    try {
      await navigator.clipboard.writeText(settlementText);
      alert('精算結果をコピーしました');
    } catch (err) {
      console.error('Copy failed:', err);
      // フォールバックとして古い方法を試す
      const textArea = document.createElement('textarea');
      textArea.value = settlementText;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('精算結果をコピーしました');
      } catch (err) {
        console.error('Fallback copy failed:', err);
        alert('コピーに失敗しました');
      }
      document.body.removeChild(textArea);
    }
  };

  // 取引詳細モーダル
  const TransactionDetailModal = ({ transaction, onClose }) => {
    if (!transaction) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
          <div className="text-xl font-semibold text-gray-800 pb-2 border-b border-gray-200">
            {transaction.description}
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">支払者</div>
              <div className="text-lg font-medium text-indigo-600">{transaction.payer}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">支払先</div>
              <div className="bg-gray-50 rounded-lg p-3">
                {transaction.beneficiaries.map((beneficiary, index) => (
                  <div key={index} className="text-gray-700">
                    {beneficiary}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">金額</div>
              <div className="text-xl font-bold text-gray-900">
                ¥{transaction.amount.toLocaleString()}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="mt-6 w-full bg-gradient-to-r from-purple-100 via-pink-100 to-yellow-100 text-gray-700 px-4 py-3 rounded-xl font-medium hover:from-purple-200 hover:via-pink-200 hover:to-yellow-200 transition-all"
          >
            閉じる
          </button>
        </div>
      </div>
    );
  };

  // ローディングコンポーネント
  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
      <div className="space-y-3 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
        <div className="text-gray-600 font-medium">読み込み中...</div>
      </div>
    </div>
  );

  // 初期ローディング用コンポーネント
  const InitialLoadingOverlay = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto"></div>
      </div>
    </div>
  );

  // メインレンダリング
  if (initialLoading) return <InitialLoadingOverlay />;
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <p className="text-red-600 text-center">{error}</p>
      </div>
    </div>
  );
  if (!eventData) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <p className="text-gray-600 text-center">イベントが見つかりません</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 px-4 sm:px-6 py-8">
      {isLoading && <LoadingOverlay />}
      
      {/* ホームへ戻るボタン */}
      <div className="max-w-3xl mx-auto mb-4">
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
        className="w-full max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl p-6 sm:p-8"
      >
        {/* タイトルと日付 */}
        <div className="text-center pb-8">
          <h1 className="text-4xl font-bold text-indigo-800 mb-4 tracking-wide">
            {eventData.title}
          </h1>
          <p className="text-2xl font-medium text-gray-600">
            {eventData.eventDate}
          </p>
        </div>

        {/* クイックナビゲーション */}
        <div className="flex flex-col items-center gap-4 mb-8 border-b-2 border-purple-200 pb-8">
          {/* 1行目: メンバー、場所 */}
          <div className="flex justify-center gap-4">
            <a 
              href="#members" 
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#members')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-gray-600 bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 hover:from-purple-100 hover:via-pink-100 hover:to-yellow-100 transition-all whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-sm font-medium">メンバー</span>
            </a>
            <a 
              href="#location" 
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#location')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-gray-600 bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 hover:from-purple-100 hover:via-pink-100 hover:to-yellow-100 transition-all whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span className="text-sm font-medium">場所</span>
            </a>
          </div>
          
          {/* 2行目: 支払い記録、支払い履歴、精算結果 */}
          <div className="flex justify-center gap-4">
            <a 
              href="#expenses" 
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#expenses')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-gray-600 bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 hover:from-purple-100 hover:via-pink-100 hover:to-yellow-100 transition-all whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm font-medium">支払いを記録</span>
            </a>
            <a 
              href="#transactions" 
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#transactions')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-gray-600 bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 hover:from-purple-100 hover:via-pink-100 hover:to-yellow-100 transition-all whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-sm font-medium">支払い履歴</span>
            </a>
            <a 
              href="#settlement-results" 
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#settlement-results')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-gray-600 bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 hover:from-purple-100 hover:via-pink-100 hover:to-yellow-100 transition-all whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">精算結果</span>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {sortedMembers.map((member) => (
              <div
                key={member.id}
                onClick={() => {
                  if (member.id !== 'organizer') {
                    setEditingMember(member);
                    setIsEditMemberDialogOpen(true);
                  }
                }}
                className={`p-3 rounded-xl border ${
                  member.status === '参加'
                    ? 'bg-green-50 border-green-200'
                    : member.status === '不参加'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                } ${
                  member.id !== 'organizer' ? 'cursor-pointer hover:shadow-md' : ''
                } transition-all`}
              >
                <div className="text-center">
                  <div className={`text-gray-800 mb-1 truncate ${member.id === 'organizer' ? 'font-bold' : 'font-medium'}`}>
                    {member.name}
                    {member.id === 'organizer' && (
                      <span className="text-xs text-gray-500 ml-1">(幹事)</span>
                    )}
                  </div>
                  <div className={`text-sm ${
                    member.status === '参加'
                      ? 'text-green-600'
                      : member.status === '不参加'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                  }`}>
                    {member.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 場所＆集合メモセクション */}
        <div className="space-y-10 mt-16" id="location">
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
        <div id="expenses" className="space-y-6 mt-16">
          <h2 className="text-3xl font-semibold text-purple-800 text-center">
            支払いを記録する
          </h2>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-md hover:shadow-xl p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-2">
                <label className="text-lg text-gray-700">何に使いましたか？</label>
                <input
                  type="text"
                  value={newTransDescription}
                  onChange={(e) => setNewTransDescription(e.target.value)}
                  placeholder="例: タクシー代"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-lg font-medium text-gray-700">
                  誰が
                </label>
                <select
                  value={newTransPayer}
                  onChange={(e) => handlePayerSelect(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">選択してください</option>
                  {displayedMembers.map((member) => (
                    <option key={member.id} value={member.name}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-lg text-gray-700">誰の分を</label>
              <button
                onClick={() => {
                  const allNames = displayedMembers.map(member => member.name);
                  // 全員選択されている場合は全解除、そうでない場合は全選択
                  if (newTransBeneficiaries.length === allNames.length) {
                    setNewTransBeneficiaries([]);
                  } else {
                    setNewTransBeneficiaries(allNames);
                  }
                }}
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
              type="button"
              onClick={handleAddTransaction}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-md hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '追加中...' : '取引を追加する'}
            </button>
          </div>

          {/* 取引一覧 */}
          {eventData.transactions && eventData.transactions.length > 0 && (
            <div className="space-y-6" id="transactions">
              <h3 className="text-2xl font-semibold text-purple-800 text-center">
                支払い履歴
              </h3>
              <ul className="space-y-4">
                {eventData.transactions.map((tx) => (
                  <li 
                    key={tx.id} 
                    className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setSelectedTransaction(tx)}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 min-w-0 flex-1 mr-4">
                          <p className="text-lg font-medium text-gray-800">
                            {tx.description}
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span className="font-medium text-indigo-600 whitespace-nowrap">{tx.payer}</span>
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                            <div className="truncate">
                              {tx.beneficiaries.length > 2 
                                ? `${tx.beneficiaries.slice(0, 2).join('、')} 他${tx.beneficiaries.length - 2}名`
                                : tx.beneficiaries.join('、')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 flex-shrink-0">
                          <span className="text-lg font-bold text-gray-900 whitespace-nowrap">
                            ¥{tx.amount.toLocaleString()}
                          </span>
                          <button
                            onClick={(e) => handleDeleteTransaction(tx.id, e)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                            aria-label="削除"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* 精算結果セクション */}
              {eventData.transactions.length >= 2 && (
                <div id="settlement-results" className="bg-white border border-gray-200 rounded-2xl shadow-md p-8 mx-[-1rem]">
                  <h3 className="text-center text-2xl font-semibold mb-6 text-purple-800">
                    清算結果
                  </h3>
                  <div className="space-y-4">
                    {settlementResult.settlements.map((settlement, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mx-[-0.5rem]">
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

      {/* 取引詳細モーダル */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
}
