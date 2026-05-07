
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronLeft, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function JoinPage() {
  const [roomId, setRoomId] = useState('');
  const router = useRouter();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      // 요구사항: 수동 입장 시에도 /join/[roomId] 로 이동
      router.push(`/join/${roomId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center bg-[#16190E]">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-accent mb-8 font-headline hover:underline">
          <ChevronLeft className="w-5 h-5" /> 돌아가기
        </Link>

        <Card className="game-card border-accent/30">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-accent text-center">참여 코드 입력</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="space-y-6">
              <Input
                placeholder="방 코드를 입력하세요"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="h-14 text-xl text-center bg-background border-2 border-accent/30 focus:border-accent rounded-xl"
                required
              />
              <Button type="submit" className="w-full h-14 text-xl font-headline game-button bg-accent hover:bg-accent/90 rounded-xl">
                <LogIn className="mr-2" /> 참여하기
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
