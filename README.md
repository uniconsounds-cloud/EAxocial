# 🚀 EAxocial (EA Social) - Next-Gen Algorithmic Trading Platform

> **"The Unified Social Network & Modular Visual Builder for MetaTrader 5 EAs"**

EAxocial เป็นแพลตฟอร์มที่รวม **นักเทรด (Users), ผู้สร้าง (Creators) และผู้สนใจ EA** ไว้ในที่เดียว แก้ปัญหาความยุ่งยากของการเขียนโค้ด MQL5 ด้วยระบบ **Universal EA ตัวเดียว** ที่ควบคุมและอัปเดตกลยุทธ์ผ่านหน้าเว็บแบบเรียลไทม์ พร้อมระบบถอดกลยุทธ์จากคลิป YouTube / TikTok ด้วย AI

---

## 🌟 จุดเด่นหลักของระบบ (Core Architecture)

1. **🧩 4-Step Modular Core Builder (ระบบประกอบ 4 บล็อกโมดูล)**
   - **Step 1: Radar Core (Entry):** สัญญาณเข้าไม้แรก (EMA, RSI, Bollinger Bands, MACD) พร้อมจังหวะลั่นไก (Instant vs Next Bar Open)
   - **Step 2: Recovery Armor:** การจัดการไม้ (Single Order ไม้เดียวจบ, Fixed Grid วางโซน, Martingale ตัวคูณ)
   - **Step 3: Vault Exit:** การปิดกำไร (Risk-Reward 1:2, ปิดรวบกำไรเป็นก้อน $15 Basket TP, Trailing Stop)
   - **Step 4: Guardian Shield:** เกราะป้องกัน (Max Spread Filter, Daily Loss Cut %, ข่าวแดง High-Impact)

2. **🤖 AI Video-to-Strategy Engine**
   - วางลิงก์คลิปจาก **YouTube** หรือ **TikTok** ระบบจะสกัดตรรกะการเทรดและประกอบชิ้นส่วน 4 โมดูลให้อัตโนมัติ

3. **🚦 Minimalist Traffic-Light Dashboard**
   - หน้าจอควบคุมคลีน สบายตา ไม่รกด้วยตัวเลข:
     - 🟢 **Sync:** การเชื่อมต่อและพารามิเตอร์ตรงกับหน้าเว็บ 100%
     - 🟢 **Version:** ตรวจสอบความเข้ากันได้ของ EA Client v1.0.0
     - 🔵 **Trading Action:** แสดงสถานะชัดเจน (รอสัญญาณ / ถือออเดอร์ / กำลังแก้ไม้ / ปิดทำกำไร)
     - 🛑 **Emergency Panic Button:** สั่งปิดรวบทุกไม้หรือพักการเปิดไม้ใหม่จากหน้าเว็บได้ทันที

4. **🌐 Social Deck & 1-Click Clone**
   - ชุมชนแชร์กลยุทธ์ในรูปแบบ **Cyber-Deck Cards** พร้อมเกจวัดความดุดัน (Aggression) และการป้องกัน (Defense)
   - มีตราประทับ **Verified Real** รับรองผลจากพอร์ต MT5 จริง
   - คนอื่นสามารถกด **"โคลนสูตร (Clone & Deploy)"** ไปรันบน MT5 ของตัวเองได้ใน 1 วินาที

---

## 🛠️ โครงสร้างโปรเจกต์ (Project Structure)

```
EAxocial/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # หน้า Overview / Landing page
│   │   ├── builder/page.tsx            # หน้าสร้างกลยุทธ์ 4 โมดูล + AI Video Importer
│   │   ├── dashboard/page.tsx          # หน้าแดชบอร์ดไฟสถานะ 3 สี + คำสั่งฉุกเฉิน
│   │   ├── feed/page.tsx               # หน้าโซเชียลแชร์และโคลนกลยุทธ์
│   │   └── api/v1/
│   │       ├── ea/sync/route.ts        # MT5 ดึง Recipe กลยุทธ์และเช็กเวอร์ชัน
│   │       ├── ea/heartbeat/route.ts   # MT5 ส่งไฟสถานะและออเดอร์เรียลไทม์
│   │       └── ai/extract-strategy/    # ถอดกลยุทธ์จากคลิปด้วย Gemini API
│   ├── types/
│   │   └── strategy.ts                 # โครงสร้าง JSON Schema กลยุทธ์หลัก
│   └── lib/
│       ├── presets.ts                  # กลยุทธ์เริ่มต้น (Golden Trend, Hybrid Grid ฯลฯ)
│       └── supabase.ts                 # ตัวเชื่อมต่อ Supabase Client
├── mql5/
│   └── EAxocial_Client.mq5             # Universal EA Client สำหรับรันบน MetaTrader 5
└── supabase/
    └── schema.sql                      # SQL Migration สร้างฐานข้อมูลและ Realtime
```

---

## 🚀 วิธีติดตั้งและเริ่มต้นใช้งาน

### 1. ตั้งค่า Environment Variables
คัดลอกไฟล์ `.env.example` ไปเป็น `.env.local`:
```bash
cp .env.example .env.local
```
กรอกค่าของ **Supabase** และ **Google Gemini API Key** (ถ้าต้องการเปิดระบบ AI ถอดคลิปสด):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

### 2. ติดตั้งตารางฐานข้อมูลใน Supabase
นำโค้ดในไฟล์ [supabase/schema.sql](file:///Users/suphakorn/EAxocial/supabase/schema.sql) ไปรันใน **Supabase SQL Editor** เพื่อสร้างตาราง `profiles`, `strategies`, `mt5_terminals`, `telemetry_logs` และเปิด Realtime

### 3. รันโปรเจกต์ในโหมดพัฒนา
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่: `http://localhost:3000`

---

## 📈 วิธีติดตั้ง Universal EA บน MetaTrader 5

1. คัดลอกไฟล์ [mql5/EAxocial_Client.mq5](file:///Users/suphakorn/EAxocial/mql5/EAxocial_Client.mq5) ไปไว้ในโฟลเดอร์:
   `MQL5/Experts/` ในเครื่องของคุณ
2. เปิดโปรแกรม **MetaEditor** แล้วกด **Compile (F7)**
3. เปิดโปรแกรม **MetaTrader 5** เข้าเมนู:
   - `Tools` ➔ `Options` ➔ แท็บ `Expert Advisors`
   - ติ๊กถูกที่ **"Allow WebRequest for listed URL:"**
   - เพิ่ม URL ของระบบ เช่น: `http://localhost:3000` (หรือ URL ที่ deploy บน Vercel)
4. ลาก `EAxocial_Client` ใส่กราฟ (เช่น XAUUSD M15) 
5. ตรวจสอบว่าไฟบนหน้าต่างกราฟและหน้าเว็บ Dashboard เปลี่ยนเป็น **🟢 ONLINE & SYNCED**!
