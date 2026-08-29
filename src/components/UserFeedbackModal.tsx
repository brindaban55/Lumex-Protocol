import React, { useState, useEffect } from 'react';
import { X, Star, MessageSquare, Send, CheckCircle2, ThumbsUp, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserFeedbackItem } from '../types';

interface UserFeedbackModalProps {
  userAddress: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_COMMUNITY_FEEDBACK: UserFeedbackItem[] = [
  {
    id: 'fb-1',
    userAddress: 'GD5J...9K2L',
    rating: 5,
    category: 'Yield Performance',
    feedbackText: 'The auto-compounding on the XLM/USDC pool is seamless! Gas fees are practically nonexistent compared to Ethereum L1 yield aggregators.',
    timestamp: '2 hours ago',
  },
  {
    id: 'fb-2',
    userAddress: 'GA8P...3X9Q',
    rating: 5,
    category: 'Transaction Speed',
    feedbackText: 'Sub-4-second block finality on Soroban makes deposits and withdrawals feel instant. Stellar DEX AMM integration is top tier.',
    timestamp: '5 hours ago',
  },
  {
    id: 'fb-3',
    userAddress: 'GC3T...7W4R',
    rating: 5,
    category: 'Security & Wallets',
    feedbackText: 'Loved the 1-Click Guest Testnet mode for testing without setting up extensions first. Non-custodial emergency exit gives great peace of mind.',
    timestamp: '1 day ago',
  },
  {
    id: 'fb-4',
    userAddress: 'GB9M...2K1P',
    rating: 4,
    category: 'UI & Aesthetics',
    feedbackText: 'Glassmorphism dark UI looks super slick. Dynamic APY and live fee breakdown makes vault mechanics very transparent.',
    timestamp: '2 days ago',
  },
];

export const UserFeedbackModal: React.FC<UserFeedbackModalProps> = ({
  userAddress,
  isOpen,
  onClose,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<UserFeedbackItem['category']>('Yield Performance');
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [feedbackList, setFeedbackList] = useState<UserFeedbackItem[]>(INITIAL_COMMUNITY_FEEDBACK);
  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem('lumex_user_feedback');
    if (saved) {
      try {
        setFeedbackList(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    const newItem: UserFeedbackItem = {
      id: `fb-${Date.now()}`,
      userAddress: userAddress ? `${userAddress.substring(0, 4)}...${userAddress.substring(userAddress.length - 4)}` : 'GUEST...USER',
      rating,
      category,
      feedbackText: feedbackText.trim(),
      timestamp: 'Just now',
    };

    const updated = [newItem, ...feedbackList];
    setFeedbackList(updated);
    localStorage.setItem('lumex_user_feedback', JSON.stringify(updated));

    setSubmitted(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      setSubmitted(false);
      setFeedbackText('');
    }, 2500);
  };

  const avgRating = (feedbackList.reduce((acc, f) => acc + f.rating, 0) / feedbackList.length).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl glass-panel border border-surface-border p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-border mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Product Validation & User Feedback</h3>
              <p className="text-xs text-slate-400">Share your experience testing Lumex Yield Optimizer on Stellar Testnet</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-surface hover:bg-surface-light text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Summary Stats */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-surface-light border border-surface-border mb-6 text-center">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Avg Rating</span>
            <div className="text-2xl font-black text-primary flex items-center justify-center space-x-1 mt-0.5">
              <span>{avgRating}</span>
              <Star className="w-4 h-4 fill-primary" />
            </div>
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Total Reviews</span>
            <div className="text-2xl font-black text-white font-mono mt-0.5">{feedbackList.length}</div>
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Satisfaction</span>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">98.5%</div>
          </div>
        </div>

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div className="p-4 rounded-2xl bg-surface-light border border-surface-border space-y-4">
            
            {/* Rating Stars */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Your Rating:</span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-600 hover:text-primary transition-colors"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating ? 'text-primary fill-primary' : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Feedback Category:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'Yield Performance',
                  'Transaction Speed',
                  'UI & Aesthetics',
                  'Security & Wallets',
                  'General',
                ].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat as any)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold text-left transition-all ${
                      category === cat
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-surface text-slate-400 border border-surface-border hover:border-slate-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Your Comments / Suggestions:</label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="How was your experience depositing into vaults, auto-compounding fees, or viewing real-time APY rates?..."
                className="w-full h-24 p-3 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 resize-none font-sans"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!feedbackText.trim() || submitted}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                submitted
                  ? 'bg-emerald-500 text-white'
                  : 'bg-primary hover:bg-primary-light text-background shadow-glow-primary'
              }`}
            >
              {submitted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Feedback Recorded! Thank you.</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Community Feedback</span>
                </>
              )}
            </button>

          </div>
        </form>

        {/* Live Community Feedback Feed */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Recent Verified Community Feedback ({feedbackList.length})
          </h4>

          <div className="space-y-2.5">
            {feedbackList.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-surface-light/60 border border-surface-border space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-white">{item.userAddress}</span>
                    <span className="px-2 py-0.5 rounded-full bg-surface border border-surface-border text-[10px] text-slate-400">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-primary fill-primary" />
                    ))}
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed">{item.feedbackText}</p>
                <div className="text-[10px] text-slate-500 font-mono">{item.timestamp}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
