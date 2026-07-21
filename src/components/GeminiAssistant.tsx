import { useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, LoaderCircle, Send, Sparkles, X, Plus } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';
import { post } from '@/services/api';

type ChatItem = {
  _id: string;
  name: string;
  price: number;
  canteenName: string;
  prepTime: string;
  inStock: boolean;
};

type ChatMessage = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  items?: ChatItem[];
};

const quickPrompts = ['Best under ₹100', 'Fast vegetarian', 'What is trending?'];

export default function GeminiAssistant() {
  const { state, addToCart } = useApp();
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
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      const response = await post<{ text: string, items?: ChatItem[] }>('/chat', { message: trimmed });
      setMessages((current) => [
        ...current, 
        { 
          id: nextId.current++, 
          role: 'assistant', 
          text: response.data.text,
          items: response.data.items 
        }
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current, 
        {
          id: nextId.current++,
          role: 'assistant',
          text: `Oops! I couldn't reach the backend right now. Please try again later.`,
        }
      ]);
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
            aria-label="Smart food assistant"
            className={`pointer-events-auto absolute bottom-16 right-0 w-[calc(100vw-1.5rem)] max-w-[380px] ${panelHeightClass} overflow-hidden rounded-2xl border border-[#FFD6BC]/15 bg-[#1C1217]/95 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl flex flex-col`}
          >
            <header className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-[#2B1A22]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl food-gradient flex items-center justify-center shadow-glow-orange-sm">
                  <Sparkles size={18} className="text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-white truncate">Smart Food Assistant</h2>
                  <p className="text-[10px] text-[#A9C9B4]">Live Menu Guide</p>
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
                  <div className={`max-w-[86%] px-3 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                    message.role === 'user'
                      ? 'food-gradient text-white rounded-2xl rounded-br-md'
                      : 'bg-[#302229] text-[#F6EEE9] border border-white/[0.06] rounded-2xl rounded-bl-md'
                  }`}>
                    {message.text}
                    {message.items && message.items.length > 0 && (
                      <div className="mt-2.5 space-y-2">
                        {message.items.map((item) => (
                          <div key={item._id} className="bg-black/20 p-2 rounded-lg flex items-center justify-between border border-white/5">
                            <div>
                              <div className="text-[11px] font-semibold text-white">{item.name}</div>
                              <div className="text-[10px] text-[#A9C9B4] mt-0.5">
                                {item.canteenName} • ₹{item.price} • {item.prepTime}
                              </div>
                              {!item.inStock && <div className="text-[9px] text-red-400 mt-0.5">Currently out of stock</div>}
                            </div>
                            {item.inStock && (
                              <button 
                                onClick={() => addToCart(item._id)}
                                className="w-7 h-7 flex-shrink-0 bg-[#FF7043]/90 hover:bg-[#FF7043] rounded-full flex items-center justify-center text-white transition-colors ml-2"
                                aria-label="Add to cart"
                              >
                                <Plus size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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
                aria-label="Message smart food assistant"
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
        aria-label={isOpen ? 'Close food assistant' : 'Open food assistant'}
        className="pointer-events-auto ml-auto w-14 h-14 rounded-full food-gradient text-white shadow-[0_10px_30px_rgba(232,63,77,0.35)] flex items-center justify-center border border-white/20"
      >
        {isOpen ? <X size={22} /> : <Bot size={23} />}
      </motion.button>
    </div>
  );
}
