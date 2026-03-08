---
applyTo: "**/*.{ts,html,scss}"
priority: 100
---

# Angular 21 Coding Style Guidelines

本專案使用 Angular 21 (v21.2+)，請遵循以下開發規範以確保程式碼品質與一致性。

## 1. 核心原則 (Core Principles)
*   **Signals Everywhere**：全面使用 Signals API 來管理狀態與反應式資料流。
*   **Zoneless**：應用程式預設為 Zoneless 模式，避免依賴 Zone.js。
*   **Standalone Components**：所有元件、指令與管道 (Pipes) 皆為 Standalone。
*   **Mobile First**：CSS 樣式設計以手機版面為優先。

## 2. 元件與指令 (Components & Directives)

### 依賴注入 (Dependency Injection)
*   **禁止使用建構式注入 (Constructor Injection)**。
*   **必須使用 `inject()` 函式**。
    *   *優點*：型別推斷更佳、支援繼承、程式碼更簡潔。
    *   *範例*：
        ```typescript
        // Good
        private http = inject(HttpClient);
        private route = inject(ActivatedRoute);

        // Bad
        constructor(private http: HttpClient, private route: ActivatedRoute) {}
        ```

### 輸入與輸出 (Inputs & Outputs)
*   **使用 Signal Inputs (`input()`)** 取代 `@Input()`。
*   **使用 Signal Outputs (`output()`)** 取代 `@Output()`。
*   **使用 Model Inputs (`model()`)** 處理雙向綁定。
*   **修飾符**：
    *   **必須** 將 `input`, `output`, `model`, `viewChild` 等屬性宣告為 `readonly`。
    *   *範例*：
        ```typescript
        // Good
        readonly city = input.required<string>();
        readonly onCityChange = output<string>();
        
        // Bad
        @Input() city: string;
        @Output() onCityChange = new EventEmitter<string>();
        ```

### 成員可見性 (Member Visibility)
*   **使用 `protected` 修飾符**：
    *   對於僅在 Template (HTML) 中使用，但不屬於公開 API (非 Input/Output) 的屬性或方法，**必須** 設為 `protected`。
    *   這能清楚區分哪些是用於 Template，哪些是公開給父元件使用的。
    *   *範例*：
        ```typescript
        @Component({
          template: `<h1>{{ title() }}</h1>`
        })
        export class AppComponent {
          // 只在 Template 用到
          protected readonly title = signal('Weather App'); 
        }
        ```

## 3. 模板 (Templates)

### 控制流程 (Control Flow)
*   **必須使用新版控制流程語法 (@if, @for, @switch)**。
*   禁止使用舊版指令 (`*ngIf`, `*ngFor`, `*ngSwitch`)。
    *   *範例*：
        ```html
        <!-- Good -->
        @if (isLoading()) {
          <p>Loading...</p>
        } @else {
          <data-view />
        }

        <!-- Bad -->
        <p *ngIf="isLoading()">Loading...</p>
        ```

### 樣式綁定 (Style Bindings)
*   **禁止使用 `ngClass` 與 `ngStyle`**。
*   **必須使用 `[class.name]` 與 `[style.prop]`**。
    *   *範例*：
        ```html
        <!-- Good -->
        <div [class.active]="isActive()" [style.color]="color()">...</div>

        <!-- Bad -->
        <div [ngClass]="{'active': isActive()}" [ngStyle]="{'color': color()}">...</div>
        ```

### 事件命名
*   事件處理函式應以「動作 (Action)」命名，而非「觸發事件」。
    *   *Good*：`saveData()`
    *   *Bad*：`onClick()`

## 4. 非同步資料處理 (Async Data)
*   **使用 `resource` API** (Angular 19+) 取代 `useEffect` 或複雜的 RxJS `switchMap` 流程。
    *   *範例*：
        ```typescript
        // 自動追蹤 param 變化並重新 fetch
        weatherResource = resource({
          request: () => ({ city: this.city() }),
          loader: ({ request }) => this.weatherService.getWeather(request.city)
        });
        ```

## 5. 檔案命名與結構
*   **檔案命名**：使用 kebab-case (例如 `weather-card.component.ts`)。
*   **單一職責**：每個檔案只包含一個主要的 Class (Component/Service)。
*   **資料夾結構**：依功能 (Feature) 分組，而非依類型 (Type) 分組。
