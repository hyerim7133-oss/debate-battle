# **App Name**: 스틱토론 배틀

## Core Features:

- 토론방 생성 및 관리: 호스트가 토론 주제를 입력하여 새로운 방을 생성하고, QR 코드를 통해 학생들의 참여를 유도하며, 찬성/반대 인원수를 실시간으로 확인하고, 토론의 시작 및 진행을 제어합니다.
- 학생 참여 및 측면 선택: 학생들은 생성된 QR 코드를 스캔하여 토론방에 접속하고, 자신만의 닉네임을 입력한 후 찬성 또는 반대 입장을 선택합니다.
- 의견 입력 및 제출: 학생들은 선택한 입장에 따라 자신의 의견을 텍스트로 작성하여 토론 시스템에 제출할 수 있습니다.
- AI 기반 의견 평가 및 데미지 산출: 제출된 찬성/반대 의견들을 AI 툴이 비교 분석하여 논리의 타당성, 설득력 등을 기반으로 '데미지'를 산출하고 배틀 결과에 반영합니다.
- 실시간 스틱맨 배틀 애니메이션: 찬성 및 반대 진영을 대표하는 졸라맨 캐릭터가 등장하여, AI 평가에 따른 데미지를 주고받는 배틀 애니메이션을 시각적으로 연출하고, 공격 대사를 표시하며 최종 승자를 알립니다.
- 실시간 데이터 동기화: Firebase Firestore를 사용하여 토론방의 현재 상태, 참여자 수, 제출된 의견, 배틀 진행 상황 등을 호스트와 모든 학생 기기에 실시간으로 동기화합니다.

## Style Guidelines:

- Dark color scheme. Primary color (accenting interactive elements and key information) is a vibrant green-yellow, signaling energy and clear decisions: '#CEFF5E' (RGB: 206, 255, 94). Background color (main canvas of the app) is a very dark, slightly desaturated green-yellow, promoting focus and a cool, high-tech vibe: '#16190E' (RGB: 22, 25, 14). Accent color (for important calls-to-action or critical feedback) is a bold, energetic orange-red, creating strong contrast and excitement: '#FF7F00' (RGB: 255, 127, 0).
- Headlines and short text will use 'Space Grotesk' (sans-serif) for a modern, techy, and slightly playful feel, reflecting the game-like battle. Longer body text for arguments or instructions will use 'Inter' (sans-serif) for clear readability.
- Use clean, geometric icons that are easily recognizable, like simple arrow designs for 'pro/con' and clear 'play/pause' style icons for 'start/go'. All icons should be large enough to be easily tapped on mobile devices.
- Focus on a mobile-first, responsive design with clear content separation. Utilize a 'card' based layout for distinct UI elements (e.g., topic card, student list card). Large, finger-friendly buttons are crucial for usability in a classroom setting, especially on mobile.
- Implement fun, subtle, and responsive animations for user interactions (button presses, side selections). The stickman battle sequence will feature dynamic attack animations, health bars, and impactful 'win/lose' effects to enhance the game-like atmosphere.