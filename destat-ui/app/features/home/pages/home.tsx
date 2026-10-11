import { supabase } from "~/postgres/supaclient";

// 홈 컴포넌트가 렌더링되기 전에 실행
export async function clientLoader() {
  const { data } = await supabase().from("destat-test").select("*");
  return { data };
}

export default function Home() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Hello destat world</h1>
    </div>
  );
}
