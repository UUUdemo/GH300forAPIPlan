# 開發工作日誌 (2026-03-08)

## ✅ 已完成項目 (Completed)

### 1. 專案建置與環境設定
- [x] 初始化 Angular 21 專案 (`ng new weather-app`)
- [x] 設定 **Zoneless** 模式 (`provideExperimentalZonelessChangeDetection`)
- [x] 移除 `zone.js` 依賴 (`angular.json` polyfills)
- [x] 整合 **Tailwind CSS** 並設定 `tailwind.config.js`
- [x] 設定 **HttpClient** 支援 Fetch API (`withFetch`)

### 2. 核心功能開發 (WeatherService)
- [x] 串接 CWA 開放資料 API (F-D0047-091)
- [x] 實作 `transformData` 邏輯，將 12 小時區間資料轉換為每日預報
- [x] **解決資料解析問題**：
    - [x] 處理 `locations` vs `Locations` 大小寫不一致
    - [x] 處理 `weatherElement` vs `WeatherElement` 大小寫不一致
    - [x] 處理 `startTime` vs `StartTime` 大小寫不一致
    - [x] 處理動態屬性名稱 (`ElementValue` 內含 `MaxTemperature` 等變動 Key)
    - [x] 加入安全檢查邏輯 (`getValue`, `getDate` helper functions)

### 3. 使用者介面與體驗 (UI/UX)
- [x] 實作 **Mobile-First** 響應式設計 (Grid Layout)
- [x] 製作天氣卡片 (日期、天氣圖示、最高/最低溫)
- [x] 實作城市選擇下拉選單 (內建 22 縣市標準名稱)
- [x] 加入 Loading 與 Error 狀態顯示
- [x] 修復 HTML 中文亂碼問題 (UTF-8 Encoding)

### 4. 狀態管理 (State Management)
- [x] 使用 **Signals** (`signal`) 管理城市狀態
- [x] 使用 `toSignal` + `switchMap` 模擬 **Resource API** 模式處理非同步資料流

### 5. 效能與測試 (Performance & Testing)
- [x] **快取機制**：實作簡單的資料快取 (`In-Memory Cache`)，避免頻繁呼叫 API。
- [x] **測試**：為 `WeatherService` 撰寫單元測試 (Unit Tests)，包含快取邏輯驗證。

## 📝 待辦事項 (Todo / Future Improvements)

- [ ] **更多天氣資訊**：顯示降雨機率 (PoP)、體感溫度等資訊。
- [ ] **部署**：將網站部署至 GitHub Pages 或 Vercel。
