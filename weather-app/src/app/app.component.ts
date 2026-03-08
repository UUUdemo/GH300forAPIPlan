import { Component, signal, inject, computed } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeatherService, DailyWeather } from './weather.service';
import { switchMap, map, catchError, startWith } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private weatherService = inject(WeatherService);

  city = signal('臺北市');
  
  readonly cities = [
    '臺北市', '新北市', '基隆市', '桃園市', '新竹市', '新竹縣', '宜蘭縣',
    '苗栗縣', '臺中市', '彰化縣', '南投縣', '雲林縣',
    '嘉義市', '嘉義縣', '臺南市', '高雄市', '屏東縣',
    '花蓮縣', '臺東縣',
    '澎湖縣', '金門縣', '連江縣'
  ];

  // 使用 toObservable + switchMap + toSignal 模擬 resource
  private weather$ = toObservable(this.city).pipe(
    switchMap(city => 
      this.weatherService.getWeather(city).then(
        data => ({ isLoading: false, value: data, error: null }),
        err => ({ isLoading: false, value: null, error: err })
      )
    ),
    startWith({ isLoading: true, value: null, error: null })
  );

  // 轉回 Signal
  weatherState = toSignal(this.weather$, { 
    initialValue: { isLoading: true, value: null as DailyWeather[] | null, error: null } 
  });

  // 為了讓 template 語法盡量保持不變 (模擬 resource API 結構)
  weatherResource = {
    isLoading: computed(() => this.weatherState().isLoading),
    value: computed(() => this.weatherState().value),
    error: computed(() => this.weatherState().error)
  };

  updateCity(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.city.set(select.value);
  }
}
