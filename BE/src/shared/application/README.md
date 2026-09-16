# 공유 Application

application 계층에서 공유하는 port와 orchestration primitive를 이곳에 둔다.

예시:

- transaction manager port
- 현재 사용자 context type
- external auth provider port
- pagination request/response type

Supabase Auth도 application 계층에서는 직접 의존하지 않는다. `ExternalAuthVerifier` port를 통해 사용하고, 실제 Supabase JWT 검증 구현체는 infrastructure 계층에 둔다.

module 간 협력이 필요하면 다른 module의 infrastructure 구현체를 직접 가져오지 않고, owning module이 공개한 application/query port 또는 use case facade를 통해 표현한다.
