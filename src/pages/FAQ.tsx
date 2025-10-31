import React, { useMemo, useState } from 'react';
import { faqData, FAQItem } from '../data/FAQdata';
import { Search, ChevronDown, ChevronUp, Tag } from 'lucide-react';

interface Props {
  onBack?: () => void;
}

const categories = Array.from(new Set(faqData.map((f) => f.category)));

const CATEGORY_STYLES: Record<string, { btnActive: string; btnInactive: string; badge: string; border: string; icon: string }> = {
  'temps-travail': {
    btnActive: 'bg-orange-600 text-white',
    btnInactive: 'bg-white text-orange-700 shadow-sm',
    badge: 'bg-orange-50 text-orange-700',
    border: 'border-orange-400',
    icon: 'text-orange-500'
  },
  formation: {
    btnActive: 'bg-purple-600 text-white',
    btnInactive: 'bg-white text-purple-700 shadow-sm',
    badge: 'bg-purple-50 text-purple-700',
    border: 'border-purple-400',
    icon: 'text-purple-500'
  },
  conges: {
    btnActive: 'bg-green-600 text-white',
    btnInactive: 'bg-white text-green-700 shadow-sm',
    badge: 'bg-green-50 text-green-700',
    border: 'border-green-400',
    icon: 'text-green-500'
  },
  absences: {
    btnActive: 'bg-red-600 text-white',
    btnInactive: 'bg-white text-red-700 shadow-sm',
    badge: 'bg-red-50 text-red-700',
    border: 'border-red-400',
    icon: 'text-red-500'
  },
  general: {
    btnActive: 'bg-slate-600 text-white',
    btnInactive: 'bg-white text-slate-700 shadow-sm',
    badge: 'bg-slate-50 text-slate-700',
    border: 'border-slate-400',
    icon: 'text-slate-500'
  }
};

const FAQ: React.FC<Props> = ({ onBack }) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openIds, setOpenIds] = useState<Record<number, boolean>>({});

  const highlightText = (text: string, q: string) => {
    if (!q) return text;
    try {
      const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")})`, 'ig'));
      return parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      );
    } catch (e) {
      return text;
    }
  };

  // Render simple inline markdown (**bold**) + preserve highlights
  const formatInline = (text: string, q: string) => {
    // Split by **bold** markers
    const parts: Array<{ bold: boolean; text: string }> = [];
    const regex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) {
      if (m.index > lastIndex) {
        parts.push({ bold: false, text: text.slice(lastIndex, m.index) });
      }
      parts.push({ bold: true, text: m[1] });
      lastIndex = m.index + m[0].length;
    }
    if (lastIndex < text.length) parts.push({ bold: false, text: text.slice(lastIndex) });

    // Map to React nodes applying highlight inside each segment
    return parts.map((p, i) => {
      const highlighted = highlightText(p.text, q);
      return p.bold ? (
        <strong key={i} className="font-semibold">{highlighted}</strong>
      ) : (
        <span key={i}>{highlighted}</span>
      );
    });
  };

  // Format answer text into paragraphs and simple bullet lists, applying inline formatting
  const renderFormattedAnswer = (text: string, q: string) => {
    const lines = text.split(/\r?\n/);
    const nodes: React.ReactNode[] = [];
    let listBuffer: { indent: number; content: string }[] = [];

    const flushList = () => {
      if (!listBuffer.length) return;
      // group by indent (simple handling)
      const groups: Record<number, string[]> = {};
      listBuffer.forEach((l) => {
        (groups[l.indent] ||= []).push(l.content);
      });
      // render groups in order of indent (lowest first)
      Object.keys(groups)
        .sort((a, b) => Number(a) - Number(b))
        .forEach((indent) => {
          const items = groups[Number(indent)];
          nodes.push(
            <ul key={`ul-${nodes.length}`} className={Number(indent) > 0 ? 'ml-6 list-disc' : 'list-disc'}>
              {items.map((it, idx) => (
                <li key={idx} className="mb-1 text-sm text-gray-700">{formatInline(it.trim().replace(/^[-*]\s?/, ''), q)}</li>
              ))}
            </ul>
          );
        });
      listBuffer = [];
    };

    for (const line of lines) {
      if (!line.trim()) {
        flushList();
        nodes.push(<div key={`br-${nodes.length}`} className="my-2" />);
        continue;
      }

      const matchList = line.match(/^(\s*)[-*]\s+(.*)$/);
      if (matchList) {
        const indent = matchList[1].length;
        listBuffer.push({ indent, content: matchList[0] });
        continue;
      }

      // normal paragraph
      flushList();
      nodes.push(
        <p key={`p-${nodes.length}`} className="text-sm text-gray-700 mb-2">
          {formatInline(line, q)}
        </p>
      );
    }

    flushList();
    return <div className="prose prose-sm max-w-full">{nodes}</div>;
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqData.filter((item) => {
      if (activeCategory && item.category !== activeCategory) return false;
      if (!q) return true;
      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
      );
    });
  }, [query, activeCategory]);

  const toggle = (id: number) => setOpenIds((s) => ({ ...s, [id]: !s[id] }));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-tight">FAQ</h1>
          <p className="mt-2 text-lg sm:text-xl text-slate-600">Questions fréquentes — guide rapide pour les agents</p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Retour"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md border border-blue-700"
          >
            Retour
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center w-full sm:w-1/2 bg-white p-2 rounded-lg shadow-sm">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une question ou un mot-clé..."
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1 text-sm rounded-full ${activeCategory === null ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 shadow-sm'}`}>
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory((c) => (c === cat ? null : cat))}
                  className={`px-3 py-1 text-sm rounded-full ${activeCategory === cat ? CATEGORY_STYLES[cat].btnActive : CATEGORY_STYLES[cat].btnInactive}`}>
                  <Tag className={`inline-block mr-1 -mt-1 ${CATEGORY_STYLES[cat].icon}`} /> {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center text-gray-500 py-8">Aucun résultat trouvé pour "{query}"</div>
        )}

        {filtered.map((item: FAQItem) => (
          <article key={item.id} className={`group relative overflow-visible transform transition-all duration-350 hover:scale-110 hover:shadow-2xl hover:ring-4 hover:ring-blue-300/30 bg-white rounded-xl border-l-4 ${CATEGORY_STYLES[item.category].border}`}>
            {/* subtle glowing backdrop that appears on hover */}
            <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-80 transition-opacity duration-300" style={{ background: 'linear-gradient(90deg, rgba(59,130,246,0.06), rgba(14,165,233,0.04))', filter: 'blur(18px)' }} />
            {/* accent bar */}
            <div className={`${CATEGORY_STYLES[item.category].btnActive} h-1 w-full`} />
            <header className="relative z-10 flex items-center justify-between p-4 cursor-pointer" onClick={() => toggle(item.id)}>
              <div className="flex-1">
                <h3 className="text-md font-semibold text-gray-800 transition-colors duration-200 group-hover:text-slate-900">{highlightText(item.question, query)}</h3>
                <div className="text-xs mt-1">
                  <span className={`${CATEGORY_STYLES[item.category].badge} px-2 py-0.5 rounded-full text-xs font-medium`}>{item.category}</span>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
                {openIds[item.id] ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </header>
            <div className={`px-4 pb-4 transition-all ${openIds[item.id] ? 'pt-0' : 'hidden'}`}>
              <div>{renderFormattedAnswer(item.answer, query)}</div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
