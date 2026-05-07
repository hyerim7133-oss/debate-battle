"use client";

import { useEffect, useState } from 'react';
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
    }, (error) => {
      console.error("Room snapshot error:", error);
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

      await updateDoc(doc(db, 'rooms', roomId), {
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

      await updateDoc(doc(db, 'rooms', roomId, 'opinions', proDoc.id), { used: true });
      await updateDoc(doc(db, 'rooms', roomId, 'opinions', conDoc.id), { used: true });

      setTimeout(async () => {
        await updateDoc(doc(db, 'rooms', roomId), { status: 'finished' });
        setIsProcessing(false);
      }, 7000);

    } catch (error) {
      console.error("Battle error:", error);
      setIsProcessing(false);
    }
  };

  if (!roomId) return <div className="p-12 text-center text-primary font-headline text-2xl uppercase">Arena Not Found</div>;
  if (!room) return <div className="p-12 text-center text-primary font-headline animate-pulse uppercase text-3xl italic">Arena Loading...</div>;

  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/join/${roomId}` : '';

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 bg-background">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 text-center md:text-left">
          <Badge variant="outline" className="text-primary border-primary px-4 py-1 rounded-sm uppercase tracking-widest font-headline italic">
            Live Debate Arena
          </Badge>
          <h1 className="text-4xl md:text-6xl font-headline font-black text-white max-w-2xl italic uppercase tracking-tighter">
            {room.topic}
          </h1>
        </div>

        <div className="flex gap-4">
          <Button 
            variant="outline" 
            className="game-button border-white/20 text-white hover:bg-white/10 h-14"
            onClick={() => setShowQR(!showQR)}
          >
            <QrIcon className="mr-2" /> QR CODE
          </Button>
          <Button 
            disabled={room.status === 'battling' || isProcessing}
            onClick={handleStartBattle}
            className="game-button bg-primary text-white h-14 font-headline text-xl italic uppercase font-black px-8"
          >
            {room.status === 'battling' ? "BATTLE!" : (
              <><Play className="mr-2" /> NEXT ROUND</>
            )}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="game-card lg:col-span-1 border-white/5 h-fit overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/5 py-4">
            <CardTitle className="flex items-center justify-center gap-2 font-headline italic uppercase text-gray-400 text-sm tracking-widest">
               Entry Link
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center p-6 bg-white/5">
            {showQR && (
              <div className="flex flex-col items-center gap-0 p-4 bg-white rounded-xl animate-in zoom-in duration-300 shadow-2xl">
                <QRCodeComponent url={joinUrl} />
              </div>
            )}
            <div className="mt-6 text-center space-y-2">
              <p className="text-xs font-headline uppercase italic text-gray-500 tracking-tighter">Scan to Join</p>
              <p className="font-headline font-black text-2xl text-white italic tracking-tighter">{roomId.slice(0, 6).toUpperCase()}</p>
            </div>
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
                 <CardHeader className="pb-2"><Badge className="w-fit bg-primary text-white italic uppercase font-black">Pro Attack</Badge></CardHeader>
                 <CardContent>
                   <p className="font-body text-xl leading-relaxed text-blue-100 italic">"{room.currentBattle.proOpinion}"</p>
                 </CardContent>
               </Card>
               <Card className="game-card border-accent/30">
                 <CardHeader className="pb-2"><Badge className="w-fit bg-accent text-white italic uppercase font-black">Con Attack</Badge></CardHeader>
                 <CardContent>
                   <p className="font-body text-xl leading-relaxed text-red-100 italic">"{room.currentBattle.conOpinion}"</p>
                 </CardContent>
               </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
