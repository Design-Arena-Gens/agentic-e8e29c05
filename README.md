# Lumos Companion

Lumos Companion is a web-based mental health chatbot designed to feel like a gentle conversational partner. It combines a supportive text experience, expressive voice responses, and a reactive 3D companion who appears when you begin sharing.

## ✨ Features

- Empathetic conversational guidance delivered through a supportive chat interface.
- Voice playback powered by the Web Speech API so the companion speaks responses aloud.
- Optional speech input when supported by the browser (Chrome / Edge).
- Animated 3D companion rendered with Three.js and react-three-fiber, triggered when the chat begins.
- Responsive layout optimized for desktop and tablet viewports.

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` to access the experience. Voice features require a browser with Web Speech API support.

## 🧱 Tech Stack

- [Next.js 14 (App Router)](https://nextjs.org/)
- [React 18](https://react.dev)
- [three.js](https://threejs.org/) with [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction) and [@react-three/drei](https://github.com/pmndrs/drei)
- Web Speech API for text-to-speech and voice capture
- Framer Motion for smooth UI transitions

## 📦 Scripts

- `npm run dev` – Launch the development server.
- `npm run build` – Create a production build.
- `npm start` – Start the production server.

## 📁 Structure

```
app/
  api/
    chat/route.ts         # Supportive reply generator
  layout.tsx
  page.tsx                # Main experience
components/
  AvatarCanvas.tsx        # 3D scene and avatar
hooks/
  useCompanionVoice.ts    # Text-to-speech helper
  useSpeechCapture.ts     # Speech recognition helper
lib/
  responses.ts            # Rule-based response crafting
public/
  models/companion.glb    # Expressive 3D avatar
```

## 🧠 Safety

Lumos Companion offers grounding prompts and empathetic reflections, but it is **not** a substitute for professional mental health care. Encourage users to reach out to qualified professionals for urgent support.

## 📜 Assets & Licensing

The avatar model (`public/models/companion.glb`) originates from the [glTF Sample Models](https://github.com/KhronosGroup/glTF-Sample-Models) project — “RobotExpressive” (CC BY 4.0). Attribution: © 2017 Khronos Group Inc.

---

Created with care to provide a calm, encouraging space for users to express how they feel.
