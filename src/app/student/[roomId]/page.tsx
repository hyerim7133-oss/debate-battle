
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useUser, useMemoFirebase, useDoc, useFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, Firestore } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Zap, Swords, Info, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function StudentBattlePage() {
  const params = useParams();
  const roomId = params?.roomId as string;
  
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();

  const [opinion, setOpinion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nickname, setNickname] = useState('');
  const [side, setSide] = useState<'pro' | 'con' | null>(null);
  const [mounted, setMounted] = useState(false);

  // Firebase 서비스 안전하게 가져오기
  let db: Firestore | null = null;
  let firebaseError: string | null = null;
  
  try {
    const firebase = useFirebase();
    db = firebase.firestore;
  } catch (e: any) {
    firebaseError = e.message;
  }

  const roomRef = useMemoFirebase(() => (db && roomId ? doc(db, 'rooms', roomId) : null), [db, roomId]);
  const { data: room, isLoading: isRoomLoading, error: roomError } = useDoc(roomRef);

  useEffect(() => {
    setMounted(true);
    if (!roomId) return;
    if (typeof window === 'undefined') return;

    const localNick = localStorage.getItem(`debate_${roomId}_nickname`);
    const localSide = localStorage.getItem(`debate_${roomId}_side`) as 'pro' | 'con';
    
    if (!localNick || !localSide) {
      router.push(`/join/${roomId}`);
      return;
    }
    
    setNickname(localNick);
    setSide(localSide);
  }, [roomId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opinion.trim() || !side || isSubmitting || !db || !user || !roomId) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'rooms', roomId, 'opinions'), {
        nickname,
        userId: user.uid,
        side,
        text: opinion.trim(),
        used: false,
        submittedAt: serverTimestamp(),
        round: room?.currentRound || 1,
        roomId: roomId,
        hostId: room?.hostId || ''
      });
      setOpinion('');
      toast({
        title: "ATTACK SENT!",
        description: "당신의 논리가 상대방에게 데미지를 줄 것입니다!",
      });
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({
        variant: "destructive",
        title: "ATTACK FAILED",
        description: error.message || "의견을 제출하는 중 오류가 발생했습니다.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  if (isRoomLoading || !db) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="p-12 text-center text-primary font-headline animate-pulse text-3xl italic">LOADING ARENA...</div>
      </div>
    );
  }

  if (firebaseError || roomError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Alert variant="destructive" className="max-w-md bg-destructive/10 border-destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>BATTLE CONNECTION FAILED</AlertTitle>
          <AlertDescription>
            {roomError?.message || firebaseError || "아레나에 연결할 수 없습니다."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="text-center space-y-6">
          <AlertCircle className="w-20 h-20 text-destructive mx-auto animate-bounce" />
          <h2 className="text-4xl font-headline font-black text-white uppercase italic tracking-tighter">Room Expired</h2>
          <Button variant="outline" onClick={() => router.push('/')} className="mt-4 border-primary text-primary hover:bg-primary/10 h-14 px-8 font-headline">
            메인으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const sideColorClass = side === 'pro' ? 'bg-primary shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-accent shadow-[0_0_20px_rgba(239,68,68,0.5)]';

  return (
    <div className="min-h-screen p-4 flex flex-col items-center bg-background">
      {/* Player Identity Bar */}
      <div className={`w-full max-w-lg p-4 rounded-b-xl mb-6 flex justify-between items-center ${sideColorClass} border-b-4 border-white/20`}>
        <div className="flex items-center gap-3">
          <div className="bg-black/30 p-2 rounded-lg"><Zap className="w-6 h-6 text-white fill-current" /></div>
          <span className="font-headline font-black text-xl uppercase italic tracking-tighter text-white">{side} SIDE</span>
        </div>
        <div className="font-headline font-black text-xl truncate max-w-[150px] uppercase italic text-white">{nickname || 'CHALLENGER'}</div>
      </div>

      <div className="w-full max-w-lg space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-2xl font-headline font-black text-white leading-tight uppercase italic drop-shadow-md">
            {room.topic}
          </h1>
          <div className="flex justify-center gap-2">
            <Badge variant="outline" className="border-white/20 text-white/60 font-headline uppercase italic">
              {room.status === 'battling' ? "BATTLE IN PROGRESS!" : "WAITING FOR YOUR LOGIC"}
            </Badge>
          </div>
        </header>

        <Card className="game-card border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-headline text-gray-400 uppercase italic tracking-widest">My Attack Logic</label>
                <Textarea
                  placeholder={side === 'pro' ? "찬성하는 이유를 강력하게 적어주세요!" : "반대하는 이유를 설득력 있게 적어주세요!"}
                  value={opinion}
                  onChange={(e) => setOpinion(e.target.value)}
                  className="min-h-[180px] text-xl bg-black/40 border-2 border-white/10 rounded-lg focus:border-white font-body p-4"
                  required
                />
              </div>
              <Button 
                disabled={isSubmitting || !opinion.trim() || room.status === 'battling'} 
                className={`w-full h-20 text-3xl font-headline font-black game-button rounded-lg ${side === 'pro' ? 'bg-primary text-white' : 'bg-accent text-white'} uppercase italic`}
              >
                {isSubmitting ? "CHARGING..." : <><Send className="mr-3 w-8 h-8" /> FIRE ATTACK!</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="bg-black/40 p-5 rounded-lg border border-white/5 space-y-3">
          <div className="flex items-center gap-2 text-white font-headline text-sm uppercase italic tracking-tighter">
            <Info className="w-5 h-5 text-gray-400" />
            <span>Battle Protocol</span>
          </div>
          <p className="text-xs text-gray-400 font-body leading-relaxed">
            제출된 의견은 AI가 분석하여 상대 진영에 데미지를 줍니다. <br/>
            <span className="text-primary font-bold">논리가 타당하고 설득력이 높을수록</span> 더 큰 치명타를 줄 수 있습니다!
          </p>
        </div>

        {room.status === 'battling' && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-8 text-center space-y-8 animate-in fade-in duration-500">
            <div className="relative">
              <Swords className="w-32 h-32 text-white animate-bounce" />
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
            </div>
            <h2 className="text-5xl font-headline font-black text-white uppercase italic tracking-tighter">Battle Phase!</h2>
            <p className="text-2xl text-primary font-headline uppercase italic">Watch the Arena Screen!</p>
          </div>
        )}
      </div>
    </div>
  );
}
