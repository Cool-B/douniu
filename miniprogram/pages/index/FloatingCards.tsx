import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface CardData {
  id: number;
  suit: '♠' | '♥' | '♦' | '♣';
  rank: string;
  x: number;
  delay: number;
  duration: number;
  rotation: number;
}

export function FloatingCards() {
  const [cards, setCards] = useState<CardData[]>([]);

  useEffect(() => {
    const suits: Array<'♠' | '♥' | '♦' | '♣'> = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

    const generatedCards: CardData[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      suit: suits[Math.floor(Math.random() * suits.length)],
      rank: ranks[Math.floor(Math.random() * ranks.length)],
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 10,
      rotation: Math.random() * 360 - 180,
    }));

    setCards(generatedCards);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {cards.map((card) => (
        <motion.div
          key={card.id}
          className="absolute"
          style={{
            left: `${card.x}%`,
            top: '-10%',
          }}
          initial={{
            y: 0,
            opacity: 0,
            rotateY: 0,
            rotateZ: card.rotation,
          }}
          animate={{
            y: '120vh',
            opacity: [0, 0.6, 0.6, 0],
            rotateY: [0, 180, 360],
            rotateZ: card.rotation + 360,
          }}
          transition={{
            duration: card.duration,
            delay: card.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div className="relative w-16 h-24 perspective-1000">
            <div
              className={`w-full h-full rounded-lg shadow-2xl flex flex-col items-center justify-center ${card.suit === '♥' || card.suit === '♦'
                  ? 'bg-white text-red-600'
                  : 'bg-white text-black'
                } border-2 border-gray-300`}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="text-xs absolute top-1 left-1">{card.rank}</div>
              <div className="text-3xl">{card.suit}</div>
              <div className="text-xs absolute bottom-1 right-1 rotate-180">{card.rank}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
