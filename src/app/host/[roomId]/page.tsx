
"use client";

import { useEffect, useState, use } from 'react';
import { useParams } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { doc, onSnapshot, updateDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Play, QrCode as QrIcon } from 'lucide-react';
import { QRCodeComponent } from '@/components/qr-code';
import { BattleArena } from '@/components/battle-arena';
import { evaluateDebateOpinions } from '@/ai/flows/evaluate-debate-opinions';
import { generateAttackDialogue } from '@/ai/flows/generate-attack-dialogue';
import { firebaseConfig } from '@/firebase/config';

export default function HostRoomPage() {
  const params = useParams();
  const roomId = params?.roomId as string;
  const [room, setRoom] = useState<any>(null);
  const [showQR, setShowQR] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const db = useFirestore();

  useEffect(() => {
    if (!db || !roomId) return;
    const unsub = onSnapshot(doc(db, 'rooms', roomId), (doc) => {
      if (doc.exists()) setRoom({ id: doc.id, ...doc.data() });
    });
    return () => unsub();
  }, [db, roomId]);

  const handleStartBattle = async () => {
    if (isProcessing || !db || !roomId) return;
    setIsProcessing(true);

    try {
      const opinionsRef = collection(db, 'rooms', roomId, 'opinions');
      const qPro = query(opinionsRef, where('side', '==', 'pro'), where('used', '==', false), limit(1));
      const qCon = query(opinionsRef, where('side', '==', 'con'), where('used', '==', false), limit(1));

      const [proSnap, conSnap] = await Promise.all([getDocs(qPro), getDocs(qCon)]);

      if (proSnap.empty || conSnap.empty) {
        alert("양쪽 진영의 의견이 최소 하나씩은 필요합니다!");
        setIsProcessing(false);
        return;
      }

      const proDoc = proSnap.docs[0];
      const conDoc = conSnap.docs[0];
      const proOpinion = proDoc.data().text;
      const conOpinion = conDoc.data().text;

      const evaluation = await evaluateDebateOpinions({ proOpinion, conOpinion });
      
      const winningOpinion = evaluation.proDamage >= evaluation.conDamage ? proOpinion : conOpinion;
      const losingOpinion = evaluation.proDamage < evaluation.conDamage ? proOpinion : conOpinion;
      const attackDialogue = await generateAttackDialogue({
        winningOpinion,
        losingOpinion,
        comparisonResultSummary: evaluation.explanation
      });

      updateDoc(doc(db, 'rooms', roomId), {
        status: 'battling',
        currentBattle: {
          proOpinion,
          conOpinion,
          proDamage: evaluation.proDamage,
          conDamage: evaluation.conDamage,
          explanation: evaluation.explanation,
          attackDialogue,
          winner: evaluation.proDamage > evaluation.conDamage ? 'pro' : (evaluation.conDamage > evaluation.proDamage ? 'con' : 'draw')
        }
      });

      updateDoc(doc(db, 'rooms', roomId, 'opinions', proDoc.id), { used: true });
      updateDoc(doc(db, 'rooms', roomId, 'opinions', conDoc.id), { used: true });

      setTimeout(() => {
        updateDoc(doc(db, 'rooms', roomId), { status: 'finished' });
        setIsProcessing(false);
      }, 7000);

    } catch (error) {
      console.error("Battle error:", error);
      setIsProcessing(false);
    }
  };

  if (!room) return <div className="p-12 text-center text-primary font-headline animate-pulse">로딩 중...</div>;

  // 요구사항: QR 링크를 /join/[roomId] 로 변경
  const joinUrl = `https://${firebaseConfig.projectId}.web.app/join/${roomId}`;

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 bg-[#16190E]">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 text-center md:text-left">
          <Badge variant="outline" className="text-primary border-primary px-4 py-1 rounded-full uppercase tracking-widest font-headline">
            Live Debate Battle
          </Badge>
          <h1 className="text-3xl md:text-5xl font-headline font-bold text-white max-w-2xl">
            {room.topic}
          </h1>
        </div>

        <div className="flex gap-4">
          <Button 
            variant="outline" 
            className="game-button border-primary text-primary hover:bg-primary hover:text-black"
            onClick={() => setShowQR(!showQR)}
          >
            <QrIcon className="mr-2" /> QR {showQR ? "숨기기" : "보기"}
          </Button>
          <Button 
            disabled={room.status === 'battling' || isProcessing}
            onClick={handleStartBattle}
            className="game-button bg-primary text-black hover:bg-primary/90 font-headline text-lg"
          >
            {room.status === 'battling' ? "배틀 진행 중..." : (
              <><Play className="mr-2" /> NEXT ROUND</>
            )}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="game-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Users className="w-5 h-5 text-primary" /> 실시간 참여
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/10 p-4 rounded-xl text-center border border-primary/20">
                <span className="block text-primary font-headline text-3xl">{room.proCount}</span>
                <span className="text-xs text-muted-foreground uppercase font-headline">찬성(Pro)</span>
              </div>
              <div className="bg-accent/10 p-4 rounded-xl text-center border border-accent/20">
                <span className="block text-accent font-headline text-3xl">{room.conCount}</span>
                <span className="text-xs text-muted-foreground uppercase font-headline">반대(Con)</span>
              </div>
            </div>
            
            {showQR && (
              <div className="flex flex-col items-center gap-4 py-4 animate-in slide-in-from-top duration-300">
                <QRCodeComponent url={joinUrl} />
                <p className="text-xs text-muted-foreground break-all text-center">{joinUrl}</p>
                <p className="text-sm font-headline text-primary animate-pulse">지금 바로 참여하세요!</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <BattleArena 
            status={room.status}
            proOpinion={room.currentBattle?.proOpinion}
            conOpinion={room.currentBattle?.conOpinion}
            proDamage={room.currentBattle?.proDamage || 0}
            conDamage={room.currentBattle?.conDamage || 0}
            attackDialogue={room.currentBattle?.attackDialogue}
            explanation={room.currentBattle?.explanation}
            winner={room.currentBattle?.winner}
          />

          {room.currentBattle && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Card className="game-card border-primary/30">
                 <CardHeader className="pb-2"><Badge className="w-fit bg-primary text-black">찬성 측 논리</Badge></CardHeader>
                 <CardContent>
                   <p className="font-body text-lg leading-relaxed">"{room.currentBattle.proOpinion}"</p>
                 </CardContent>
               </Card>
               <Card className="game-card border-accent/30">
                 <CardHeader className="pb-2"><Badge className="w-fit bg-accent text-white">반대 측 논리</Badge></CardHeader>
                 <CardContent>
                   <p className="font-body text-lg leading-relaxed">"{room.currentBattle.conOpinion}"</p>
                 </CardContent>
               </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
