import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { generateDailyTips, SEARCH_IDEAS_CATALOG, DISCOVERY_CATEGORIES } from '../utils/strategyAdvisor';
import { Sparkles, Lightbulb, ChevronDown, ChevronUp, Copy, Check, Search } from 'lucide-react';

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
    <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-subtle)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Sparkles size={20} color="var(--accent-blue)" />
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>AI Daily Strategy Coach</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Personalized daily tips based on your 15-10-2 progress & captured resources</p>
          </div>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowIdeaDrawer(!showIdeaDrawer)}
          aria-label={showIdeaDrawer ? 'Hide Resource/Contacts Ideas' : 'Show Resource/Contacts Ideas'}
        >
          <Lightbulb size={16} color="var(--accent-blue)" />
          <span>{showIdeaDrawer ? 'Hide Resource/Contacts Ideas' : 'Show Resource/Contacts Ideas'}</span>
          {showIdeaDrawer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Daily Strategy Tips Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
        {tips.map((tip, idx) => (
          <div
            key={idx}
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className={`badge ${tip.badgeColor}`}>{tip.badge}</span>
            </div>
            <strong style={{ fontSize: '16px', color: 'var(--text-primary)' }}>{tip.title}</strong>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{tip.text}</p>
          </div>
        ))}
      </div>

      {/* Idea Engine Drawer ("Where to Look") with Expandable Animation */}
      {showIdeaDrawer && (
        <div className="expandable-panel" style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '16px', fontWeight: 700 }}>
              <Search size={16} color="var(--accent-blue)" />
              <span>Preset Discovery Strategies</span>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {DISCOVERY_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    background: activeCategory === cat.id ? 'var(--text-primary)' : '#ffffff',
                    color: activeCategory === cat.id ? '#ffffff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '0.35rem 0.75rem',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  aria-label={`Filter by ${cat.label}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
            {filteredIdeas.map((idea, index) => (
              <div
                key={index}
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.9rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem'
                }}
              >
                <strong style={{ fontSize: '16px', color: 'var(--text-primary)' }}>{idea.title}</strong>
                <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{idea.description}</p>
                <div style={{ background: '#ffffff', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '16px', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  <strong>Action Tip:</strong> {idea.actionPrompt}
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ alignSelf: 'flex-start', marginTop: '0.2rem', fontSize: '16px', padding: '0.35rem 0.75rem' }}
                  onClick={() => handleCopyPrompt(idea.actionPrompt, index)}
                  aria-label="Copy strategy prompt"
                >
                  {copiedId === index ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedId === index ? 'Copied Action' : 'Copy Strategy Prompt'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
