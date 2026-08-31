import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { generateDailyTips, SEARCH_IDEAS_CATALOG, DISCOVERY_CATEGORIES } from '../utils/strategyAdvisor';
import { Sparkles, Lightbulb, ChevronDown, ChevronUp, Copy, Check, Search } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

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
    <Card className="p-5 md:p-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary"
          >
            <Sparkles size={15} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              AI Daily Strategy Coach
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Personalized tips based on your 15-10-2 progress
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="xs"
          onClick={() => setShowIdeaDrawer(!showIdeaDrawer)}
          aria-label={showIdeaDrawer ? 'Hide ideas' : 'Show Resource/Contact Ideas'}
        >
          <Lightbulb size={13} className="text-amber-500" />
          <span>{showIdeaDrawer ? 'Hide Ideas' : 'Strategy Ideas'}</span>
          {showIdeaDrawer ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </Button>
      </div>

      {/* Daily Tips Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-3">
        {tips.map((tip, idx) => {
          return (
            <div
              key={idx}
              className="p-4 flex flex-col gap-2 bg-muted/30 border border-border rounded-lg"
            >
              <Badge
                variant="secondary"
                className="w-fit"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {tip.badge}
              </Badge>
              <strong className="text-sm font-semibold text-foreground">{tip.title}</strong>
              <p className="text-xs leading-relaxed text-muted-foreground">{tip.text}</p>
            </div>
          );
        })}
      </div>

      {/* Idea Engine Drawer */}
      {showIdeaDrawer && (
        <div
          className="mt-5 pt-5 border-t border-border flex flex-col gap-4"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <Search size={13} className="text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">
                Preset Discovery Strategies
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 flex-wrap">
              {DISCOVERY_CATEGORIES.map(cat => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? "default" : "outline"}
                  size="xs"
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-3">
            {filteredIdeas.map((idea, index) => (
              <div
                key={index}
                className="p-4 flex flex-col gap-2 bg-muted/30 border border-border rounded-lg"
              >
                <strong className="text-sm font-semibold text-foreground">{idea.title}</strong>
                <p className="text-xs leading-relaxed text-muted-foreground">{idea.description}</p>
                <div
                  className="p-2.5 text-xs mt-1 bg-background border border-border rounded-md text-muted-foreground"
                >
                  <strong className="text-foreground">Action Tip:</strong> {idea.actionPrompt}
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => handleCopyPrompt(idea.actionPrompt, index)}
                  className="self-start mt-1"
                >
                  {copiedId === index ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedId === index ? 'Copied!' : 'Copy Prompt'}</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

