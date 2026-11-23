# guide-monitor

공식 가이드 URL의 변경을 매일 확인하는 스크립트.

```
python3 -I guide_check.py                 # active 전체
python3 -I guide_check.py --only meta_ads_guide
```

- 입력: `guide-registry.csv` (status가 `active`인 행만, `method` = etag | text | pdf | render)
- 출력: `data/state.json`(현재 해시·대기 해시·이력), `data/snapshots/<id>/<날짜>.txt`, `reports/<날짜>.md`
- 변경은 **2회 연속** 같은 새 해시일 때만 확정한다. 한 번만 보이면 "변경 후보"로 둔다.
- `render`는 node + playwright 필요(`render.js`). Meta 광고 가이드처럼 JS로 규격표를 그리는 페이지용이며, 규격 블록("디자인 추천 사항" ~ "노출 위치 선택하기")만 비교한다.
- 환경: HTTPS_PROXY와 CA는 환경변수를 따른다. 호스트가 네트워크 정책에서 허용돼 있어야 한다.

알려진 한계
- Meta 인스타그램 스토리·릴스 노출 위치 전환은 자동화 전(드롭다운). 현재 등록 URL은 Facebook 피드 영상 사양이다.
- 네이버(`candidate`)는 소재 가이드 상세 URL이 정해질 때까지 확인하지 않는다.
- 포커스미디어 `/guide`는 홈으로 리디렉션된다. 별도 가이드 문서 URL을 찾아야 한다.
