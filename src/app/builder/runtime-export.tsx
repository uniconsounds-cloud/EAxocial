"use client";
import { useState } from "react";
import type { Strategy } from "@/lib/strategy/model";
import { fingerprint, runtimeConfig, runtimeErrors } from "@/lib/strategy/runtime";

export default function RuntimeExport({
  strategy,
  strategyId,
  isPublic,
  savedFingerprint,
  savedPublic,
  onSyncMt5,
  syncBusy,
}: {
  strategy: Strategy;
  strategyId: string | null;
  isPublic: boolean;
  savedFingerprint: string | null;
  savedPublic: boolean;
  onSyncMt5?: () => void;
  syncBusy?: boolean;
}) {
  const [copyStatus, setCopyStatus] = useState("");
  const errors = runtimeErrors(strategy);
  const revision = fingerprint(strategy);
  const savedMatches = !!strategyId && savedFingerprint === revision && savedPublic === isPublic;
  const syncUrl = typeof window !== "undefined" && savedMatches && savedPublic ? `${window.location.origin}/api/v1/ea/sync?id=${strategyId}` : "";

  function download(runtime: boolean) {
    const content = runtime ? runtimeConfig(strategy) : JSON.stringify({ ...strategy, contractVersion: "1.0.0" }, null, 2);
    const url = URL.createObjectURL(new Blob([content], { type: runtime ? "text/plain;charset=utf-8" : "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = runtime ? "eaxocial.cfg" : "strategy.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(syncUrl);
      setCopyStatus("คัดลอก URL แล้ว");
    } catch {
      setCopyStatus("กดค้างหรือเลือกข้อความในช่อง URL เพื่อคัดลอก");
    }
  }

  return (
    <section className="runtime-export" aria-label="เตรียม Strategy สำหรับ MT5">
      <h3>นำ Strategy ไปใช้กับ MT5</h3>
      <p>EAxocial Engine · Simple ไม้เดียว · ทดลองบน Demo หรือ Strategy Tester</p>
      <ol>
        <li>
          <strong>ตรวจค่า Strategy</strong>
          <br />
          {errors.length ? "ยังมีค่าที่ต้องแก้ก่อนส่งให้ EA" : "กติกาเข้ากันได้กับ EA รุ่นนี้"}
        </li>
        <li>
          <strong>Sync เข้า MT5 อัตโนมัติ</strong>
          <br />
          กดปุ่ม Sync to MT5 หรือดาวน์โหลดไฟล์ Config
        </li>
        <li>
          <strong>เปิด EA บนกราฟ Demo</strong>
          <br />
          เลือก Symbol และ Timeframe ให้ตรง แล้วตรวจว่า EA แสดง [ONLINE] Connected
        </li>
      </ol>
      {errors.map((error, i) => (
        <p className="runtime-error" key={i}>
          {error}
        </p>
      ))}
      {onSyncMt5 && (
        <button type="button" className="mt5-sync-btn" disabled={syncBusy} onClick={onSyncMt5}>
          {syncBusy ? "กำลัง Sync เข้า MT5..." : "⚡ Push / Sync เข้า MT5 ทันที"}
        </button>
      )}
      <button type="button" disabled={errors.length > 0} onClick={() => download(true)}>
        ดาวน์โหลด Config สำหรับ MT5 (.cfg)
      </button>
      <details>
        <summary>ตัวเลือกเพิ่มเติมและ JSON</summary>
        <p>1. เปิด EAxocial_Client บนกราฟ MT5 ของบัญชี Demo</p>
        <p>
          2. วาง <strong>eaxocial.cfg</strong> ในโฟลเดอร์ Terminal/Common/Files หรือใช้โหมด Cloud Sync อัตโนมัติ
        </p>
        <button type="button" onClick={() => download(false)}>
          ดาวน์โหลด Strategy JSON
        </button>
        <p>
          หมายเลข Config Revision: <strong>{revision}</strong>
        </p>
        {syncUrl ? (
          <>
            <label>
              URL สำหรับ Sync Strategy สาธารณะ
              <input readOnly value={syncUrl} onFocus={e => e.currentTarget.select()} />
            </label>
            <button type="button" onClick={copy}>
              คัดลอก URL
            </button>
            <p role="status">{copyStatus}</p>
          </>
        ) : (
          <p>{isPublic ? "บันทึก Strategy สาธารณะก่อน จึงจะแสดง URL ที่ตรงกับค่าล่าสุด" : "ใช้ปุ่ม Push / Sync เข้า MT5 หรือดาวน์โหลดไฟล์ Config"}</p>
        )}
      </details>
    </section>
  );
}
