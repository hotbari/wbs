#!/usr/bin/env bash
# =============================================================================
# 목데이터 시드 스크립트 — 50개 유저 시나리오용
# 프로젝트 5개, 페이즈 12개, 태스크 30개, 댓글 15개 생성
# =============================================================================
set -euo pipefail

BASE="http://localhost:8080"

echo "=== 1. 로그인 ==="
ADMIN_TOKEN=$(curl -sf "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")

EMP_TOKEN=$(curl -sf "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"employee@test.com","password":"password"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")

echo "  Admin token: ${ADMIN_TOKEN:0:20}..."
echo "  Employee token: ${EMP_TOKEN:0:20}..."

A="Authorization: Bearer $ADMIN_TOKEN"
E="Authorization: Bearer $EMP_TOKEN"
CT="Content-Type: application/json"

# Helper: extract id from JSON response
id() { python3 -c "import sys,json; print(json.load(sys.stdin)['id'])"; }

echo ""
echo "=== 2. 프로젝트 생성 (5개) ==="

P1=$(curl -sf "$BASE/api/projects" -H "$A" -H "$CT" -d '{
  "name":"모바일 앱 v2","description":"차세대 모바일 앱 개발 프로젝트","startDate":"2026-01-15","endDate":"2026-06-30"
}' | id)
echo "  [1] 모바일 앱 v2: $P1"

P2=$(curl -sf "$BASE/api/projects" -H "$A" -H "$CT" -d '{
  "name":"데이터 파이프라인 고도화","description":"실시간 데이터 처리 시스템 구축","startDate":"2026-02-01","endDate":"2026-08-31"
}' | id)
echo "  [2] 데이터 파이프라인 고도화: $P2"

P3=$(curl -sf "$BASE/api/projects" -H "$A" -H "$CT" -d '{
  "name":"고객 포털 리뉴얼","description":"고객 셀프서비스 포털 전면 재구축","startDate":"2026-03-01","endDate":"2026-09-30"
}' | id)
echo "  [3] 고객 포털 리뉴얼: $P3"

P4=$(curl -sf "$BASE/api/projects" -H "$A" -H "$CT" -d '{
  "name":"내부 ERP 마이그레이션","description":"레거시 ERP에서 클라우드 기반 ERP로 전환","startDate":"2025-10-01","endDate":"2026-03-31"
}' | id)
echo "  [4] 내부 ERP 마이그레이션: $P4"

P5=$(curl -sf "$BASE/api/projects" -H "$A" -H "$CT" -d '{
  "name":"보안 인프라 강화","description":"제로트러스트 아키텍처 도입 및 보안 감사 자동화","startDate":"2025-06-01","endDate":"2025-12-31"
}' | id)
echo "  [5] 보안 인프라 강화: $P5"

# 프로젝트4: COMPLETED, 프로젝트5: ARCHIVED
echo ""
echo "=== 3. 프로젝트 상태 변경 ==="
curl -sf "$BASE/api/projects/$P4" -X PATCH -H "$A" -H "$CT" -d '{"status":"COMPLETED"}' > /dev/null
echo "  [4] 내부 ERP → COMPLETED"
curl -sf "$BASE/api/projects/$P5" -X DELETE -H "$A" > /dev/null
echo "  [5] 보안 인프라 → ARCHIVED"

echo ""
echo "=== 4. 페이즈 생성 ==="

# 프로젝트1: 모바일 앱 v2 (3 페이즈)
PH1=$(curl -sf "$BASE/api/projects/$P1/phases" -H "$A" -H "$CT" -d '{
  "name":"기획 및 설계","startDate":"2026-01-15","endDate":"2026-02-28","orderIndex":1
}' | id)
echo "  P1-Phase1 기획: $PH1"

PH2=$(curl -sf "$BASE/api/projects/$P1/phases" -H "$A" -H "$CT" -d '{
  "name":"개발","startDate":"2026-03-01","endDate":"2026-05-31","orderIndex":2
}' | id)
echo "  P1-Phase2 개발: $PH2"

PH3=$(curl -sf "$BASE/api/projects/$P1/phases" -H "$A" -H "$CT" -d '{
  "name":"QA 및 배포","startDate":"2026-06-01","endDate":"2026-06-30","orderIndex":3
}' | id)
echo "  P1-Phase3 QA: $PH3"

# 프로젝트2: 데이터 파이프라인 (3 페이즈)
PH4=$(curl -sf "$BASE/api/projects/$P2/phases" -H "$A" -H "$CT" -d '{
  "name":"요구사항 분석","startDate":"2026-02-01","endDate":"2026-03-15","orderIndex":1
}' | id)
echo "  P2-Phase1 요구사항: $PH4"

PH5=$(curl -sf "$BASE/api/projects/$P2/phases" -H "$A" -H "$CT" -d '{
  "name":"파이프라인 구현","startDate":"2026-03-16","endDate":"2026-06-30","orderIndex":2
}' | id)
echo "  P2-Phase2 구현: $PH5"

PH6=$(curl -sf "$BASE/api/projects/$P2/phases" -H "$A" -H "$CT" -d '{
  "name":"성능 최적화 및 모니터링","startDate":"2026-07-01","endDate":"2026-08-31","orderIndex":3
}' | id)
echo "  P2-Phase3 최적화: $PH6"

# 프로젝트3: 고객 포털 (3 페이즈)
PH7=$(curl -sf "$BASE/api/projects/$P3/phases" -H "$A" -H "$CT" -d '{
  "name":"UX 리서치","startDate":"2026-03-01","endDate":"2026-04-15","orderIndex":1
}' | id)
echo "  P3-Phase1 UX: $PH7"

PH8=$(curl -sf "$BASE/api/projects/$P3/phases" -H "$A" -H "$CT" -d '{
  "name":"프론트엔드 개발","startDate":"2026-04-16","endDate":"2026-07-31","orderIndex":2
}' | id)
echo "  P3-Phase2 프론트엔드: $PH8"

PH9=$(curl -sf "$BASE/api/projects/$P3/phases" -H "$A" -H "$CT" -d '{
  "name":"통합 테스트","startDate":"2026-08-01","endDate":"2026-09-30","orderIndex":3
}' | id)
echo "  P3-Phase3 테스트: $PH9"

# 프로젝트4: ERP 마이그레이션 (2 페이즈 — COMPLETED 프로젝트)
PH10=$(curl -sf "$BASE/api/projects/$P4/phases" -H "$A" -H "$CT" -d '{
  "name":"데이터 이관","startDate":"2025-10-01","endDate":"2025-12-31","orderIndex":1
}' | id)
echo "  P4-Phase1 데이터이관: $PH10"

PH11=$(curl -sf "$BASE/api/projects/$P4/phases" -H "$A" -H "$CT" -d '{
  "name":"시스템 전환","startDate":"2026-01-01","endDate":"2026-03-31","orderIndex":2
}' | id)
echo "  P4-Phase2 시스템전환: $PH11"

# 프로젝트5용 삭제 테스트 페이즈 (ARCHIVED이지만 페이즈 추가 가능)
PH12=$(curl -sf "$BASE/api/projects/$P5/phases" -H "$A" -H "$CT" -d '{
  "name":"보안 감사","startDate":"2025-06-01","endDate":"2025-09-30","orderIndex":1
}' | id)
echo "  P5-Phase1 보안감사: $PH12"

ADMIN_EMP="00000000-0000-0000-0000-000000000001"
TEST_EMP="00000000-0000-0000-0000-000000000002"

echo ""
echo "=== 5. 태스크 생성 (30개) ==="

# P1-Phase1 (기획) - 4 태스크
T1=$(curl -sf "$BASE/api/phases/$PH1/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"시장 조사 보고서 작성\",\"description\":\"경쟁사 앱 분석 및 트렌드 리포트\",\"assigneeId\":\"$TEST_EMP\",\"dueDate\":\"2026-02-10\"
}" | id)
echo "  T1: $T1"

T2=$(curl -sf "$BASE/api/phases/$PH1/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"와이어프레임 제작\",\"description\":\"주요 화면 와이어프레임 Figma 작업\",\"assigneeId\":\"$TEST_EMP\",\"dueDate\":\"2026-02-20\"
}" | id)
echo "  T2: $T2"

T3=$(curl -sf "$BASE/api/phases/$PH1/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"기술 스택 선정\",\"description\":\"Flutter vs React Native 비교 분석\",\"assigneeId\":\"$ADMIN_EMP\",\"dueDate\":\"2026-02-05\"
}" | id)
echo "  T3: $T3"

T4=$(curl -sf "$BASE/api/phases/$PH1/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"PRD 문서 작성\",\"description\":\"Product Requirement Document 초안\",\"assigneeId\":\"$ADMIN_EMP\",\"dueDate\":\"2026-02-28\"
}" | id)
echo "  T4: $T4"

# P1-Phase2 (개발) - 5 태스크
T5=$(curl -sf "$BASE/api/phases/$PH2/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"인증 모듈 개발\",\"description\":\"OAuth2 + 생체인증 구현\",\"assigneeId\":\"$TEST_EMP\",\"dueDate\":\"2026-03-31\"
}" | id)
echo "  T5: $T5"

T6=$(curl -sf "$BASE/api/phases/$PH2/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"메인 화면 UI 구현\",\"description\":\"대시보드 및 네비게이션 개발\",\"assigneeId\":\"$TEST_EMP\",\"dueDate\":\"2026-04-15\"
}" | id)
echo "  T6: $T6"

T7=$(curl -sf "$BASE/api/phases/$PH2/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"푸시 알림 시스템\",\"description\":\"FCM 기반 푸시 알림 구현\",\"assigneeId\":\"$ADMIN_EMP\",\"dueDate\":\"2026-04-30\"
}" | id)
echo "  T7: $T7"

T8=$(curl -sf "$BASE/api/phases/$PH2/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"오프라인 모드 구현\",\"description\":\"로컬 DB 동기화 로직\",\"assigneeId\":\"$TEST_EMP\",\"dueDate\":\"2026-05-15\"
}" | id)
echo "  T8: $T8"

T9=$(curl -sf "$BASE/api/phases/$PH2/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"API 연동 테스트\",\"description\":\"백엔드 API 통합 테스트 자동화\",\"assigneeId\":\"$ADMIN_EMP\",\"dueDate\":\"2026-05-31\"
}" | id)
echo "  T9: $T9"

# P1-Phase3 (QA) - 3 태스크
T10=$(curl -sf "$BASE/api/phases/$PH3/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"통합 테스트 실행\",\"description\":\"전체 기능 E2E 테스트\",\"assigneeId\":\"$TEST_EMP\",\"dueDate\":\"2026-06-15\"
}" | id)
echo "  T10: $T10"

T11=$(curl -sf "$BASE/api/phases/$PH3/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"성능 테스트\",\"description\":\"부하 테스트 및 메모리 프로파일링\",\"assigneeId\":\"$ADMIN_EMP\",\"dueDate\":\"2026-06-20\"
}" | id)
echo "  T11: $T11"

T12=$(curl -sf "$BASE/api/phases/$PH3/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"앱스토어 배포 준비\",\"description\":\"스크린샷, 설명, 메타데이터 준비\",\"assigneeId\":\"$TEST_EMP\",\"dueDate\":\"2026-06-30\"
}" | id)
echo "  T12: $T12"

# P2-Phase1 (요구사항) - 3 태스크
T13=$(curl -sf "$BASE/api/phases/$PH4/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"데이터 소스 목록화\",\"description\":\"현재 사용 중인 모든 데이터 소스 파악\",\"assigneeId\":\"$ADMIN_EMP\",\"dueDate\":\"2026-02-28\"
}" | id)
echo "  T13: $T13"

T14=$(curl -sf "$BASE/api/phases/$PH4/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"처리량 요구사항 정의\",\"description\":\"초당 처리 건수 목표 설정\",\"assigneeId\":\"$TEST_EMP\",\"dueDate\":\"2026-03-10\"
}" | id)
echo "  T14: $T14"

T15=$(curl -sf "$BASE/api/phases/$PH4/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"아키텍처 설계서 작성\",\"description\":\"Kafka + Flink 기반 아키텍처 설계\",\"assigneeId\":\"$ADMIN_EMP\",\"dueDate\":\"2026-03-15\"
}" | id)
echo "  T15: $T15"

# P2-Phase2 (구현) - 3 태스크
T16=$(curl -sf "$BASE/api/phases/$PH5/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"Kafka 클러스터 구축\",\"description\":\"3노드 Kafka 클러스터 구성\",\"assigneeId\":\"$TEST_EMP\",\"dueDate\":\"2026-04-30\"
}" | id)
echo "  T16: $T16"

T17=$(curl -sf "$BASE/api/phases/$PH5/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"Flink 작업 개발\",\"description\":\"실시간 집계 Flink Job 구현\",\"assigneeId\":\"$ADMIN_EMP\",\"dueDate\":\"2026-05-31\"
}" | id)
echo "  T17: $T17"

T18=$(curl -sf "$BASE/api/phases/$PH5/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"데이터 품질 검증 로직\",\"description\":\"데이터 유효성 검증 룰 엔진\",\"assigneeId\":\"$TEST_EMP\",\"dueDate\":\"2026-06-30\"
}" | id)
echo "  T18: $T18"

# P3-Phase1 (UX) - 2 태스크
T19=$(curl -sf "$BASE/api/phases/$PH7/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"사용자 인터뷰\",\"description\":\"기존 고객 20명 심층 인터뷰\",\"assigneeId\":\"$TEST_EMP\",\"dueDate\":\"2026-03-31\"
}" | id)
echo "  T19: $T19"

T20=$(curl -sf "$BASE/api/phases/$PH7/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"페르소나 & 저니맵 작성\",\"description\":\"주요 고객 세그먼트별 페르소나 정의\",\"assigneeId\":\"$ADMIN_EMP\",\"dueDate\":\"2026-04-15\"
}" | id)
echo "  T20: $T20"

# P3-Phase2 (프론트엔드) - 3 태스크
T21=$(curl -sf "$BASE/api/phases/$PH8/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"디자인 시스템 구축\",\"description\":\"공통 컴포넌트 라이브러리 개발\",\"assigneeId\":\"$TEST_EMP\",\"dueDate\":\"2026-05-15\"
}" | id)
echo "  T21: $T21"

T22=$(curl -sf "$BASE/api/phases/$PH8/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"대시보드 페이지 개발\",\"description\":\"고객용 메인 대시보드 구현\",\"assigneeId\":\"$ADMIN_EMP\",\"dueDate\":\"2026-06-30\"
}" | id)
echo "  T22: $T22"

T23=$(curl -sf "$BASE/api/phases/$PH8/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"결제 연동 페이지\",\"description\":\"PG사 연동 및 결제 UI 구현\",\"assigneeId\":\"$TEST_EMP\",\"dueDate\":\"2026-07-31\"
}" | id)
echo "  T23: $T23"

# P4-Phase1 (데이터 이관) - 완료된 프로젝트의 태스크들 (3개)
T24=$(curl -sf "$BASE/api/phases/$PH10/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"마스터 데이터 이관\",\"description\":\"고객/거래처 마스터 데이터 이관\",\"assigneeId\":\"$ADMIN_EMP\",\"dueDate\":\"2025-11-30\"
}" | id)
echo "  T24: $T24"

T25=$(curl -sf "$BASE/api/phases/$PH10/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"트랜잭션 데이터 이관\",\"description\":\"최근 3년 거래 데이터 이관\",\"assigneeId\":\"$TEST_EMP\",\"dueDate\":\"2025-12-15\"
}" | id)
echo "  T25: $T25"

T26=$(curl -sf "$BASE/api/phases/$PH10/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"데이터 정합성 검증\",\"description\":\"이관 전후 데이터 비교 검증\",\"assigneeId\":\"$TEST_EMP\",\"dueDate\":\"2025-12-31\"
}" | id)
echo "  T26: $T26"

# P4-Phase2 (시스템 전환) - 2 태스크
T27=$(curl -sf "$BASE/api/phases/$PH11/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"사용자 교육\",\"description\":\"부서별 신규 ERP 교육 진행\",\"assigneeId\":\"$ADMIN_EMP\",\"dueDate\":\"2026-02-28\"
}" | id)
echo "  T27: $T27"

T28=$(curl -sf "$BASE/api/phases/$PH11/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"병행 운영 모니터링\",\"description\":\"구/신 시스템 병행 운영 및 이슈 대응\",\"assigneeId\":\"$TEST_EMP\",\"dueDate\":\"2026-03-31\"
}" | id)
echo "  T28: $T28"

# P5-Phase1 (보안 감사) - 2 태스크 (ARCHIVED 프로젝트)
T29=$(curl -sf "$BASE/api/phases/$PH12/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"취약점 스캔 자동화\",\"description\":\"OWASP ZAP 기반 자동 스캔 파이프라인 구축\",\"assigneeId\":\"$ADMIN_EMP\",\"dueDate\":\"2025-08-31\"
}" | id)
echo "  T29: $T29"

T30=$(curl -sf "$BASE/api/phases/$PH12/tasks" -H "$A" -H "$CT" -d "{
  \"title\":\"접근 제어 정책 재설계\",\"description\":\"RBAC에서 ABAC으로 전환 설계\",\"assigneeId\":\"$TEST_EMP\",\"dueDate\":\"2025-09-30\"
}" | id)
echo "  T30: $T30"

echo ""
echo "=== 6. 태스크 상태 업데이트 (다양한 진행률) ==="

# 완료된 태스크 (DONE)
for TID in "$T3" "$T24" "$T25" "$T26" "$T27" "$T29"; do
  curl -sf "$BASE/api/tasks/$TID" -X PATCH -H "$A" -H "$CT" -d '{"status":"DONE","progressPercent":100}' > /dev/null
done
echo "  6개 태스크 → DONE (100%)"

# 진행 중 태스크 (IN_PROGRESS)
curl -sf "$BASE/api/tasks/$T1" -X PATCH -H "$E" -H "$CT" -d '{"status":"IN_PROGRESS","progressPercent":70}' > /dev/null
curl -sf "$BASE/api/tasks/$T2" -X PATCH -H "$E" -H "$CT" -d '{"status":"IN_PROGRESS","progressPercent":30}' > /dev/null
curl -sf "$BASE/api/tasks/$T4" -X PATCH -H "$A" -H "$CT" -d '{"status":"IN_PROGRESS","progressPercent":50}' > /dev/null
curl -sf "$BASE/api/tasks/$T13" -X PATCH -H "$A" -H "$CT" -d '{"status":"IN_PROGRESS","progressPercent":80}' > /dev/null
curl -sf "$BASE/api/tasks/$T14" -X PATCH -H "$E" -H "$CT" -d '{"status":"IN_PROGRESS","progressPercent":40}' > /dev/null
curl -sf "$BASE/api/tasks/$T19" -X PATCH -H "$E" -H "$CT" -d '{"status":"IN_PROGRESS","progressPercent":60}' > /dev/null
curl -sf "$BASE/api/tasks/$T28" -X PATCH -H "$E" -H "$CT" -d '{"status":"IN_PROGRESS","progressPercent":90}' > /dev/null
curl -sf "$BASE/api/tasks/$T30" -X PATCH -H "$E" -H "$CT" -d '{"status":"IN_PROGRESS","progressPercent":50}' > /dev/null
echo "  8개 태스크 → IN_PROGRESS (다양한 진행률)"

# 마감 초과 태스크 설정 (과거 날짜, 아직 TODO)
curl -sf "$BASE/api/tasks/$T15" -X PATCH -H "$A" -H "$CT" -d '{"dueDate":"2026-03-10"}' > /dev/null
echo "  T15: 마감일 과거로 설정 (overdue)"

echo ""
echo "=== 7. 댓글 생성 (15개) ==="

ADMIN_USER="00000000-0000-0000-0000-000000000010"
EMP_USER="00000000-0000-0000-0000-000000000020"

# T1 - 대화형 댓글 (3개)
C1=$(curl -sf "$BASE/api/tasks/$T1/comments" -H "$A" -H "$CT" -d '{"body":"시장 조사 범위를 국내로 한정할까요, 해외까지 포함할까요?"}' | id)
echo "  C1 (admin→T1): $C1"

C2=$(curl -sf "$BASE/api/tasks/$T1/comments" -H "$E" -H "$CT" -d '{"body":"국내 + 동남아 시장까지 포함하면 좋을 것 같습니다. 동남아 시장이 빠르게 성장 중이라서요."}' | id)
echo "  C2 (emp→T1): $C2"

C3=$(curl -sf "$BASE/api/tasks/$T1/comments" -H "$A" -H "$CT" -d '{"body":"좋습니다. 국내 + 동남아(베트남, 인도네시아, 태국) 3개국으로 범위를 확정하겠습니다."}' | id)
echo "  C3 (admin→T1): $C3"

# T5 - 기술 논의 (3개)
C4=$(curl -sf "$BASE/api/tasks/$T5/comments" -H "$E" -H "$CT" -d '{"body":"OAuth2 인증 서버는 자체 구축 vs Keycloak 중 어떤 방향인가요?"}' | id)
echo "  C4 (emp→T5): $C4"

C5=$(curl -sf "$BASE/api/tasks/$T5/comments" -H "$A" -H "$CT" -d '{"body":"운영 부담 최소화를 위해 Keycloak으로 가겠습니다. 도커 이미지 기반으로 배포하죠."}' | id)
echo "  C5 (admin→T5): $C5"

C6=$(curl -sf "$BASE/api/tasks/$T5/comments" -H "$E" -H "$CT" -d '{"body":"네, Keycloak 22 LTS 버전으로 진행하겠습니다. 이번 주 내 로컬 환경 구축 완료 예정입니다."}' | id)
echo "  C6 (emp→T5): $C6"

# T13 - 진행 상황 공유 (2개)
C7=$(curl -sf "$BASE/api/tasks/$T13/comments" -H "$A" -H "$CT" -d '{"body":"현재까지 파악된 데이터 소스: RDB 5개, API 12개, S3 버킷 3개, Kafka 토픽 8개입니다."}' | id)
echo "  C7 (admin→T13): $C7"

C8=$(curl -sf "$BASE/api/tasks/$T13/comments" -H "$E" -H "$CT" -d '{"body":"마케팅팀에서 사용하는 Google Analytics와 Amplitude도 포함해야 할 것 같습니다."}' | id)
echo "  C8 (emp→T13): $C8"

# T19 - 인터뷰 피드백 (2개)
C9=$(curl -sf "$BASE/api/tasks/$T19/comments" -H "$E" -H "$CT" -d '{"body":"1차 인터뷰 5명 완료했습니다. 공통적으로 모바일 반응성이 가장 큰 불만 사항이네요."}' | id)
echo "  C9 (emp→T19): $C9"

C10=$(curl -sf "$BASE/api/tasks/$T19/comments" -H "$A" -H "$CT" -d '{"body":"좋은 인사이트네요. 모바일 퍼스트 전략을 포털 리뉴얼의 핵심 원칙으로 삼아야겠습니다."}' | id)
echo "  C10 (admin→T19): $C10"

# T16 - 인프라 관련 (2개)
C11=$(curl -sf "$BASE/api/tasks/$T16/comments" -H "$E" -H "$CT" -d '{"body":"AWS MSK를 사용할지, 자체 EC2에 구축할지 결정이 필요합니다."}' | id)
echo "  C11 (emp→T16): $C11"

C12=$(curl -sf "$BASE/api/tasks/$T16/comments" -H "$A" -H "$CT" -d '{"body":"비용 대비 관리 편의성을 고려하면 MSK가 나을 것 같습니다. PoC 결과 공유 부탁드립니다."}' | id)
echo "  C12 (admin→T16): $C12"

# T24 - 완료 보고 (2개)
C13=$(curl -sf "$BASE/api/tasks/$T24/comments" -H "$A" -H "$CT" -d '{"body":"마스터 데이터 이관 완료. 고객 42,381건, 거래처 8,290건 정상 이관되었습니다."}' | id)
echo "  C13 (admin→T24): $C13"

C14=$(curl -sf "$BASE/api/tasks/$T24/comments" -H "$E" -H "$CT" -d '{"body":"검증 완료했습니다. 원본 대비 100% 일치 확인. 이상 없습니다."}' | id)
echo "  C14 (emp→T24): $C14"

# T8 - 할 일 메모 (1개)
C15=$(curl -sf "$BASE/api/tasks/$T8/comments" -H "$E" -H "$CT" -d '{"body":"SQLite + Room DB 조합으로 가겠습니다. 동기화는 WorkManager 사용 예정."}' | id)
echo "  C15 (emp→T8): $C15"

echo ""
echo "=========================================="
echo "  목데이터 생성 완료!"
echo "  - 프로젝트: 5개 (ACTIVE 3, COMPLETED 1, ARCHIVED 1)"
echo "  - 페이즈: 12개"
echo "  - 태스크: 30개 (DONE 6, IN_PROGRESS 8, TODO 16)"
echo "  - 댓글: 15개"
echo "=========================================="

# Export variables for test script
cat <<VARS > /tmp/wbs-mock-ids.env
P1=$P1
P2=$P2
P3=$P3
P4=$P4
P5=$P5
PH1=$PH1
PH2=$PH2
PH3=$PH3
PH4=$PH4
PH5=$PH5
PH6=$PH6
PH7=$PH7
PH8=$PH8
PH9=$PH9
PH10=$PH10
PH11=$PH11
PH12=$PH12
T1=$T1
T2=$T2
T3=$T3
T4=$T4
T5=$T5
T6=$T6
T7=$T7
T8=$T8
T9=$T9
T10=$T10
T11=$T11
T12=$T12
T13=$T13
T14=$T14
T15=$T15
T16=$T16
T17=$T17
T18=$T18
T19=$T19
T20=$T20
T21=$T21
T22=$T22
T23=$T23
T24=$T24
T25=$T25
T26=$T26
T27=$T27
T28=$T28
T29=$T29
T30=$T30
C1=$C1
C2=$C2
C3=$C3
C15=$C15
ADMIN_TOKEN=$ADMIN_TOKEN
EMP_TOKEN=$EMP_TOKEN
VARS
echo ""
echo "  ID 변수가 /tmp/wbs-mock-ids.env 에 저장되었습니다."
