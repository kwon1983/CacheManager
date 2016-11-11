# CacheManager
* object 단위로 캐쉬를 사용할수 있게 함.
* lifeTime을 지정하여 캐쉬 item의 만료 시간을 지정할 수 있음.
* 도메인 단위로 캐쉬 유지 가능

## 사용법
```javascript
var cacheManager = new CacheManager();
cacheManager.setItem('myDate', new Date());
var date = cacheManager.getItem('myDate');
var allCache = cacheManager.getAll();
```

### setItem(name, item, timer)
캐시에 데이터를 저장함

* name(require)
 * 캐시할 item 이름(string)
* item(require)
 * 캐시랑 item (object, string ...anyting)
* timer(option)
 * 지정할 lifeTime 지정 하지 않으면 session에만 cache 적용
 * 0: 만료시간 없음 계속 살아있음
 * number: 해당되는 숫자의 timestamp(milliseconds) 이후에 만료
 * Date: 해당되는 Date에 만료

### getItem(name, deleteItem)
캐시에서 데이터를 가져옴

* name(require)
 * 가져올 캐시 이름
* deleteItem(option)
 * true|false 가져온 이후 아이템 삭제여부 default false

### removeItem(name)
캐시에서 데이터를 삭제

* name(require)
 * 삭제할 캐시 이름

### getAll()
저장된 캐시를 모두 가져옴(CacheManager로 저장된 캐시)

* 저장된 캐시를 모두 가져옴
 * return Array
