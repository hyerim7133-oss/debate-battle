
"use client";

import Link from 'next/link';
import { Swords, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-12 bg-[#16190E] relative overflow-hidden">
      {/* 배경 오라 */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />

      {/* 대결 구도 레이아웃 */}
      <div className="relative z-10 w-full max-w-7xl flex flex-col lg:flex-row items-center justify-around gap-12">
        
        {/* 찬성파 거대 아바타 */}
        <div className="hidden lg:flex flex-col items-center space-y-8">
          <div className="relative group animate-flame">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-3xl aura-effect"></div>
            <StickmanAvatar color="hsl(var(--primary))" direction="right" />
          </div>
          <div className="bg-primary/20 px-10 py-4 rounded-full border-2 border-primary/50 shadow-[0_0_30px_rgba(59,130,246,0.4)] animate-vibrate">
            <span className="text-primary font-headline font-black text-4xl italic uppercase tracking-[0.2em]">찬성파</span>
          </div>
        </div>

        {/* 중앙 타이틀 구역 */}
        <div className="flex flex-col items-center text-center space-y-10 px-4">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-yellow-400 font-headline text-sm uppercase tracking-widest italic mb-4 animate-bounce">
            <Zap className="w-5 h-5 fill-current" /> Ultimate Logic Battle
          </div>
          
          <h1 className="text-8xl md:text-[11rem] font-headline font-black text-white tracking-tighter italic uppercase flex flex-col md:flex-row gap-6 items-center drop-shadow-[0_10px_40px_rgba(0,0,0,0.9)]">
            <span className="text-white">찬반</span>
            <div className="flex">
              <span className="text-primary text-glow-blue">대</span>
              <span className="text-accent text-glow-red">전</span>
            </div>
          </h1>
          
          <p className="text-2xl md:text-4xl text-gray-400 font-body max-w-2xl mx-auto italic leading-tight">
            논리로 상대를 박살내세요! <br/>
            <span className="text-white font-black underline decoration-primary decoration-[6px] underline-offset-[12px]">AI 실시간 스틱맨 배틀 토론</span>
          </p>

          <div className="w-full max-w-md mt-12">
            <Link href="/host" className="group">
              <div className="game-card p-12 rounded-[2.5rem] flex flex-col items-center space-y-10 transition-all hover:scale-[1.05] hover:border-primary/60 hover:shadow-[0_0_80px_rgba(59,130,246,0.3)] bg-black/60 backdrop-blur-xl">
                <div className="w-32 h-32 bg-primary/10 rounded-3xl flex items-center justify-center border-2 border-primary/40 group-hover:rotate-12 transition-transform duration-300">
                  <ShieldCheck className="w-20 h-20 text-primary" />
                </div>
                <div className="text-center">
                  <h2 className="text-5xl font-headline font-black mb-4 italic uppercase tracking-tighter text-white">Create Arena</h2>
                  <p className="text-gray-400 text-xl font-medium">배틀을 개설하고 <br/> 아레나 호스트가 되세요.</p>
                </div>
                <Button className="w-full h-24 text-5xl font-headline font-black game-button rounded-2xl bg-primary text-white uppercase italic tracking-tighter shadow-[0_10px_0_0_#1e40af]">
                  BATTLE START
                </Button>
              </div>
            </Link>
          </div>
        </div>

        {/* 반대파 거대 아바타 */}
        <div className="hidden lg:flex flex-col items-center space-y-8">
          <div className="relative group animate-flame" style={{ animationDelay: '0.5s' }}>
            <div className="absolute inset-0 bg-accent/30 rounded-full blur-3xl aura-effect" style={{ animationDelay: '0.5s' }}></div>
            <StickmanAvatar color="hsl(var(--accent))" direction="left" />
          </div>
          <div className="bg-accent/20 px-10 py-4 rounded-full border-2 border-accent/50 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-vibrate" style={{ animationDelay: '0.1s' }}>
            <span className="text-accent font-headline font-black text-4xl italic uppercase tracking-[0.2em]">반대파</span>
          </div>
        </div>

      </div>

      {/* 하단 장식 */}
      <div className="mt-20 flex flex-col items-center gap-6 z-10">
        <div className="flex items-center gap-8 text-gray-500 font-headline uppercase italic tracking-[0.5em] text-xl">
          <div className="h-px w-32 bg-gradient-to-r from-transparent to-gray-800"></div>
          <div className="flex items-center gap-6">
            <Swords className="w-10 h-10 animate-pulse text-white" />
            <span className="text-white/40">Are You Ready?</span>
          </div>
          <div className="h-px w-32 bg-gradient-to-l from-transparent to-gray-800"></div>
        </div>
      </div>

      <style jsx>{`
        .text-glow-blue { text-shadow: 0 0 30px rgba(59,130,246,0.9); }
        .text-glow-red { text-shadow: 0 0 30px rgba(239,68,68,0.9); }
      `}</style>
    </div>
  );
}

function StickmanAvatar({ color, direction }: { color: string, direction: 'left' | 'right' }) {
  const flip = direction === 'left' ? 'scale-x-[-1]' : '';
  return (
    <div className={`relative w-80 h-80 md:w-[32rem] md:h-[32rem] ${flip} animate-vibrate`} style={{ filter: `drop-shadow(0 0 40px ${color})` }}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* 머리 - 약간 앞쪽으로 숙인 느낌 */}
        <circle cx="50" cy="30" r="18" stroke={color} strokeWidth="5" fill="#0a0a0f" />
        
        {/* 강렬한 노려보는 눈매 */}
        <g stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round">
          <path d="M40 28 L48 34" /> {/* 왼쪽 눈썹 */}
          <path d="M60 28 L52 34" /> {/* 오른쪽 눈썹 */}
          <circle cx="43" cy="36" r="1.5" fill="white" stroke="none" className="animate-pulse" />
          <circle cx="57" cy="36" r="1.5" fill="white" stroke="none" className="animate-pulse" />
        </g>

        {/* 상체 - 전투 자세로 굽어짐 */}
        <path d="M50 48 Q45 60 55 75" stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" />
        
        {/* 앞쪽으로 내민 팔 (주먹) */}
        <path d="M50 55 L75 52 Q85 52 85 62" stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" />
        <circle cx="85" cy="62" r="4.5" fill={color} className="animate-pulse" />
        
        {/* 뒤쪽으로 당긴 팔 */}
        <path d="M50 55 L35 65 Q25 75 35 85" stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.8" />
        <circle cx="35" cy="85" r="4" fill={color} opacity="0.8" />

        {/* 다리 - 굽힌 자세 */}
        <path d="M55 75 L40 95" stroke={color} strokeWidth="5" strokeLinecap="round" />
        <path d="M55 75 L75 92" stroke={color} strokeWidth="5" strokeLinecap="round" />

        {/* 임팩트 오라 효과 (SVG 내부) */}
        <g opacity="0.4">
          <circle cx="50" cy="50" r="45" stroke={color} strokeWidth="0.5" fill="none" className="animate-ping" />
        </g>
      </svg>
    </div>
  );
}
