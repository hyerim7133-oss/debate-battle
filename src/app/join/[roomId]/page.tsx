
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Swords, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function StudentJoinPage() {
  const params = useParams();
  const roomId = params?.roomId as string;
  
  const [nickname, setNickname] = useState('');
  const [side, setSide] = useState<'pro' | 'con' | null>(null);
  const [loading, setLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const db = useFirestore();

  // 방 정보 조회를 위한 레퍼런스 메모이제이션
  const roomRef = useMemoFirebase(() => (db && roomId ? doc(db, 'rooms', roomId) : null), [db, roomId]);
  const { data: room, isLoading: isRoomLoading, error: roomError } = useDoc(roomRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleJoin = async () => {
    if (!nickname.trim() || !side || !db || !roomId || !room) return;
    setLoading(true);
    setJoinError(null);

    try {
      // 1. 방 참여 인원 카운트 증가
      await updateDoc(doc(db, 'rooms', roomId), {
        [side === 'pro' ? 'proCount' : 'conCount']: increment(1)
      });
      
      // 2. 참가자(participant) 정보 저장
      await addDoc(collection(db, 'rooms', roomId, 'participants'), {
        nickname: nickname.trim(),
        side: side,
        userId: (await import('firebase/auth')).getAuth().currentUser?.uid || 'anonymous',
        joinedAt: serverTimestamp(),
        roomId: roomId,
        hostId: room.hostId
      });

      // 3. 로컬 스토리지에 설정 정보 저장 (배틀 페이지에서 사용)
      if (typeof window !== 'undefined') {
        localStorage.setItem(`debate_${roomId}_nickname`, nickname.trim());
        localStorage.setItem(`debate_${roomId}_side`, side);
      }
      
      // 4. 배틀 페이지(의견 제출)로 이동
      router.push(`/student/${roomId}`);
    } catch (err: any) {
      console.error("Join error:", err);
      setJoinError(`입장 실패: ${err.message || "알 수 없는 오류가 발생했습니다."}`);
      setLoading(false);
    }
  };

  // 하이드레이션 오류 방지
  if (!mounted) return null;

  // 로딩 상태
  if (isRoomLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary font-headline text-2xl animate-pulse italic tracking-widest uppercase">
          CHECKING ARENA...
        </div>
      </div>
    );
  }

  // 시스템 에러 (Firebase 초기화 실패 등)
  if (roomError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Alert variant="destructive" className="max-w-md bg-destructive/10 border-destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>SYSTEM ERROR</AlertTitle>
          <AlertDescription>
            {roomError?.message || "데이터를 불러오는 중 문제가 발생했습니다."}
          </AlertDescription>
          <Button variant="outline" onClick={() => window.location.reload()} className="mt-4 border-destructive text-destructive hover:bg-destructive/10 w-full">
            RETRY
          </Button>
        </Alert>
      </div>
    );
  }

  // 방을 찾을 수 없는 경우
  if (!roomId || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="text-center space-y-6">
          <AlertCircle className="w-20 h-20 text-destructive mx-auto animate-bounce" />
          <h2 className="text-4xl font-headline font-black text-white uppercase italic tracking-tighter">Arena Not Found</h2>
          <p className="text-gray-400 max-w-sm mx-auto">방이 존재하지 않거나 이미 종료되었습니다. 주소를 다시 확인해 주세요.</p>
          <Button variant="outline" onClick={() => router.push('/')} className="mt-4 border-primary text-primary hover:bg-primary/10 h-14 px-8 font-headline">
            HOME
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 flex flex-col items-center bg-background">
      <div className="w-full max-w-lg mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-3">
          <h1 className="text-xl font-headline font-bold text-gray-500 uppercase tracking-[0.3em] italic">Join the Arena</h1>
          <p className="text-4xl md:text-5xl font-headline font-black text-white leading-tight uppercase italic drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            "{room.topic}"
          </p>
        </div>

        <Card className="game-card border-white/5 shadow-2xl">
          <CardContent className="pt-8 space-y-8">
            {joinError && (
              <Alert variant="destructive" className="bg-destructive/10 border-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>JOIN FAILED</AlertTitle>
                <AlertDescription>{joinError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <Label className="text-xl font-headline italic uppercase text-gray-400">Battle Nickname</Label>
              <Input
                placeholder="너의 배틀 이름을 알려줘!"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="h-16 text-2xl bg-black/40 border-2 border-white/10 rounded-lg focus:border-primary font-headline"
              />
            </div>

            <div className="space-y-4">
              <Label className="text-xl font-headline italic uppercase text-gray-400">Select Your Side</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => setSide('pro')}
                  className={`h-32 flex-col gap-2 rounded-lg border-4 transition-all game-button ${
                    side === 'pro' ? 'bg-primary text-white border-white' : 'bg-primary/10 text-primary border-primary/20'
                  }`}
                >
                  <ThumbsUp className="w-10 h-10" />
                  <span className="font-headline font-black text-xl italic">PRO (찬성)</span>
                </Button>
                <Button
                  onClick={() => setSide('con')}
                  className={`h-32 flex-col gap-2 rounded-lg border-4 transition-all game-button ${
                    side === 'con' ? 'bg-accent text-white border-white' : 'bg-accent/10 text-accent border-accent/20'
                  }`}
                >
                  <ThumbsDown className="w-10 h-10" />
                  <span className="font-headline font-black text-xl italic">CON (반대)</span>
                </Button>
              </div>
            </div>

            <Button
              disabled={!nickname.trim() || !side || loading}
              onClick={handleJoin}
              className="w-full h-20 text-3xl font-headline font-black game-button bg-white text-black rounded-lg hover:bg-gray-200 uppercase italic"
            >
              {loading ? "PREPARING..." : <><Swords className="mr-3 w-10 h-10" /> ENTER BATTLE</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
