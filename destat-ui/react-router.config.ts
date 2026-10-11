import type { Config } from "@react-router/dev/config";

export default {
  // 지갑 연결 등 브라우저 전용 기능을 쓰기 위해 SPA 모드로 사용
  ssr: false,
} satisfies Config;
