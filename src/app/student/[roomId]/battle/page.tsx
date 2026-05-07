
"use client";

import { useState, useEffect, use } from 'react';
import { useFirestore, useUser, useMemoFirebase, useDoc } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Zap, Swords, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function StudentBattlePage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const db = useFirestore();
  const { user } = useUser();
  const [opinion, setOpinion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nickname, setNickname] = useState('');
  const [side, setSide] = useState<'pro' | 'con' | null>(null);
  const { toast } = useToast();

  const roomRef = useMemoFirebase(() => (db ? doc(db, 'rooms', roomId) : null), [db, roomId]);
  const { data: room } = useDoc(roomRef);

  useEffect(() => {
    const localNick = localStorage.getItem(`debate_${roomId}_nickname`);
    const localSide = localStorage.getItem(`debate_${roomId}_side`) as 'pro' | 'con';
    if (localNick) setNickname(localNick);
    if (localSide) setSide(localSide);
  }, [roomId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opinion.trim() || !side || isSubmitting || !db || !user) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'rooms', roomId, 'opinions'), {
        nickname,
        userId: user.uid,
        side,
        text: opinion.trim(),
        used: false,
        submittedAt: serverTimestamp(),
        round: room?.currentRound || 1
      });
      setOpinion('');
      toast({
        title: "의견 제출 완료!",
        description: "AI 배틀이 곧 시작됩니다. 당신의 논리가 데미지를 줄 거예요!",
      });
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        variant: "destructive",
        title: "제출 실패",
        description: "의견을 제출하는 중 오류가 발생했습니다.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!room) return null;

  return (
    <div className="min-h-screen p-4 flex flex-col items-center bg-[#16190E]">
      <div className={`w-full max-w-lg p-3 rounded-b-2xl mb-6 flex justify-between items-center ${side === 'pro' ? 'bg-primary text-black' : 'bg-accent text-white'}`}>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          <span className="font-headline font-bold text-sm uppercase">{side} SIDE</span>
        </div>
        <div className="font-headline font-bold truncate max-w-[150px]">{nickname}</div>
      </div>

      <div className="w-full max-w-lg space-y-6">
        <header className="text-center space-y-3">
          <h1 className="text-xl font-headline font-bold text-white/80 leading-tight">
            {room.topic}
          </h1>
          <div className="flex justify-center gap-2">
            <Badge variant="outline" className="border-white/20 text-white/60">
              {room.status === 'battling' ? "격렬한 배틀 중!" : "의견을 입력하세요"}
            </Badge>
          </div>
        </header>

        <Card className="game-card border-white/10 shadow-2xl">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-headline text-muted-foreground uppercase">나의 공격 논리</label>
                <Textarea
                  placeholder={side === 'pro' ? "찬성하는 이유를 강력하게 적어주세요!" : "반대하는 이유를 설득력 있게 적어주세요!"}
                  value={opinion}
                  onChange={(e) => setOpinion(e.target.value)}
                  className="min-h-[150px] text-lg bg-background/50 border-2 border-white/10 rounded-xl focus:border-primary"
                  required
                />
              </div>
              <Button 
                disabled={isSubmitting || !opinion.trim() || room.status === 'battling'} 
                className={`w-full h-16 text-xl font-headline game-button rounded-xl ${side === 'pro' ? 'bg-primary text-black' : 'bg-accent text-white'}`}
              >
                {isSubmitting ? "전송 중..." : <><Send className="mr-2" /> 공격 의견 제출!</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-primary font-headline text-sm">
            <Info className="w-4 h-4" />
            <span>배틀 규칙</span>
          </div>
          <p className="text-xs text-muted-foreground font-body">
            제출된 의견은 AI가 분석하여 상대 진영에 데미지를 줍니다. 논리가 타당하고 설득력이 높을수록 더 큰 데미지를 줄 수 있습니다!
          </p>
        </div>

        {room.status === 'battling' && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center space-y-8 animate-in fade-in duration-500">
            <Swords className="w-20 h-20 text-primary animate-bounce" />
            <h2 className="text-4xl font-headline font-bold text-white">격렬한 배틀이 진행 중입니다!</h2>
            <p className="text-xl text-primary font-headline">칠판(호스트 화면)을 확인하세요!</p>
          </div>
        )}
      </div>
    </div>
  );
}
