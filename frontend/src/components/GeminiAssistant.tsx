import { useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, LoaderCircle, Send, Sparkles, X } from 'lucide-react';
import { canteens, menuItems } from '@/data/mockData';
import { useApp } from '@/hooks/useAppContext';

type ChatMessage = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
};

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const model = (import.meta.env.VITE_GEMINI_MODEL as string | undefined) || 'gemini-2.5-flash';

const quickPrompts = ['Best under ₹100', 'Fast vegetarian', 'What is trending?'];

function menuContext() {
  return menuItems.map((item) => {
    const canteen = canteens.find((entry) => entry.id === item.canteenId)?.name || 'Campus canteen';
    const tags = [item.isVeg ? 'vegetarian' : 'non-vegetarian', item.isFast ? 'fast' : '', item.isTrending ? 'trending' : '']
      .filter(Boolean)
      .join(', ');
    return `${item.name} at ${canteen}: ₹${item.price}, ${item.prepTime}, ${tags}`;
  }).join('\n');
}

function localFoodReply(message: string) {
  const query = message.toLowerCase();
  let matches = menuItems.filter((item) => item.inStock);

  const budgetMatch = query.match(/(?:under|below|within|₹|rs\.?|rupees?)\s*(\d+)/i);
  if (budgetMatch) matches = matches.filter((item) => item.price <= Number(budgetMatch[1]));
  if (/veg|vegetarian/.test(query)) matches = matches.filter((item) => item.isVeg);
  if (/fast|quick|soon|hurry/.test(query)) matches = matches.filter((item) => item.isFast);
  if (/trend|popular|hot/.test(query)) matches = matches.filter((item) => item.isTrending);
  if (/coffee|cafe|drink|beverage/.test(query)) {
    matches = matches.filter((item) => item.category === 'Beverages' || /coffee|tea|latte|cappuccino/i.test(item.name));
  }
  if (/dessert|sweet/.test(query)) matches = matches.filter((item) => item.category === 'Desserts');
  if (/breakfast|south indian|dosa|idli/.test(query)) matches = matches.filter((item) => item.canteenId === 'c2');

  const picks = matches
    .sort((a, b) => Number(Boolean(b.isTrending)) - Number(Boolean(a.isTrending)) || a.price - b.price)
    .slice(0, 3);

  if (!picks.length) {
    return 'I could not find an exact match, but I can help by budget, vegetarian choice, canteen, or preparation time.';
  }

  const intro = /trend|popular|hot/.test(query)
    ? 'These are popular right now:'
    : /fast|quick|soon|hurry/.test(query)
      ? 'These should be ready quickly:'
      : 'Here are my best menu matches:';
  const list = picks.map((item) => {
    const canteen = canteens.find((entry) => entry.id === item.canteenId)?.name;
    return `${item.name} from ${canteen} for ₹${item.price} (${item.prepTime})`;
  }).join(' • ');
  return `${intro} ${list}.`;
}

async function askGemini(messages: ChatMessage[]) {
  if (!apiKey) return localFoodReply(messages[messages.length - 1].text);

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{
          text: `You are the concise Fast Feast campus food assistant. Recommend only items in this live menu. Mention item, canteen, price and preparation time. Keep replies under 80 words.\n\n${menuContext()}`,
        }],
      },
      contents: messages.slice(-8).map((entry) => ({
        role: entry.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: entry.text }],
      })),
      generationConfig: { temperature: 0.5, maxOutputTokens: 180 },
    }),
  });

  if (!response.ok) throw new Error('Gemini request failed');
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || '').join('').trim();
  if (!text) throw new Error('Gemini returned an empty response');
  return text;
}

export default function GeminiAssistant() {
  const { state } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, role: 'assistant', text: 'Hi! Tell me your budget or craving and I will find something tasty.' },
  ]);
  const nextId = useRef(2);

  const hidden = ['splash', 'onboarding', 'login', 'canteenDashboard', 'admin'].includes(state.screen);
  const hasBottomNav = ['home', 'orders', 'offers', 'groupOrder', 'profile'].includes(state.screen);
  const hasCartBar = hasBottomNav && state.cart.length > 0;
  const positionClass = useMemo(() => {
    if (hasCartBar) return 'bottom-44';
    if (hasBottomNav) return 'bottom-24';
    return 'bottom-4';
  }, [hasBottomNav, hasCartBar]);
  const panelHeightClass = useMemo(() => {
    if (hasCartBar) return 'h-[min(520px,calc(100dvh-16rem))]';
    if (hasBottomNav) return 'h-[min(520px,calc(100dvh-11rem))]';
    return 'h-[min(520px,calc(100dvh-6rem))]';
  }, [hasBottomNav, hasCartBar]);

  if (hidden) return null;

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;

    const userMessage: ChatMessage = { id: nextId.current++, role: 'user', text: trimmed };
    const conversation = [...messages, userMessage];
    setMessages(conversation);
    setInput('');
    setIsThinking(true);

    try {
      const reply = await askGemini(conversation);
      setMessages((current) => [...current, { id: nextId.current++, role: 'assistant', text: reply }]);
    } catch {
      setMessages((current) => [...current, {
        id: nextId.current++,
        role: 'assistant',
        text: `${localFoodReply(trimmed)} I am using the on-device menu guide right now.`,
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <div className={`absolute ${positionClass} right-3 sm:right-5 z-[60] pointer-events-none`}>
      <AnimatePresence>
        {isOpen && (
          <motion.section
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            aria-label="Gemini food assistant"
            className={`pointer-events-auto absolute bottom-16 right-0 w-[calc(100vw-1.5rem)] max-w-[380px] ${panelHeightClass} overflow-hidden rounded-2xl border border-[#FFD6BC]/15 bg-[#1C1217]/95 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl flex flex-col`}
          >
            <header className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-[#2B1A22]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl food-gradient flex items-center justify-center shadow-glow-orange-sm">
                  <Sparkles size={18} className="text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-white truncate">Gemini Food Assistant</h2>
                  <p className="text-[10px] text-[#A9C9B4]">{apiKey ? 'Gemini connected' : 'Smart menu guide'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close assistant"
                className="w-9 h-9 flex items-center justify-center rounded-full text-[#C4B7B0] hover:bg-white/[0.08]"
              >
                <X size={18} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-3" aria-live="polite">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[86%] px-3 py-2.5 text-xs leading-relaxed ${
                    message.role === 'user'
                      ? 'food-gradient text-white rounded-2xl rounded-br-md'
                      : 'bg-[#302229] text-[#F6EEE9] border border-white/[0.06] rounded-2xl rounded-bl-md'
                  }`}>
                    {message.text}
                  </div>
                </div>
              ))}
              {isThinking && (
                <div className="flex items-center gap-2 text-[11px] text-[#C4B7B0]">
                  <LoaderCircle size={14} className="animate-spin text-[#FF7043]" />
                  Finding a tasty match...
                </div>
              )}
            </div>

            <div className="px-3 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void sendMessage(prompt)}
                  disabled={isThinking}
                  className="whitespace-nowrap px-3 py-1.5 rounded-full border border-[#FF7043]/30 bg-[#FF7043]/10 text-[10px] font-medium text-[#FFC1A8] disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="p-3 border-t border-white/[0.08] flex gap-2 bg-[#21161B]">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about food..."
                aria-label="Message Gemini food assistant"
                className="min-w-0 flex-1 h-11 rounded-xl border border-white/[0.08] bg-[#140D10] px-3 text-sm text-white placeholder:text-[#887A74] outline-none focus:border-[#FF7043]/60"
              />
              <button
                type="submit"
                disabled={!input.trim() || isThinking}
                aria-label="Send message"
                className="w-11 h-11 rounded-xl food-gradient flex items-center justify-center text-white disabled:opacity-40"
              >
                <Send size={17} />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        whileTap={{ scale: 0.92 }}
        aria-label={isOpen ? 'Close Gemini food assistant' : 'Open Gemini food assistant'}
        className="pointer-events-auto ml-auto w-14 h-14 rounded-full food-gradient text-white shadow-[0_10px_30px_rgba(232,63,77,0.35)] flex items-center justify-center border border-white/20"
      >
        {isOpen ? <X size={22} /> : <Bot size={23} />}
      </motion.button>
    </div>
  );
}
