import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-5xl">🐪</p>
      <h1 className="mt-4 text-xl font-bold">这里是一片沙漠</h1>
      <p className="mt-2 text-muted">页面不存在或已下线。</p>
      <Link href="/" className="mt-6 inline-block rounded-xl bg-accent px-5 py-2.5 text-white">回首页</Link>
    </main>
  );
}
