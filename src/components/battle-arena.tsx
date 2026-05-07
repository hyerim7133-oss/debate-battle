
"use client";

import { useState, useEffect } from 'react';
import { Zap, Crown } from 'lucide-react';

interface BattleArenaProps {
  proOpinion?: string;
  conOpinion?: string;
  proDamage: number;
  conDamage: number;
  explanation?: string;
  attackDialogue?: string;
  winner?: 'pro' | 'con' | 'draw' | null;
  status: 'waiting' | 'ready' | 'battling' | 'finished';
}

export function BattleArena({ 
  proDamage, 
  conDamage, 
  explanation, 
  attackDialogue, 
  winner,
  status
}: BattleArenaProps) {
  const [isAttacking, setIsAttacking] = useState<'pro' | 'con' | null>(null);
  const [proHp, setProHp] = useState(100);
  const [conHp, setConHp] = useState(100);
  const [showDamage, setShowDamage] = useState<{ side: 'pro' | 'con', value: number } | null>(null);

  useEffect(() => {
    if (status === 'battling') {
      const runSequence = async () => {
        setProHp(100);
        setConHp(100);

        await new Promise(r => setTimeout(r, 1000));
        setIsAttacking('pro');
        await new Promise(r => setTimeout(r, 500));
        setConHp(prev => Math.max(0, prev - proDamage));
        setShowDamage({ side: 'con', value: proDamage });
        await new Promise(r => setTimeout(r, 1000));
        setIsAttacking(null);
        setShowDamage(null);

        await new Promise(r => setTimeout(r, 500));
        setIsAttacking('con');
        await new Promise(r => setTimeout(r, 500));
        setProHp(prev => Math.max(0, prev - conDamage));
        setShowDamage({ side: 'pro', value: conDamage });
        await new Promise(r => setTimeout(r, 1000));
        setIsAttacking(null);
        setShowDamage(null);
      };
      runSequence();
    }
  }, [status, proDamage, conDamage]);

  return (
    <div className="battle-arena w-full aspect-video md:aspect-[21/9] rounded-2xl border-4 border-primary/20 flex flex-col items-center justify-between p-8">
      <div className="w-full flex justify-between items-center gap-12">
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-end">
            <span className="font-headline font-bold text-primary text-xl">PRO SIDE</span>
            <span className="font-code text-primary">{Math.round(proHp)}%</span>
          </div>
          <div className="h-4 bg-muted rounded-full overflow-hidden border border-primary/30">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out" 
              style={{ width: `${proHp}%` }}
            />
          </div>
        </div>

        <div className="flex-none">
          <Zap className="w-10 h-10 text-accent animate-pulse" />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-end">
            <span className="font-headline font-bold text-accent text-xl">CON SIDE</span>
            <span className="font-code text-accent">{Math.round(conHp)}%</span>
          </div>
          <div className="h-4 bg-muted rounded-full overflow-hidden border border-accent/30">
            <div 
              className="h-full bg-accent transition-all duration-500 ease-out" 
              style={{ width: `${conHp}%` }}
            />
          </div>
        </div>
      </div>

      <div className="relative w-full h-full flex items-center justify-center">
        <div 
          className={`absolute transition-all duration-500 flex flex-col items-center ${
            isAttacking === 'pro' ? 'translate-x-1/2 scale-110 z-20' : 'translate-x-[-150%] z-10'
          }`}
          style={{ left: '50%' }}
        >
          <Stickman color="#CEFF5E" direction="right" isAttacking={isAttacking === 'pro'} />
          {showDamage?.side === 'pro' && (
            <div className="damage-pop absolute -top-10 text-red-500 font-headline font-bold text-4xl">
              -{showDamage.value}
            </div>
          )}
          {status === 'finished' && winner === 'pro' && (
            <Crown className="w-12 h-12 text-yellow-400 absolute -top-12 animate-bounce" />
          )}
        </div>

        <div 
          className={`absolute transition-all duration-500 flex flex-col items-center ${
            isAttacking === 'con' ? '-translate-x-1/2 scale-110 z-20' : 'translate-x-[150%] z-10'
          }`}
          style={{ left: '50%' }}
        >
          <Stickman color="#FF7F00" direction="left" isAttacking={isAttacking === 'con'} />
          {showDamage?.side === 'con' && (
            <div className="damage-pop absolute -top-10 text-red-500 font-headline font-bold text-4xl">
              -{showDamage.value}
            </div>
          )}
          {status === 'finished' && winner === 'con' && (
            <Crown className="w-12 h-12 text-yellow-400 absolute -top-12 animate-bounce" />
          )}
        </div>

        {attackDialogue && status === 'battling' && (
          <div className="absolute top-1/2 transform -translate-y-1/2 bg-white text-black px-6 py-3 rounded-2xl font-headline font-bold text-xl shadow-2xl animate-in zoom-in duration-300">
            {attackDialogue}
          </div>
        )}
      </div>

      <div className="w-full text-center">
        {status === 'battling' && (
          <div className="animate-pulse text-primary font-headline text-lg">
            AI 판정 중... 격렬한 배틀이 진행되고 있습니다!
          </div>
        )}
        {status === 'finished' && explanation && (
          <div className="bg-card/50 p-4 rounded-xl border border-white/10 max-w-2xl mx-auto">
            <p className="text-sm font-body italic text-muted-foreground">{explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Stickman({ color, direction, isAttacking }: { color: string, direction: 'left' | 'right', isAttacking: boolean }) {
  const flip = direction === 'left' ? 'scale-x-[-1]' : '';
  return (
    <div className={`relative w-24 h-48 ${flip}`}>
      <svg viewBox="0 0 100 200" className="w-full h-full">
        <circle cx="50" cy="30" r="20" stroke={color} strokeWidth="5" fill="none" />
        <line x1="50" y1="50" x2="50" y2="120" stroke={color} strokeWidth="5" />
        <line 
          x1="50" y1="70" 
          x2={isAttacking ? "90" : "20"} 
          y2={isAttacking ? "50" : "100"} 
          stroke={color} strokeWidth="5" 
          className="transition-all duration-300"
        />
        <line 
          x1="50" y1="70" 
          x2="20" y2="100" 
          stroke={color} strokeWidth="5" 
        />
        <line x1="50" y1="120" x2="30" y2="180" stroke={color} strokeWidth="5" />
        <line x1="50" y1="120" x2="70" y2="180" stroke={color} strokeWidth="5" />
        {isAttacking && (
          <g className="animate-in slide-in-from-left duration-200">
             <line x1="85" y1="45" x2="110" y2="20" stroke={color} strokeWidth="8" />
             <path d="M105 15 L115 25" stroke={color} strokeWidth="5" />
          </g>
        )}
      </svg>
    </div>
  );
}
