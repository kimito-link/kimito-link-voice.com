# 画面遷移図
```
[TOPページ]
   │
   ├─→ [声優カードクリック] → [/kimitolink/]
   │                              ├─ プロフィール
   │                              ├─ 音声サンプル
   │                              └─ 見積もりフォーム
   │
   └─→ [ログイン] → [Twitter OAuth] → [フォロー確認] → [ダッシュボード選択]
                                                           ├─ 依頼者
                                                           └─ 声優
```
```

---

## 🎯 Windsurfに渡すべき完璧なセット
```
プロジェクトルート/
├─ README.md              ← プロジェクト概要
├─ REQUIREMENTS.md        ← 技術仕様（あなたが保存済み）
├─ DESIGN.md             ← デザイン仕様（NEW）
├─ CHANGELOG.md          ← 変更履歴（NEW）
├─ DECISIONS.md          ← 意思決定（NEW）
├─ UI-FLOW.md            ← 画面遷移（NEW）
└─ TODO.md               ← やることリスト
```

**Windsurfへの指示例:**
```
以下のドキュメントを読んで、プロジェクトを引き継いでください：
- README.md: プロジェクト概要
- REQUIREMENTS.md: 技術仕様とDB設計
- DESIGN.md: デザイン仕様
- CHANGELOG.md: これまでの変更履歴
- UI-FLOW.md: 画面遷移図

現在のタスク: Phase 1（11tyセットアップ）から開始