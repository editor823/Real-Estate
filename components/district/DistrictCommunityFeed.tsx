"use client";

import { useState, useEffect } from "react";
import { MessageSquare, ThumbsUp, Send, User, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommentItem {
  id: string;
  author: string;
  badge: "조합원" | "현장임장러" | "실수요자" | "일반회원";
  content: string;
  date: string;
  likes: number;
}

interface DistrictCommunityFeedProps {
  districtUid: string;
  districtName: string;
}

export function DistrictCommunityFeed({ districtUid, districtName }: DistrictCommunityFeedProps) {
  // 로컬스토리지 키 (구역별로 댓글 분리 저장)
  const storageKey = `comments_${districtUid}`;

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [selectedBadge, setSelectedBadge] = useState<CommentItem["badge"]>("조합원");
  const [inputText, setInputText] = useState("");

  // 기본 시뮬레이션 초기 댓글 목록
  const initialSampleComments: CommentItem[] = [
    {
      id: "c-1",
      author: "한남동주민",
      badge: "조합원",
      content: `${districtName} 최근 관리처분인가 총회 다녀왔는데 분담금 안건이 무리 없이 통과되었습니다. 시공사 브랜드도 확정되어서 기대가 큽니다!`,
      date: "2026.10.18",
      likes: 12,
    },
    {
      id: "c-2",
      author: "임장발품러",
      badge: "현장임장러",
      content: "어제 현장 발품 다녀왔습니다. 경사가 완만하고 인근 초등학교 도보 통학로가 안전하게 정비되어 있네요. 빌라 매물 프리미엄은 소폭 상승세입니다.",
      date: "2026.10.12",
      likes: 8,
    },
    {
      id: "c-3",
      author: "신혼부부내집",
      badge: "실수요자",
      content: "일반분양 언제쯤 나올지 계속 주시하고 있습니다. 84타입 일반분양 비율이 높아서 가점 낮아도 추첨제 도전해볼 만하네요.",
      date: "2026.09.28",
      likes: 5,
    },
  ];

  // 로컬스토리지에서 댓글 불러오기
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setComments(JSON.parse(saved));
      } else {
        setComments(initialSampleComments);
      }
    } catch {
      setComments(initialSampleComments);
    }
  }, [districtUid]);

  // 댓글 저장 헬퍼
  const saveComments = (newComments: CommentItem[]) => {
    setComments(newComments);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newComments));
    } catch {}
  };

  // 새 댓글 등록
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newComment: CommentItem = {
      id: `c_${Date.now()}`,
      author: authorName.trim() || "익명조합원",
      badge: selectedBadge,
      content: inputText.trim(),
      date: "방금 전",
      likes: 0,
    };

    const updated = [newComment, ...comments];
    saveComments(updated);
    setInputText("");
  };

  // 좋아요 클릭
  const handleLike = (commentId: string) => {
    const updated = comments.map((c) => (c.id === commentId ? { ...c, likes: c.likes + 1 } : c));
    saveComments(updated);
  };

  return (
    <div className="space-y-3.5">
      {/* 1. 댓글 작성 폼 */}
      <form onSubmit={handleSubmit} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>현장 이야기 &amp; 소통 남기기</span>
          </span>

          {/* 작성자 뱃지 선택 */}
          <div className="flex items-center gap-1 text-[10px]">
            {(["조합원", "현장임장러", "실수요자"] as const).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setSelectedBadge(b)}
                className={cn(
                  "px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer",
                  selectedBadge === b
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                )}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="닉네임 (기본: 익명)"
            className="w-28 px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
          />
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="현장 분위기, 총회 소식, 임장 의견을 남겨보세요..."
            className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <span>등록</span>
            <Send className="w-3 h-3" />
          </button>
        </div>
      </form>

      {/* 2. 등록된 피드 목록 */}
      <div className="space-y-2">
        {comments.map((item) => (
          <div key={item.id} className="p-3 rounded-xl bg-white border border-gray-200 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-900">{item.author}</span>
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.2 rounded-md",
                    item.badge === "조합원"
                      ? "bg-purple-100 text-purple-700"
                      : item.badge === "현장임장러"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-blue-100 text-blue-700"
                  )}
                >
                  {item.badge}
                </span>
                <span className="text-[10px] text-gray-400">{item.date}</span>
              </div>

              {/* 공감 좋아요 버튼 */}
              <button
                type="button"
                onClick={() => handleLike(item.id)}
                className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-blue-600 transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-gray-50"
              >
                <ThumbsUp className="w-3 h-3" />
                <span className="font-semibold">{item.likes}</span>
              </button>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed break-all">
              {item.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
