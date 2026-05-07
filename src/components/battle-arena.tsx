"use client";

import { useState, useEffect } from 'react';
import { Crown, Swords, Zap } from 'lucide-react';

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
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(false);

  // 전투 애니메이션 시퀀스
  useEffect(() => {
    if (status === 'battling') {
      const runSequence = async () => {
        // 초기화
        setProHp(100);
        setConHp(100);
        setIsAttacking(null);
        setShowDamage(null);

        await new Promise(r => setTimeout(r, 1000));
        
        // 1. 찬성(Pro) 진영의 공격: 돌진 -> 타격 -> 복귀
        setIsAttacking('pro');
        await new Promise(r => setTimeout(r, 400)); // 돌진 시간
        
        // 타격 순간 효과
        setShake(true);
        setFlash(true);
        setConHp(prev => Math.max(0, prev - proDamage));
        setShowDamage({ side: 'con', value: proDamage });
        
        setTimeout(() => { setShake(false); setFlash(false); }, 400);
        
        await new Promise(r => setTimeout(r, 800)); // 타격 후 대기
        setIsAttacking(null);
        setShowDamage(null);

        await new Promise(r => setTimeout(r, 800));

        // 2. 반대(Con) 진영의 공격: 돌진 -> 타격 -> 복귀
        setIsAttacking('con');
        await new Promise(r => setTimeout(r, 400));
        
        setShake(true);
        setFlash(true);
        setProHp(prev => Math.max(0, prev - conDamage));
        setShowDamage({ side: 'pro', value: conDamage });
        
        setTimeout(() => { setShake(false); setFlash(false); }, 400);

        await new Promise(r => setTimeout(r, 800));
        setIsAttacking(null);
        setShowDamage(null);
      };
      runSequence();
    }
  }, [status, proDamage, conDamage]);

  return (
    <div className={`battle-arena w-full aspect-video md:aspect-[21/9] rounded-2xl border-4 border-white/10 flex flex-col items-center justify-between p-8 relative overflow-hidden ${shake ? 'animate-screen-shake' : ''}`}>
      {/* 임팩트 플래시 오버레이 */}
      {flash && <div className="absolute inset-0 z-50 animate-impact-flash pointer-events-none" />}

      {/* 배경 그리드 */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      </div>

      {/* 상단: HP 바 시스템 */}
      <div className="w-full flex justify-between items-center gap-12 z-10">
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-end">
            <span className="font-headline font-black text-primary text-2xl italic tracking-tighter uppercase">PRO / 찬성</span>
            <span className="font-mono text-primary font-bold text-xl">{Math.round(proHp)}%</span>
          </div>
          <div className="h-4 bg-black/50 rounded-full overflow-hidden border border-primary/30">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out shadow-[0_0_15px_rgba(59,130,246,0.6)]" 
              style={{ width: `${proHp}%` }}
            />
          </div>
        </div>

        <div className="flex-none bg-black/80 p-3 rounded-full border-2 border-white/20">
          <Zap className="w-8 h-8 text-yellow-400 animate-pulse" />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-end">
            <span className="font-headline font-black text-accent text-2xl italic tracking-tighter text-right w-full uppercase">CON / 반대</span>
            <span className="font-mono text-accent font-bold text-xl ml-4">{Math.round(conHp)}%</span>
          </div>
          <div className="h-4 bg-black/50 rounded-full overflow-hidden border border-accent/30">
            <div 
              className="h-full bg-accent transition-all duration-300 ease-out shadow-[0_0_15px_rgba(239,68,68,0.6)]" 
              style={{ width: `${conHp}%` }}
            />
          </div>
        </div>
      </div>

      {/* 중앙: 스틱맨 배틀 존 */}
      <div className="relative w-full h-80 flex items-center justify-center">
        {/* 찬성 스틱맨 */}
        <div 
          className={`absolute transition-all duration-300 ease-in-out flex flex-col items-center ${
            isAttacking === 'pro' ? 'translate-x-32 scale-150 z-20' : 'translate-x-[-250px] z-10'
          }`}
          style={{ left: '50%' }}
        >
          <div className="relative">
             <Stickman color="#3b82f6" direction="right" isAttacking={isAttacking === 'pro'} isHit={isAttacking === 'con' && flash} />
             {showDamage?.side === 'pro' && (
                <div className="damage-pop absolute -top-32 left-1/2 -translate-x-1/2 text-white font-headline font-black text-8xl italic">
                  -{showDamage.value}
                </div>
             )}
             {status === 'finished' && winner === 'pro' && (
                <div className="absolute -top-28 left-1/2 -translate-x-1/2">
                   <Crown className="w-20 h-20 text-yellow-400 animate-bounce" />
                </div>
             )}
          </div>
        </div>

        {/* 반대 스틱맨 */}
        <div 
          className={`absolute transition-all duration-300 ease-in-out flex flex-col items-center ${
            isAttacking === 'con' ? '-translate-x-32 scale-150 z-20' : 'translate-x-[250px] z-10'
          }`}
          style={{ left: '50%' }}
        >
          <div className="relative">
             <Stickman color="#ef4444" direction="left" isAttacking={isAttacking === 'con'} isHit={isAttacking === 'pro' && flash} />
             {showDamage?.side === 'con' && (
                <div className="damage-pop absolute -top-32 left-1/2 -translate-x-1/2 text-white font-headline font-black text-8xl italic">
                  -{showDamage.value}
                </div>
             )}
             {status === 'finished' && winner === 'con' && (
                <div className="absolute -top-28 left-1/2 -translate-x-1/2">
                   <Crown className="w-20 h-20 text-yellow-400 animate-bounce" />
                </div>
             )}
          </div>
        </div>

        {/* 중앙 대사 */}
        {attackDialogue && status === 'battling' && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black px-8 py-4 rounded-lg font-headline font-black text-2xl shadow-[8px_8px_0_0_rgba(0,0,0,0.8)] border-4 border-black animate-in zoom-in duration-200 z-30 uppercase italic text-center max-w-sm">
            "{attackDialogue}"
          </div>
        )}
      </div>

      {/* 하단 설명 */}
      <div className="w-full text-center z-10 h-24">
        {status === 'battling' && (
          <div className="bg-black/80 px-8 py-3 rounded-full inline-block border-2 border-primary animate-pulse text-white font-headline text-xl uppercase italic">
            Logical Strike! Fighting...
          </div>
        )}
        {status === 'finished' && explanation && (
          <div className="bg-black/90 p-6 rounded-xl border-2 border-white/10 max-w-4xl mx-auto backdrop-blur-md animate-in slide-in-from-bottom-4">
            <h4 className="text-primary font-headline font-black text-sm uppercase mb-1 italic tracking-widest text-left">JUDGE VERDICT</h4>
            <p className="text-lg font-body italic text-gray-100 leading-snug text-left">"{explanation}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Stickman({ color, direction, isAttacking, isHit }: { color: string, direction: 'left' | 'right', isAttacking: boolean, isHit: boolean }) {
  const flip = direction === 'left' ? 'scale-x-[-1]' : '';
  return (
    <div className={`relative w-32 h-64 ${flip} ${isHit ? 'animate-vibrate' : ''} transition-transform duration-100`} style={{ filter: isHit ? 'brightness(3)' : 'none' }}>
      <svg viewBox="0 0 100 200" className="w-full h-full">
        <circle cx="50" cy="35" r="20" stroke={color} strokeWidth="8" fill="#0a0a0f" />
        <line x1="50" y1="55" x2="50" y2="130" stroke={color} strokeWidth="10" />
        
        {/* Arm 1 - 공격 시 쭉 뻗는 팔 */}
        <line 
          x1="50" y1="80" 
          x2={isAttacking ? "120" : "15"} 
          y2={isAttacking ? "70" : "120"} 
          stroke={color} strokeWidth="10" 
          strokeLinecap="round"
          className="transition-all duration-100"
        />
        
        {/* Arm 2 - 방어 또는 고정 */}
        <line 
          x1="50" y1="80" 
          x2={isAttacking ? "40" : "15"} 
          y2={isAttacking ? "120" : "120"} 
          stroke={color} strokeWidth="10" 
          strokeLinecap="round"
        />
        
        {/* Leg 1 */}
        <line x1="50" y1="130" x2={isAttacking ? "10" : "25"} y2="195" stroke={color} strokeWidth="10" strokeLinecap="round" />
        
        {/* Leg 2 */}
        <line 
          x1="50" y1="130" 
          x2={isAttacking ? "80" : "75"} 
          y2={isAttacking ? "190" : "195"} 
          stroke={color} strokeWidth="10" 
          strokeLinecap="round" 
        />

        {/* 이펙트 */}
        {isAttacking && (
          <g className="animate-in fade-in zoom-in duration-100">
             <path d="M100 50 L140 70 L100 90" fill={color} opacity="0.6" />
             <circle cx="120" cy="70" r="15" fill="white" opacity="0.4" className="animate-ping" />
          </g>
        )}
      </svg>
    </div>
  );
}