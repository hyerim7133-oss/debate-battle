import Link from 'next/link';
import { Swords, Users, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-12 bg-[#16190E] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[100px]" />

      <div className="text-center space-y-4 z-10">
        <h1 className="text-6xl md:text-8xl font-headline font-bold text-primary tracking-tighter">
          스틱토론 <span className="text-accent">배틀</span>
        </h1>
        <p className="text-xl text-muted-foreground font-body max-w-lg mx-auto">
          당신의 논리로 상대방을 쓰러뜨리세요! 실시간 교실 토론 게임
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl z-10">
        <Link href="/host" className="group">
          <div className="game-card h-full p-8 rounded-2xl flex flex-col items-center space-y-6 transition-all group-hover:border-primary group-hover:scale-[1.02]">
            <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-12 h-12 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-headline font-bold mb-2">선생님 / 호스트</h2>
              <p className="text-muted-foreground">새로운 토론 방을 만들고 수업을 진행합니다.</p>
            </div>
            <Button className="w-full h-14 text-xl font-headline game-button rounded-xl bg-primary text-black">
              방 만들기
            </Button>
          </div>
        </Link>

        <Link href="/join" className="group">
          <div className="game-card h-full p-8 rounded-2xl flex flex-col items-center space-y-6 transition-all group-hover:border-accent group-hover:scale-[1.02]">
            <div className="w-20 h-20 bg-accent/20 rounded-2xl flex items-center justify-center">
              <Users className="w-12 h-12 text-accent" />
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-headline font-bold mb-2">학생 / 참여자</h2>
              <p className="text-muted-foreground">코드를 입력하고 토론 배틀에 참여합니다.</p>
            </div>
            <Button className="w-full h-14 text-xl font-headline game-button rounded-xl bg-accent hover:bg-accent/90">
              배틀 참여하기
            </Button>
          </div>
        </Link>
      </div>

      <div className="mt-12 flex items-center gap-2 text-muted-foreground font-headline animate-bounce">
        <Swords className="w-5 h-5" />
        <span>Ready to Battle?</span>
      </div>
    </div>
  );
}
