/**
 * Cloudflare Pages Functions - R2 이미지 업로드 API
 * 
 * 엔드포인트: POST /api/upload
 * 
 * [초보자 설명: 동작 순서]
 * 1. 브라우저에서 WebP로 압축된 이미지 파일을 전송합니다.
 * 2. 이 함수가 Cloudflare R2 버킷에 안전하게 저장합니다. (비밀 키를 프론트에 노출하지 않음!)
 * 3. 저장이 완료되면 DB에 저장할 'storage_key'를 프론트로 돌려줍니다.
 */

interface Env {
  // wrangler.toml에 바인딩된 R2 버킷 이름: MY_BUCKET
  MY_BUCKET?: {
    put: (key: string, value: ReadableStream | ArrayBuffer | FormDataEntryValue, options?: Record<string, unknown>) => Promise<unknown>;
  };
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const { request, env } = context;

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return new Response(
        JSON.stringify({ error: "multipart/form-data 형식으로 전송해야 합니다." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "districts";
    const targetId = (formData.get("targetId") as string) || "general";
    const customKey = formData.get("customKey") as string | null;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "업로드할 파일이 없습니다." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 파일 키 결정 (전달받은 키가 있으면 사용, 없으면 자동 생성)
    const storageKey = customKey || `${category}/${targetId.replace(/[^a-zA-Z0-9_-]/g, "_")}/${file.name}`;

    // Cloudflare R2 버킷(MY_BUCKET)에 영구 저장 (0원 전송료)
    if (env.MY_BUCKET) {
      await env.MY_BUCKET.put(storageKey, file.stream(), {
        httpMetadata: {
          contentType: "image/webp",
          cacheControl: "public, max-age=31536000, immutable",
        },
      });
    } else {
      // 로컬 개발이거나 R2 바인딩이 아직 안 된 경우 안내
      console.warn("R2_BUCKET 바인딩이 설정되지 않아 모의(Mock) 성공 응답을 반환합니다.");
    }

    // 프론트엔드에는 DB에 저장할 storage_key만 반환
    return new Response(
      JSON.stringify({
        success: true,
        storageKey: storageKey,
        fileName: file.name,
        size: file.size,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "서버 업로드 오류";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
