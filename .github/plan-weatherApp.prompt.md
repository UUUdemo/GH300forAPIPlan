# Angular 21 天氣應用程式開發計畫

## 專案目標
建立一個響應式、行動優先 (Mobile-First) 的天氣網站，採用 Angular 21 的最新功能。網站將詢問使用者城市，並呈現一週的天氣預報，包含最高溫度、最低溫度和天氣現象。

## 技術堆疊與需求
- **框架**：Angular 21 (Modern Angular)
- **架構**：獨立元件 (Standalone Components)
- **狀態管理**：Signals 與 Resource API (用於非同步資料處理)
- **變更檢測**：Zoneless (無 Zone.js，使用 `provideExperimentalZonelessChangeDetection`)
- **樣式**：Tailwind CSS (Utility-First)，行動優先設計
- **API**：中央氣象署 (CWA) 開放資料 API (F-D0047-091)

## 實作路線圖

### 第一階段：專案建置與設定
1.  **初始化專案**：
    - 指令：`ng new weather-app --style=css --routing=false --inline-template=false --inline-style=false`
2.  **設定 Tailwind CSS**：
    - 安裝：`npm install -D tailwindcss postcss autoprefixer`
    - 初始化：`npx tailwindcss init`
    - 設定 `tailwind.config.js`：`content: ["./src/**/*.{html,ts}"]`
    - 引入：在 `src/styles.css` 加入 `@tailwind base; @tailwind components; @tailwind utilities;`
3.  **設定 Zoneless 環境**：
    - 更新 `app.config.ts` 以包含 `provideExperimentalZonelessChangeDetection()`。
    - 新增 `provideHttpClient(withFetch())` 以啟用 Fetch API。

### 第二階段：資料服務 (`WeatherService`)
1.  **API 端點**：`https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-091`
2.  **授權金鑰**：使用 API Key `CWA-A6ED67EC-20F5-4067-9788-0DEC7A024AAD`。
3.  **城市列表**：使用 CWA 標準的 22 個縣市名稱 (必須使用繁體「臺」)。
    - 列表：`['臺北市', '新北市', '基隆市', '桃園市', '新竹市', '新竹縣', '宜蘭縣', '苗栗縣', '臺中市', '彰化縣', '南投縣', '雲林縣', '嘉義市', '嘉義縣', '臺南市', '高雄市', '屏東縣', '花蓮縣', '臺東縣', '澎湖縣', '金門縣', '連江縣']`
4.  **資料轉換邏輯**：
    - API 回傳的是「12 小時區間」的資料，需整理為「日」單位。
    - **邏輯**：按日期分組資料。
    - **最高溫**：找出當天「MaxTemperature」欄位中的最大值。
    - **最低溫**：找出當天「MinTemperature」欄位中的最小值。
    - **天氣現象**：取當天第一個可用的描述 (或白天時段數值)。
    - **圖示**：將天氣描述對應到簡單的表情符號 (☀️, 🌧️, ☁️)。

### 第三階段：介面與狀態管理 (`AppComponent`)
1.  **狀態設計**：
    - `city`：一個 Writable Signal (`signal('臺北市')`)，儲存當前選擇的城市。
    - `weatherResource`：一個 Resource (`resource(...)`)，依賴 `city` 的變化來自動重新呼叫 API。
2.  **使用者介面 (UI)**：
    - **標頭 (Header)**：城市選擇下拉選單 (Dropdown)。
    - **網格 (Grid)**：放置天氣卡片的響應式容器。
    - **卡片 (Card)**：顯示 星期、日期、天氣圖示、描述、最高溫、最低溫。
3.  **響應式設計 (Mobile-First with Tailwind)**：
    - **預設 (手機)**：`grid-cols-1`。
    - **平板/桌機**：`md:grid-cols-2 lg:grid-cols-3` 或 `grid-cols-[repeat(auto-fit,minmax(200px,1fr))]`。

## 程式碼結構參考

### `app.config.ts`
```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(), // 啟用無 Zone 模式
    provideHttpClient(withFetch()) // 使用 Fetch API
  ]
};
```

### `weather.service.ts`
- **方法**：`getWeather(city: string)`
- **回傳**：`Promise<DailyWeather[]>`

### `app.ts`
- 使用 `signal` 處理輸入。
- 使用 `resource` 處理資料獲取 (取代傳統的 useEffect/switchMap)。
```typescript
city = signal('臺北市');
weatherResource = resource({
  request: () => ({ city: this.city() }),
  loader: ({ request }) => this.weatherService.getWeather(request.city)
});
```

### `app.html` (Tailwind Example)
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
  @for (day of weatherResource.value(); track day.date) {
    <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <!-- Card Content -->
    </div>
  }
</div>
```
