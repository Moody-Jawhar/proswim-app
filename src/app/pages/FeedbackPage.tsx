// Feedback survey — 15 questions about the coach and the experience for one
// group registration or private package. Ratings are 1–5 stars; the final
// question is free text. One submission per course per swimmer.

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle, Star, Send, CheckCircle2 } from 'lucide-react';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { PageLoader } from '../components/PageLoader';
import { PageHero } from '../components/PageHero';
import { t } from '../i18n';
import {
  getFeedbackV2Questions, getMyFeedbackV2, submitFeedbackV2,
  type FeedbackQuestionV2,
} from '../api/pswmApi';

const BRAND = '#1e5c97';

export function FeedbackPage() {
  const { refType, refId } = useParams<{ refType: string; refId: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const label = params.get('label') ?? '';
  const coachName = params.get('coach') ?? '';
  const locationName = params.get('location') ?? '';

  const [questions, setQuestions] = useState<FeedbackQuestionV2[]>([]);
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [texts, setTexts] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [qs, mine] = await Promise.all([getFeedbackV2Questions(), getMyFeedbackV2()]);
        setQuestions(qs);
        setAlreadyDone(mine.some(
          (m) => m.RefType === refType && Number(m.RefId) === Number(refId),
        ));
      } catch {
        setError(t('fb.loadError'));
      } finally {
        setLoading(false);
      }
    })();
  }, [refType, refId]);

  const ratingQs = useMemo(() => questions.filter((q) => q.QuestionType === 'rating'), [questions]);
  const answered = ratingQs.filter((q) => ratings[q.QuestionId] > 0).length;
  const allAnswered = ratingQs.length > 0 && answered === ratingQs.length;

  async function submit() {
    if (!allAnswered) { setError(t('fb.answerAll')); return; }
    setSubmitting(true);
    setError('');
    try {
      await submitFeedbackV2({
        refType: refType === 'Private' ? 'Private' : 'Group',
        refId: Number(refId),
        refLabel: label,
        coachName,
        locationName,
        answers: questions.map((q) => q.QuestionType === 'rating'
          ? { questionId: q.QuestionId, rating: ratings[q.QuestionId] }
          : { questionId: q.QuestionId, text: (texts[q.QuestionId] ?? '').trim() }),
      });
      setDone(true);
    } catch (e) {
      setError(e instanceof Error && e.message.includes('already') ? t('fb.alreadyDone') : t('fb.submitFail'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent pb-nav">
        <MobileHeader title={t('fb.title')} showBack />
        <PageLoader label={t('fb.loading')} />
        <MobileNav />
      </div>
    );
  }

  if (done || alreadyDone) {
    return (
      <div className="min-h-screen bg-transparent pb-nav">
        <MobileHeader title={t('fb.title')} showBack />
        <div className="px-4 pt-10">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
            <CheckCircle2 className="mx-auto mb-3" style={{ width: 44, height: 44, color: '#059669' }} />
            <p className="text-base font-bold text-slate-900">{t('fb.thanks')}</p>
            <p className="text-sm mt-1" style={{ color: '#64748B' }}>
              {alreadyDone && !done ? t('fb.alreadyDone') : t('fb.thanksBody')}
            </p>
            <button onClick={() => navigate(-1)}
              className="mt-5 rounded-xl text-sm font-bold text-white px-6 py-2.5"
              style={{ background: BRAND }}>
              {t('fb.back')}
            </button>
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-nav">
      <MobileHeader title={t('fb.title')} showBack />
      <PageHero title={t('fb.title')} subtitle={label || t('fb.subtitle')} slide={2} />

      <div className="px-4 pt-4">
        {/* Progress */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-semibold" style={{ color: '#64748B' }}>
              {t('fb.progress', { a: answered, b: ratingQs.length })}
            </span>
            <span className="num-stat text-xs font-bold" style={{ color: BRAND }}>
              {ratingQs.length ? Math.round((answered / ratingQs.length) * 100) : 0}%
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${ratingQs.length ? (answered / ratingQs.length) * 100 : 0}%`, background: BRAND }} />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl p-3 mb-4"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <AlertCircle className="size-4" style={{ color: '#DC2626', flexShrink: 0 }} />
            <p className="text-sm text-slate-900">{error}</p>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-3 mb-6">
          {questions.map((q, i) => (
            <div key={q.QuestionId} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-sm font-semibold text-slate-900 mb-2.5">
                <span className="num-stat font-bold" style={{ color: BRAND }}>{i + 1}.</span> {q.QuestionText}
              </p>
              {q.QuestionType === 'rating' ? (
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button key={v} type="button"
                      onClick={() => setRatings((prev) => ({ ...prev, [q.QuestionId]: v }))}
                      className="active:scale-90 transition-transform p-0.5">
                      <Star
                        style={{
                          width: 32, height: 32,
                          color: (ratings[q.QuestionId] ?? 0) >= v ? '#F59E0B' : '#E2E8F0',
                          fill: (ratings[q.QuestionId] ?? 0) >= v ? '#F59E0B' : 'none',
                        }}
                      />
                    </button>
                  ))}
                  {ratings[q.QuestionId] > 0 && (
                    <span className="num-stat text-sm font-bold ml-1" style={{ color: '#F59E0B' }}>
                      {ratings[q.QuestionId]}/5
                    </span>
                  )}
                </div>
              ) : (
                <textarea
                  value={texts[q.QuestionId] ?? ''}
                  onChange={(e) => setTexts((prev) => ({ ...prev, [q.QuestionId]: e.target.value }))}
                  rows={3}
                  placeholder={t('fb.optional')}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none"
                  style={{ resize: 'none' }}
                />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={submit}
          disabled={submitting || !allAnswered}
          className="w-full rounded-2xl text-sm font-bold text-white py-3.5 mb-6 flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
          style={{ background: allAnswered ? BRAND : '#94A3B8' }}
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          {submitting ? t('fb.submitting') : allAnswered ? t('fb.submit') : t('fb.answerAll')}
        </button>
      </div>

      <MobileNav />
    </div>
  );
}
