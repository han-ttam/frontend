import { collectionDetailMock } from "@/features/mypage/collectionDetailMock";
import { countCollected } from "@/features/mypage/format";
import { mypageCollections } from "@/features/mypage/mockData";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("collectionDetailMock", () => {
  it("마이페이지의 모든 모음 카드가 상세로 연결된다", () => {
    mypageCollections.items.forEach((card) => {
      expect(collectionDetailMock[card.id]).toBeDefined();
    });
  });

  it("카드 숫자와 목록의 수집 개수가 어긋나지 않는다", () => {
    mypageCollections.items.forEach((card) => {
      const detail = collectionDetailMock[card.id];

      expect(countCollected(detail.items)).toBe(card.filled);
      expect(detail.items).toHaveLength(card.total);
    });
  });

  it("명소 식별자는 실제 서버 UUID 형식이고 모음 안에서 중복되지 않는다", () => {
    Object.values(collectionDetailMock).forEach((detail) => {
      const placeIds = detail.items.map((place) => place.placeId);

      placeIds.forEach((placeId) => {
        expect(placeId).toMatch(UUID_PATTERN);
      });

      expect(new Set(placeIds).size).toBe(placeIds.length);
    });
  });
});
