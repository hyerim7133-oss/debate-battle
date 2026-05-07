
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Swords, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function StudentJoinPage() {
  const params = useParams();
  const roomId = params?.roomId as string;
  const db = useFirestore();
  const router = useRouter();
  
  const [nickname, setNickname] = useState('');
  const [side, setSide] = useState<'pro' | 'con' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roomRef = useMemoFirebase(() => (db && roomId ? doc(db, 'rooms', roomId) : null), [db, roomId]);
  const { data: room, isLoading: isRoomLoading, error: roomError } = useDoc(roomRef);

  const handleJoin = async () => {
    if (!nickname.trim() || !side || !db || !roomId) return;
    setLoading(true);
    setError(null);

    try {
      // 진영 인원수 증가
      await updateDoc(doc(db, 'rooms', roomId), {
        [side === 'pro' ? 'proCount' : 'conCount']: increment(1)
      });
      
      // 로컬 스토리지에 설정 저장
      localStorage.setItem(`debate_${roomId}_nickname`, nickname.trim());
      localStorage.setItem(`debate_${roomId}_side`, side);
      
      // 배틀 페이지로 이동
      router.push(`/student/${roomId}`);
    } catch (err: any) {
      console.error("Join error:", err);
      setError(`참여 실패: ${err.message || "알 수 없는 오류가 발생했습니다."}`);
      setLoading(false);
    }
  };

  if (isRoomLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#16190E]">
        <div className="text-primary font-headline text-2xl animate-pulse">방 정보 불러오는 중...</div>
      </div>
    );
  }

  if (roomError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#16190E]">
        <Alert variant="destructive" className="max-w-md bg-destructive/10 border-destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>오류 발생</AlertTitle>
          <AlertDescription>방 정보를 가져오지 못했습니다. {roomError.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#16190E]">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
          <h2 className="text-3xl font-headline font-bold text-white">방을 찾을 수 없습니다</h2>
          <p className="text-muted-foreground">URL이 올바른지 확인하거나 호스트에게 문의하세요.</p>
          <Button variant="outline" onClick={() => router.push('/')} className="mt-4 border-primary text-primary hover:bg-primary/10">
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 flex flex-col items-center bg-[#16190E]">
      <div className="w-full max-w-lg mt-12 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-headline font-bold text-muted-foreground uppercase tracking-widest">배틀 참전 준비</h1>
          <p className="text-3xl font-headline font-bold text-white leading-tight">"{room.topic}"</p>
        </div>

        <Card className="game-card border-white/10">
          <CardContent className="pt-8 space-y-8">
            {error && (
              <Alert variant="destructive" className="bg-destructive/10 border-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>오류</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <Label className="text-xl font-headline">닉네임</Label>
              <Input
                placeholder="너의 배틀 이름을 알려줘!"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="h-14 text-xl bg-background border-2 border-white/20 rounded-xl focus:border-primary"
              />
            </div>

            <div className="space-y-4">
              <Label className="text-xl font-headline">진영 선택</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => setSide('pro')}
                  className={`h-24 flex-col gap-2 rounded-2xl border-4 transition-all ${
                    side === 'pro' ? 'bg-primary text-black border-white shadow-[0_0_20px_rgba(206,255,94,0.4)]' : 'bg-primary/10 text-primary border-primary/20'
                  }`}
                >
                  <ThumbsUp className="w-8 h-8" />
                  <span className="font-headline font-bold">찬성 (PRO)</span>
                </Button>
                <Button
                  onClick={() => setSide('con')}
                  className={`h-24 flex-col gap-2 rounded-2xl border-4 transition-all ${
                    side === 'con' ? 'bg-accent text-white border-white shadow-[0_0_20px_rgba(255,127,0,0.4)]' : 'bg-accent/10 text-accent border-accent/20'
                  }`}
                >
                  <ThumbsDown className="w-8 h-8" />
                  <span className="font-headline font-bold">반대 (CON)</span>
                </Button>
              </div>
            </div>

            <Button
              disabled={!nickname.trim() || !side || loading}
              onClick={handleJoin}
              className="w-full h-16 text-2xl font-headline game-button bg-white text-black rounded-xl hover:bg-primary transition-colors"
            >
              {loading ? "전투 준비 중..." : <><Swords className="mr-2" /> 전장에 입장하기</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
