# Service 層級記憶體快取 (In-Memory Cache) 開發計畫

## 專案目標
在 `WeatherService` 中實作一個簡單的記憶體快取機制，以減少對 CWA API 的重複呼叫，提升切換城市時的回應速度並節省流量。

## 快取策略 (Strategy)
- **層級**：Service 層級 (Client-Side In-Memory)。
- **儲存結構**：使用 `Map<string, CacheEntry>`。
    - **Key**：城市名稱 (例如 `"臺北市"`)。
    - **Value**：`CacheEntry` 物件，包含天氣資料與時間戳記。
- **過期時間 (TTL)**：**30 分鐘** (1,800,000 毫秒)。
    - CWA 資料每 6 小時更新一次，30 分鐘可確保資料新鮮度，同時有效減少短時間內的重複查詢。

## 實作細節 (Implementation Details)

### 1. 定義快取結構
在 `WeatherService` 中定義介面與儲存屬性：

```typescript
interface CacheEntry {
  data: DailyWeather[];
  timestamp: number;
}

export class WeatherService {
  // 快取儲存容器
  private cache = new Map<string, CacheEntry>();
  // 快取有效時間 (30分鐘)
  private readonly CACHE_DURATION = 30 * 60 * 1000; 
  // ...
}
```

### 2. 修改 `getWeather` 邏輯
將原本直接呼叫 API 的邏輯改為「先查快取，再查 API」：

1.  **檢查快取 (Check Cache)**：
    - 根據 `city` 取得快取資料。
    - 檢查是否過期：`(Date.now() - entry.timestamp) < CACHE_DURATION`。
    - 若命中 (Hit) 且未過期，直接回傳 `entry.data`。
    - *Log*: `[Cache Hit] City: ${city}`

2.  **呼叫 API (Fetch API)**：
    - 若未命中 (Miss) 或已過期，執行 HTTP GET 請求。
    - *Log*: `[Cache Miss] City: ${city}`

3.  **更新快取 (Update Cache)**：
    - 當 API 成功回傳並解析 (`transformData`) 後。
    - 將結果存入 Map：`this.cache.set(city, { data, timestamp: Date.now() })`。
    - 回傳新資料。

### 3. 錯誤處理
- 若 API 呼叫失敗，**不要** 更新快取 (避免快取到錯誤狀態)，並拋出錯誤供 UI 處理。

## 預期效益
- **效能提升**：使用者在多個城市間切換時，曾查詢過的城市將「瞬間」顯示，無須等待網路。
- **流量節省**：減少對 CWA 開放資料平台的請求次數。
- **使用者體驗**：減少 Loading Spinner 出現的頻率。
