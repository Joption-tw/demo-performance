# 示範帳戶 即時績效

示範帳戶選擇權即時績效追蹤網頁，資料來源為 Google Sheets 即時同步。

## 🌐 網址

| 平台 | 網址 |
|------|------|
| **主要網址** | https://www.joption.org/ |
| GitHub (demo-performance) | https://joption-tw.github.io/demo-performance/ |
| GitHub (sample) | https://joption-tw.github.io/sample/ |

## 📊 功能特色

- **即時績效圖表**：期貨指數、時間價值、獲利率、總點數多軸顯示
- **交易時段切換**：自動偵測交易時段（早盤 08:45~13:45 / 夜盤 15:00~05:00）
- **嚴格時段切割**：每盤只顯示當盤數據，不帶入上盤尾段
- **截圖分享**：一鍵輸出高清報表圖
- **Excel 匯出**：含原始資料、每分鐘內插、績效圖三個工作表

## 📁 資料來源

Google Sheets ID：`1AsY4_MJipaMp_cNLpyeXTpFGnG0FD4vWJu-SDRdvtME`

| 工作表 | GID | 說明 |
|--------|-----|------|
| 績效圖表 | `1823639969` | 即時期指、時間價值、獲利率等 |

## 🔄 更新方式

修改 `index.html` 後執行：

```powershell
cd "C:\Users\suntree\Desktop\homepage\示範帳戶報表"
git add index.html
git commit -m "更新說明"
git push origin main
git push sample main
```

push 完成後，`www.joption.org` 約 1 分鐘內自動更新；GitHub Pages 兩個網址同步更新。

## 🛠 技術架構

- **前端**：HTML + Tailwind CSS + ECharts 5
- **部署**：Vercel（連結 GitHub demo-performance，push 即自動部署）
- **API**：`/api/sheet.js` Vercel Proxy（繞過 CORS，代理抓取 Google Sheets CSV）
- **環境偵測**：GitHub Pages 直接呼叫 Google Sheets；Vercel 走 `/api/sheet`

## 📌 版本紀錄

| 版本 | 說明 |
|------|------|
| V1.9.6 | 嚴格依時間切割每盤數據，移除前盤尾段多餘資料點；新增 Vercel proxy `/api/sheet` |
| V1.9.5 | 明確標注盤別時間切點與 gap 處理邏輯 |
| V1.9.4 | 修正早盤/夜盤切割時間點（早盤 08:45-13:45，夜盤 15:00-05:00） |
| V1.9.3 | 新增 Excel 匯出（含圖表）、BA/BB 漲跌幅、期指 Y 軸自動縮放 |
