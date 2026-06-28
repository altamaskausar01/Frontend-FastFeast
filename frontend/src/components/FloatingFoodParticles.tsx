const FOOD_ITEMS = [
  { emoji: '☕', size: 22 },
  { emoji: '🥐', size: 18 },
  { emoji: '🍔', size: 20 },
  { emoji: '🍕', size: 22 },
  { emoji: '🍜', size: 24 },
  { emoji: '🍟', size: 16 },
  { emoji: '🌮', size: 20 },
  { emoji: '🍩', size: 18 },
  { emoji: '🍦', size: 17 },
  { emoji: '🥤', size: 16 },
  { emoji: '🍝', size: 22 },
];

export default function FloatingFoodParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {FOOD_ITEMS.map((item, i) => {
        const animationType = i % 3 === 0 ? 'float-sway' : 'float-slow';
        const duration = animationType === 'float-sway'
          ? 30 + (i % 4) * 5
          : 22 + (i % 5) * 3;
        const delay = i * 2.5;
        const left = `${(i * 9.09) + ((i * 3) % 5)}%`;
        // Higher opacity for items that drift through lighter areas
        const isUpperArea = i < 4;
        const opacity = isUpperArea ? 0.035 + (i % 3) * 0.015 : 0.02 + (i % 3) * 0.012;

        return (
          <span
            key={i}
            className="absolute select-none"
            style={{
              left,
              fontSize: `${item.size}px`,
              opacity,
              animation: `${animationType} ${duration}s infinite ${animationType === 'float-sway' ? 'ease-in-out' : 'linear'}`,
              animationDelay: `${delay}s`,
              '--drift-x': `${((i % 5) - 2) * 15}px`,
              filter: 'blur(0.5px)',
            } as React.CSSProperties}
          >
            {item.emoji}
          </span>
        );
      })}
    </div>
  );
}
