# [CGV] 디자인 분석표

## 확인한 자료

- 디자인 원본: [@https://www.figma.com/design/aB1r5NxzeAJZDwp1CJoPuO/%EB%B0%95%EA%B1%B4%EC%98%81?node-id=525-1518&m=dev]
- 확인한 화면: [메인페이지 (desktop, node 525:1518, 1920x8196)]
- 실제 에셋 위치: [cgv/assets, cgv/assets/figma]

## 화면 목록

| 화면 | 목적 | 주요 행동 | 필요한 상태 |
|---|---|---|---|
| hero | 최초 진입, 대표작 노출 | 영화 선택, 섹션 탐색 | 기본 |
| archive | 관람 기록 분석/관리 | 관람 기록·통계 확인 | 기본, 빈 상태 |
| foryou (ticket) | 굿즈 사전예매 홍보 | 예약하기 | 기본, 비활성(마감 시) |
| foryou (carousel) | 개인화 추천작 탐색 | 좌우 이동, 예매하기 | 기본, 로딩 |
| cinetalk | 리뷰 탐색 | 좌우 스크롤, 리뷰 더보기, 예매하기 | 기본, 빈 상태 |
| coming | 상영예정작 탐색 | 영화 선택 | 기본 |
| icecon | ICECON 작품 탐색 | 예매하기 | 기본 |
| info | 부가 정보 탐색 | 클릭 이동 | 기본 |
| footer | 사이트 정보 확인 | 링크 이동 | 기본 |

## 공통 영역

- 헤더: hero 좌측에 CGV 로고(logo, 72.5x32) + 세로 네비게이션(빠른예매, 내 티켓, 영화, 상영관, 매점, 이벤트/혜택). 현재 메뉴는 흰색(#FFFFFF), 나머지는 회색(#E5E5E5)으로 구분. 우측에 검색/알림/티켓/마이페이지(아바타+화살표) 아이콘 세로 배치.
- 푸터: 배경 rgba(255,255,255,0.3), 텍스트 흰색 20px Pretendard Regular. "CJ CGV(주) / 회사소개 | 이용약관 | 개인정보 처리방침 | 위치기반서비스 이용약관 | 법적고지 | 편성원칙 | 채용정보 | 로그인" 한 줄.
- 공통 버튼: pill 모양(border-radius 25~28px). 아웃라인형(테두리+텍스트, 배경 투명)과 채움형(단색 배경) 두 종류가 반복 사용됨. hero의 예매하기 버튼만 라임색(#E4FF30) 채움 + 어두운 텍스트.
- 공통 카드: cinetalk 리뷰 카드(반투명 배경 + blur, rounded 8px), coming 리스트 카드(썸네일 164x108 + 텍스트), info 카드(정사각 222x222 + 라운드 12px + 하단 텍스트).

## 디자인 토큰

- 배경색: 블랙(#000000, archive), 라임(#CFFD01/#E4FF30 계열, hero 버튼/foryou 티켓), 블루그레이(#8498AC, cinetalk), 옐로우(#FDE52B, coming), 라이트그레이(#E7E7E7, info)
- 본문색: 화이트(#FFFFFF, hero/archive/footer), 블랙(#000000/#000308, coming/foryou ticket), 그레이(#565656, #434343 리뷰 메타)
- 강조색: 라임 #E4FF30(hero 예매 버튼), 코럴 #E46658(info 타이틀/VIEW ALL), 인디고 #3D2CD5(icecon 로고)
- 제목 폰트: Pretendard(Bold/SemiBold/Medium), Archivo Black(archive 소제목), Bebas Neue(CINE TALK, 날짜), Almarai ExtraBold/Bold(coming 타이틀·버튼), Inter Bold/ExtraBold(icecon 로고, archive 인물명)
- 본문 폰트: Pretendard Regular/Medium(공통 본문·네비), Inter Regular/Medium(foryou 카드 설명)
- 기본 간격: 카드 gap 20~29px, 섹션 내부 padding 50~140px(대형 섹션), 아이콘 gap 12~16px
- 라운드: 버튼 25~32px(pill), 카드 8~12px, 이미지 없음(직각) 또는 12px
- 그림자: 버튼 0px 0px 4px rgba(0,0,0,0.25), cinetalk 카드 0px 4px 4px rgba(0,0,0,0.25)/0px 4px 7.6px rgba(62,92,121,0.14)

## 반응형

- 360px: [Figma는 1920px 데스크톱 1개 화면만 제공됨. 태블릿/모바일 전용 프레임은 디자인 원본에 없어 CSS 유연 레이아웃(1열 스택, 폰트/간격 축소)으로 추정 대응함]
- 768px: [위와 동일 — 디자인 원본에 없어 유연 대응]
- 1280px: [디자인 원본 기준값 1920px를 1280px 이하로 스케일 다운하여 배치. 최대 폭은 1920px 기준 비율 유지]

## 인터랙션

- 메뉴: 별도 열기/닫기 상태 디자인 없음(항상 노출된 세로 리스트). 현재 위치는 텍스트 색상(흰색 vs 회색)으로만 구분되어 있어 접근성 보완이 필요함(밑줄/aria-current 추가 예정).
- 버튼: hover/pressed/disabled 디자인 상태 없음 — 기본(대비 유지) 스타일만 확인됨. hover는 밝기/투명도 변화로 최소 구현.
- 스크롤: cinetalk 섹션에 "이전/다음" 텍스트+화살표 컨트롤 존재(가로 스크롤), foryou carousel에 좌우 화살표 버튼 존재.
- 애니메이션: 디자인에 명시된 모션 없음(정적 레이아웃). prefers-reduced-motion 대응만 기본 적용.

## 에셋

- 로고: cgv/assets/figma/hero_logo.png
- 이미지: cgv/assets (archive01/02, foryou01, coming_*, info_*), cgv/assets/figma (hero_main_poster, foryou_yoshi_popcorn, foryou_dune, foryou_contempt_forest, icecon_banner 등 디자인에서 신규 추출)
- 아이콘: cgv/assets/figma/icon_*.png (search, alert, ticket, arrow, star, chevron 등 Figma 원본 추출)
- 폰트: Pretendard(웹폰트 CDN 필요), Inter/Archivo Black/Bebas Neue/Almarai는 시스템 대체 폰트로 근사 처리(별도 라이선스 파일 미제공)

## 확인된 사실

- 전체 페이지는 hero → archive → foryou(굿즈 티켓) → foryou(추천 캐러셀) → cinetalk → coming → icecon → info → footer 순서로 세로 배치됨(PRD 순서와 일치).
- archive01.png/archive02.png/foryou01.png/coming_*.png/info_*.png 로컬 에셋이 Figma 디자인 이미지와 픽셀 단위로 동일함을 스크린샷 비교로 확인함.
- coming_중경삼림_edit.png, coming_토이스토리.png 등은 실제 파일명과 디자인 내 영화명이 일치함.
- hero 대표작(슈퍼 마리오 갤럭시)과 동일한 소재의 로컬 mp4(assets/The Super Mario Galaxy Movie – Yoshi First Look.mp4)가 존재하여 hero 배경에 정적 이미지 대신 영상으로 활용함(자동재생/음소거/루프, prefers-reduced-motion 시 정지).

## 아직 확인하지 못한 내용

- cinetalk 섹션 좌상단/하단의 "lankasnlk / lankasnlknsflnasnknsfalnaf" 텍스트는 디자인 원본에 실제로 그렇게 입력되어 있는 임시 텍스트(lorem 성격)로 보임. 실제 문구를 임의로 창작하지 않고 원문 그대로 표기함 — 추후 실제 카피 확정 필요.
- archive 섹션의 조지 밀러 카드 위에 겹쳐진 19개의 세부 벡터(손글씨 서명 형태 장식)는 개별 파츠가 매우 작고 순수 장식 요소로 판단되어, 핵심 콘텐츠(사진·이름·설명)만 구현하고 서명 장식은 생략함.
- info 섹션 첫 번째 카드의 실제 라벨 텍스트가 "dafdfasdfaf / sdafafdafd..." 형태의 placeholder로 되어 있어, PRD 7번 항목에 명시된 5개 카테고리(이벤트/혜택, 단체/대관, 아트갤러리, 매점/굿즈, 포토플레이)와 로컬 에셋 파일명(info_액티비티 등)을 근거로 "이벤트/혜택"으로 매핑함 — 디자이너 확인 필요.
- 태블릿(768px)·모바일(360px) 전용 레이아웃이 Figma 파일에 없어 데스크톱 1920px 기준을 비율 축소/1열 재배치하는 방식으로 대응함 — 실제 반응형 시안이 추가되면 재검증 필요.
- foryou carousel의 배경(image 142, 3840x2160, 대부분 화면 밖으로 오프셋)은 시각적 영향이 거의 없어 저해상도로 축소 적용함.
