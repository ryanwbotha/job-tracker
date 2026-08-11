import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { generateDailyTips, SEARCH_IDEAS_CATALOG, DISCOVERY_CATEGORIES } from '../utils/strategyAdvisor';
import { Sparkles, Lightbulb, ChevronDown, ChevronUp, Copy, Check, Search } from 'lucide-react';

const BADGE_COLORS = {
  'badge-blue':    { bg: 'rgba(59,130,246,0.12)',  text: '#3b82f6' },
  'badge-emerald': { bg: 'rgba(16,185,129,0.12)',  text: '#10b981' },
  'badge-amber':   { bg: 'rgba(245,158,11,0.12)',  text: '#f59e0b' },
  'badge-purple':  { bg: 'rgba(139,92,246,0.12)',  text: '#8b5cf6' },
  'badge-rose':    { bg: 'rgba(244,63,94,0.12)',   text: '#f43f5e' },
};

function getBadgeStyle(badgeColor) {
  for (const [key, style] of Object.entries(BADGE_COLORS)) {
    if (badgeColor && badgeColor.includes(key)) return style;
  }
  return { bg: 'var(--badge-slate-bg)', text: 'var(--badge-slate-text)' };
}

export default function DailyStrategyCoach() {
  const { resources, contacts, meetings, targets } = useTracker();
  const [showIdeaDrawer, setShowIdeaDrawer] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  const tips = generateDailyTips(resources, contacts, meetings, targets);

  const filteredIdeas = activeCategory === 'all'
    ? SEARCH_IDEAS_CATALOG
    : SEARCH_IDEAS_CATALOG.filter(idea => idea.category === activeCategory);

  const handleCopyPrompt = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
      }}
      className="p-5 md:p-6 w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(59,130,246,0.15) 100%)' }}
          >
            <Sparkles size={15} color="#8b5cf6" />
          </div>
          <div>
            <h3 style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">
              AI Daily Strategy Coach
            </h3>
            <p style={{ color: 'var(--text-secondary)' }} className="text-[11px] mt-0.5">
              Personalized tips based on your 15-10-2 progress
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowIdeaDrawer(!showIdeaDrawer)}
          className="btn btn-ghost btn-xs"
          aria-label={showIdeaDrawer ? 'Hide ideas' : 'Show Resource/Contact Ideas'}
        >
          <Lightbulb size={13} color="#f59e0b" />
          <span>{showIdeaDrawer ? 'Hide Ideas' : 'Strategy Ideas'}</span>
          {showIdeaDrawer ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Daily Tips Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-3">
        {tips.map((tip, idx) => {
          const badgeStyle = getBadgeStyle(tip.badgeColor);
          return (
            <div
              key={idx}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
              }}
              className="p-4 flex flex-col gap-2"
            >
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold w-fit"
                style={{ background: badgeStyle.bg, color: badgeStyle.text }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {tip.badge}
              </span>
              <strong style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">{tip.title}</strong>
              <p style={{ color: 'var(--text-secondary)' }} className="text-xs leading-relaxed">{tip.text}</p>
            </div>
          );
        })}
      </div>

      {/* Idea Engine Drawer */}
      {showIdeaDrawer && (
        <div
          style={{ borderTop: '1px solid var(--border)' }}
          className="mt-5 pt-5 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <Search size={13} style={{ color: 'var(--text-secondary)' }} />
              <span style={{ color: 'var(--text-primary)' }} className="text-xs font-semibold">
                Preset Discovery Strategies
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 flex-wrap">
              {DISCOVERY_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={activeCategory === cat.id
                    ? { background: '#3b82f6', color: '#fff', border: '1px solid #3b82f6' }
                    : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                  }
                  className="rounded-md px-2.5 py-1 text-[11px] font-medium cursor-pointer transition-all"
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-3">
            {filteredIdeas.map((idea, index) => (
              <div
                key={index}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                }}
                className="p-4 flex flex-col gap-2"
              >
                <strong style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">{idea.title}</strong>
                <p style={{ color: 'var(--text-secondary)' }} className="text-xs leading-relaxed">{idea.description}</p>
                <div
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-secondary)',
                  }}
                  className="p-2.5 text-xs mt-1"
                >
                  <strong style={{ color: 'var(--text-primary)' }}>Action Tip:</strong> {idea.actionPrompt}
                </div>
                <button
                  onClick={() => handleCopyPrompt(idea.actionPrompt, index)}
                  className="btn btn-ghost btn-xs self-start mt-1"
                >
                  {copiedId === index ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedId === index ? 'Copied!' : 'Copy Prompt'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
