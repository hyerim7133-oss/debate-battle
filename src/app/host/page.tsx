"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useAuth, useUser } from '@/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChevronLeft, Rocket, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function HostSetupPage() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const db = useFirestore();
  const auth = useAuth();
  const { user } = useUser();

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Ensure user is signed in (Anonymous) to allow Firestore writes
      let currentUser = user;
      if (!currentUser) {
        const userCredential = await signInAnonymously(auth);
        currentUser = userCredential.user;
      }

      if (!currentUser) {
        throw new Error("사용자 인증에 실패했습니다.");
      }

      // Create a unique document ID
      const roomRef = doc(collection(db, 'rooms'));
      
      const roomData = {
        topic: topic.trim(),
        status: 'waiting',
        hostId: currentUser.uid,
        proCount: 0,
        conCount: 0,
        currentRound: 1,
        createdAt: serverTimestamp(),
      };

      // Set the document in Firestore
      await setDoc(roomRef, roomData);
      
      // Navigate to the created room
      router.push(`/host/${roomRef.id}`);
    } catch (err: any) {
      console.error("Error creating room:", err);
      setError(`방 생성 실패: ${err.message || "알 수 없는 에러가 발생했습니다."}`);
      setLoading(false); // Reset loading on error
    } finally {
      // We don't set loading to false here if successful to prevent flickering before navigation
      // But if there's an error, it's already handled in the catch block
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-12 flex flex-col items-center bg-[#16190E]">
      <div className="w-full max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-2 text-primary mb-8 font-headline hover:underline">
          <ChevronLeft className="w-5 h-5" /> 돌아가기
        </Link>

        <Card className="game-card">
          <CardHeader>
            <CardTitle className="text-4xl font-headline text-primary text-center">토론 주제 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateRoom} className="space-y-8">
              {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>오류 발생</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <Label htmlFor="topic" className="text-xl font-headline">오늘의 배틀 주제는 무엇인가요?</Label>
                <Input
                  id="topic"
                  placeholder="예: 민트초코는 맛있는 음식인가?"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="h-16 text-xl bg-background border-2 border-primary/30 focus:border-primary rounded-xl"
                  required
                />
                <p className="text-muted-foreground text-sm">
                  학생들이 이해하기 쉬운 명확한 주제를 입력해주세요.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || !topic.trim()}
                className="w-full h-16 text-2xl font-headline game-button bg-primary text-black rounded-xl"
              >
                {loading ? "생성 중..." : (
                  <span className="flex items-center gap-2">
                    <Rocket className="w-6 h-6" /> 배틀룸 생성하기
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
