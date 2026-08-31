import React, { useState } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  Bug, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { trackEvent } from '../utils/analytics';

interface UserFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress: string | null;
}

export const UserFeedbackModal: React.FC<UserFeedbackModalProps> = ({
  isOpen,
  onClose,
  userAddress,
}) => {
  const [category, setCategory] = useState<'improvement' | 'bug' | 'strategy' | 'other'>('improvement');
  const [feedbackText, setFeedbackText] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setIsSubmitting(true);

    const feedbackPayload = {
      category,
      message: feedbackText,
      feedback: feedbackText,
      contact: contactInfo || 'N/A',
      userAddress: userAddress || 'Anonymous',
      timestamp: new Date().toISOString(),
    };

    // 1. Record telemetry event
    trackEvent('developer_feedback_dispatched', {
      category,
      length: feedbackText.length,
      userAddress: userAddress || 'anonymous',
      contactProvided: !!contactInfo,
    });

    // 2. Save to local developer telemetry log
    try {
      const existing = JSON.parse(localStorage.getItem('lumex_dev_feedback') || '[]');
      existing.push(feedbackPayload);
      localStorage.setItem('lumex_dev_feedback', JSON.stringify(existing));
    } catch (err) {
      console.error(err);
    }

    // 3. Dispatch to Google Sheets / Google Apps Script Webhook (if configured)
    const googleWebhookUrl = import.meta.env.VITE_GOOGLE_FEEDBACK_WEBHOOK_URL;
    if (googleWebhookUrl) {
      try {
        await fetch(googleWebhookUrl, {
          method: 'POST',
          mode: 'no-cors', // Google Apps Script Web Apps require no-cors or redirect handling
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(feedbackPayload),
        });
      } catch (webhookErr) {
        console.warn('[Feedback Webhook] Google Sheets dispatch error:', webhookErr);
      }
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 400);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/[0.1] bg-[#0D1322] p-7 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00E599]/15 text-[#00E599]">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Developer Dispatch & Feedback</h3>
              <p className="text-xs text-slate-400">Direct channel to the Lumex engineering team</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00E599]/15 text-[#00E599] mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Feedback Dispatched Successfully!</h4>
            <p className="mt-2 text-xs text-slate-400 max-w-sm mx-auto">
              Thank you for contributing to Lumex Protocol. Your report has been routed directly to core maintainers.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFeedbackText('');
                onClose();
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#00E599] px-6 py-2.5 text-xs font-bold text-[#06080D] hover:bg-[#00C280] transition-all"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Category Selector */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'improvement', label: 'Feature', icon: Sparkles },
                  { id: 'bug', label: 'Bug Report', icon: Bug },
                  { id: 'strategy', label: 'Strategy', icon: TrendingUp },
                  { id: 'other', label: 'Inquiry', icon: MessageSquare },
                ].map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setCategory(cat.id as typeof category)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                        category === cat.id
                          ? 'border-[#00E599] bg-[#00E599]/10 text-[#00E599]'
                          : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback Content */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                Message / Report Details
              </label>
              <textarea
                required
                rows={4}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your suggestion, strategy idea, or report an issue..."
                className="w-full rounded-2xl border border-white/[0.1] bg-white/[0.03] p-3 text-xs text-white placeholder-slate-500 focus:border-[#00E599] focus:outline-none transition-all resize-none"
              />
            </div>

            {/* Optional Contact */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                Contact or GitHub Handle (Optional)
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="Email, Telegram @handle, or GitHub username..."
                className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#00E599] focus:outline-none transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !feedbackText.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00E599] to-[#00B074] py-3 text-xs font-bold text-[#06080D] shadow-md hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#06080D] border-t-transparent" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Dispatch to Engineering Team</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
