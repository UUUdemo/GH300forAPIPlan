# WeatherApp (Taiwan Weather Forecast)

一個基於 Angular 18+ 與 Tailwind CSS 開發的台灣天氣預報應用程式，串接中央氣象署 (CWA) 開放資料 API，提供全台各縣市的一週天氣預報。

## ✨ 特色功能 (Features)

*   **即時天氣預報**：串接 CWA API (F-D0047-091)，提供準確的天氣資訊。
*   **全台縣市支援**：內建 22 縣市選擇功能，輕鬆切換查詢不同地區。
*   **直覺的 UI 設計**：
    *   **Mobile-First**：響應式設計 (Grid Layout)，在手機與桌機上皆有良好體驗。
    *   **天氣卡片**：清晰顯示日期、天氣圖示、最高/最低溫。
    *   **狀態提示**：包含載入中 (Loading) 與錯誤 (Error) 狀態顯示。
*   **效能優化**：
    *   **In-Memory Cache**：實作資料快取機制，減少重複 API 呼叫。
    *   **Zoneless**：採用 Angular 最新 `provideExperimentalZonelessChangeDetection` 模式，提升效能並移除 `zone.js` 依賴。
    *   **Signals**：使用 Angular Signals (`signal`, `toSignal`) 管理狀態與資料流。

## 🛠️ 技術堆疊 (Tech Stack)

*   **Framework**: Angular 18.2.0
*   **Styling**: Tailwind CSS
*   **State Management**: Angular Signals
*   **Data Fetching**: HttpClient (Fetch API)
*   **API**: [CWA Open Data API (F-D0047-091)](https://opendata.cwa.gov.tw/)

## 🚀 快速開始 (Getting Started)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/UUUdemo/GH300forAPIPlan.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd weather-app
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
