import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { WeatherService } from './weather.service';

describe('WeatherService With Cache', () => {
  let service: WeatherService;
  let httpMock: HttpTestingController;

  const mockCity = '臺北市';
  // 模擬符合 transformData 邏輯的 API 回傳結構
  const mockResponse = {
    records: {
      locations: [{
        location: [{
          locationName: mockCity,
          weatherElement: [
            {
              elementName: '最高溫度',
              time: [{ startTime: '2023-10-01T00:00:00', elementValue: [{ value: '30' }] }]
            },
            {
              elementName: '最低溫度',
              time: [{ startTime: '2023-10-01T00:00:00', elementValue: [{ value: '25' }] }]
            },
            {
              elementName: '天氣現象',
              time: [{ startTime: '2023-10-01T00:00:00', elementValue: [{ value: '晴' }] }]
            }
          ]
        }]
      }]
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WeatherService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(WeatherService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // 安裝 Jasmine Clock 以控制時間
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2023-10-01T12:00:00Z'));
  });

  afterEach(() => {
    jasmine.clock().uninstall();
    httpMock.verify();
  });

  it('第一次呼叫應發送 API 請求 (Cache Miss)', async () => {
    const promise = service.getWeather(mockCity);

    const req = httpMock.expectOne(req => req.url.includes('LocationName'));
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    const data = await promise;
    expect(data.length).toBeGreaterThan(0);
  });

  it('第二次呼叫應使用快取，不發送 API 請求 (Cache Hit)', async () => {
    // 1. 第一次呼叫，建立快取
    const promise1 = service.getWeather(mockCity);
    const req1 = httpMock.expectOne(req => req.url.includes('LocationName'));
    req1.flush(mockResponse);
    await promise1;

    // 2. 第二次呼叫 (時間未變，或在 30 分鐘內)
    jasmine.clock().tick(10 * 60 * 1000); // 前進 10 分鐘

    const promise2 = service.getWeather(mockCity);
    
    // 驗證沒有新的 HTTP 請求
    httpMock.expectNone(req => req.url.includes('LocationName'));
    
    const data = await promise2;
    expect(data.length).toBeGreaterThan(0);
  });

  it('超過快取時間 (30分鐘) 後應重新發送 API 請求', async () => {
    // 1. 第一次呼叫
    const promise1 = service.getWeather(mockCity);
    const req1 = httpMock.expectOne(req => req.url.includes('LocationName'));
    req1.flush(mockResponse);
    await promise1;

    // 2. 模擬時間經過 31 分鐘
    jasmine.clock().tick(31 * 60 * 1000);

    // 3. 再次呼叫，應該會過期並重新請求
    const promise2 = service.getWeather(mockCity);
    
    const req2 = httpMock.expectOne(req => req.url.includes('LocationName'));
    expect(req2.request.method).toBe('GET');
    req2.flush(mockResponse);

    await promise2;
  });
});
