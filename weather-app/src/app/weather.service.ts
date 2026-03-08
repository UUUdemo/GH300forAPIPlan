import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

export interface DailyWeather {
  date: string;       // 日期 (YYYY-MM-DD)
  dayOfWeek: string;  // 星期幾
  maxT: string;       // 最高溫
  minT: string;       // 最低溫
  wx: string;         // 天氣現象
  wxIcon: string;     // 簡單的天氣圖示 (emoji 代表)
}

interface CacheEntry {
  data: DailyWeather[];
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  // 快取儲存容器
  private cache = new Map<string, CacheEntry>();
  // 快取有效時間 (30分鐘)
  private readonly CACHE_DURATION = 30 * 60 * 1000;

  private http = inject(HttpClient);
  private readonly API_KEY = 'CWA-A6ED67EC-20F5-4067-9788-0DEC7A024AAD';
  private readonly BASE_URL = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-091';

  async getWeather(city: string): Promise<DailyWeather[]> {
    // 1. 檢查快取
    const cachedEntry = this.cache.get(city);
    const now = Date.now();

    if (cachedEntry && (now - cachedEntry.timestamp < this.CACHE_DURATION)) {
      console.log(`[Cache Hit] City: ${city}`);
      return cachedEntry.data;
    }

    console.log(`[Cache Miss] City: ${city}`);

    const params = {
      Authorization: this.API_KEY,
      LocationName: city,
      ElementName: '最高溫度,最低溫度,天氣現象'
    };

    const queryString = new URLSearchParams(params).toString();
    const url = `${this.BASE_URL}?${queryString}`;

    try {
      const response: any = await firstValueFrom(this.http.get(url));
      console.log('API Response:', response); // Debug: 印出 API 回傳
      
      const data = this.transformData(response);

      // 更新快取
      this.cache.set(city, {
        data: data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('API Error:', error); // Debug: 印出 API 錯誤
      throw error;
    }
  }

  private transformData(data: any): DailyWeather[] {
    console.log('Transforming data:', data);

    if (!data || !data.records) {
        console.error('No records found');
        throw new Error('API 回傳資料無 records');
    }

    let locationNode = null;

    // 處理大小寫問題 (Locations vs locations)
    const locations = data.records.locations || data.records.Locations;

    if (locations && Array.isArray(locations) && locations.length > 0) {
        // 同樣處理內層的 location vs Location
        const locArray = locations[0].location || locations[0].Location;
        if (locArray && Array.isArray(locArray) && locArray.length > 0) {
            locationNode = locArray[0];
        }
    } 
    // Case 2: records.location (有些 API 直接在 records 下)
    else {
        const directLoc = data.records.location || data.records.Location;
        if (directLoc && Array.isArray(directLoc)) {
            locationNode = directLoc[0];
        }
    }

    if (!locationNode) {
      console.error('Cannot find location node in:', data.records);
      throw new Error('無法找到地點資料 (Location Node)');
    }

    const weatherElements = locationNode.weatherElement || locationNode.WeatherElement;

    if (!weatherElements || !Array.isArray(weatherElements)) {
        console.error('Weather elements not found in location node:', locationNode);
        throw new Error('無法找到天氣元素 (Weather Element)');
    }
    
    // Helper function to safely get element data
    const getElementTime = (name: string) => {
      const el = weatherElements.find((e: any) => e.elementName === name || e.ElementName === name);
      return el ? (el.time || el.Time) : [];
    };

    const maxTData = getElementTime('最高溫度');
    const minTData = getElementTime('最低溫度');
    const wxData = getElementTime('天氣現象');

    console.log('Elements found:', { maxT: maxTData.length, minT: minTData.length, wx: wxData.length });

    const dailyMap = new Map<string, Partial<DailyWeather>>();

    // Helper to extract value safely
    const getValue = (item: any) => {
        const ev = item.elementValue || item.ElementValue;
        if (!ev || !Array.isArray(ev) || ev.length === 0) {
            console.warn('Invalid elementValue:', item);
            return null;
        }
        
        // 取得物件的第一個屬性值 (例如 MaxTemperature: "20" -> "20")
        const valueObj = ev[0];
        // 如果有 value 或 Value 屬性則優先使用
        if (valueObj.value) return valueObj.value;
        if (valueObj.Value) return valueObj.Value;

        // 否則取第一個 Key 的值 (處理動態 Key 如 MaxTemperature)
        const keys = Object.keys(valueObj);
        if (keys.length > 0) {
            return valueObj[keys[0]];
        }
        
        return null;
    };

    const getDate = (item: any) => {
        const time = item.startTime || item.StartTime;
        if (!time) {
            console.warn('Invalid startTime:', item);
            return null;
        }
        return time.split('T')[0];
    };

    // Debug: 印出第一筆資料的結構，確認欄位名稱
    if (maxTData.length > 0) {
        console.log('Sample MaxT Item:', maxTData[0]);
    }

    maxTData.forEach((item: any) => {
      const date = getDate(item);
      const valStr = getValue(item);
      if (!date || !valStr) return;
      
      const val = parseInt(valStr);
      
      if (!dailyMap.has(date)) dailyMap.set(date, { date });
      const current = dailyMap.get(date)!;
      current.maxT = current.maxT ? String(Math.max(parseInt(current.maxT || '-999'), val)) : String(val);
    });

    minTData.forEach((item: any) => {
      const date = getDate(item);
      const valStr = getValue(item);
      if (!date || !valStr) return;

      const val = parseInt(valStr);
      
      const current = dailyMap.get(date);
      if (current) {
        current.minT = current.minT ? String(Math.min(parseInt(current.minT || '999'), val)) : String(val);
      }
    });

    wxData.forEach((item: any) => {
      const date = getDate(item);
      const wx = getValue(item);
      if (!date || !wx) return;

      const current = dailyMap.get(date);
      
      // 優先使用白天的天氣現象
      if (current && !current.wx) {
        current.wx = wx;
        current.wxIcon = this.getIcon(wx);
        try {
            const dateObj = new Date(date);
            if (!isNaN(dateObj.getTime())) {
                 current.dayOfWeek = dateObj.toLocaleDateString('zh-TW', { weekday: 'long' });
            } else {
                 current.dayOfWeek = '未知';
            }
        } catch (e) {
            current.dayOfWeek = '未知';
        }
      }
    });

    const result = Array.from(dailyMap.values())
      .map(d => d as DailyWeather)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 7);
      
    console.log('Transformed result:', result);
    return result;
  }

  private getIcon(wx: string): string {
    if (wx.includes('晴')) return '☀️';
    if (wx.includes('雨')) return '🌧️';
    if (wx.includes('雲') || wx.includes('陰')) return '☁️';
    return '🌥️';
  }
}
