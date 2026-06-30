import { fireEvent, render } from "@testing-library/react-native";

import { InteractiveKoreaMap } from "../InteractiveKoreaMap";

const mockKoreaMap = jest.fn();
const mockRegionMarker = jest.fn();

jest.mock("@/components/KoreaMap", () => ({
  KoreaMap: (props: unknown) => {
    mockKoreaMap(props);
    return null;
  },
}));

jest.mock("@/components/ui/RegionMarker", () => {
  return function MockRegionMarker(props: unknown) {
    mockRegionMarker(props);
    return null;
  };
});

describe("InteractiveKoreaMap", () => {
  beforeEach(() => {
    mockKoreaMap.mockClear();
    mockRegionMarker.mockClear();
  });

  it("calls onRegionPress with the pressed region id", async () => {
    const onRegionPress = jest.fn();
    const view = await render(
      <InteractiveKoreaMap onRegionPress={onRegionPress} />,
    );

    fireEvent.press(view.getByTestId("region-hit-zone-gangwon"));

    expect(onRegionPress).toHaveBeenCalledWith("gangwon");
  });

  it("passes the selected region to the shared map", async () => {
    await render(<InteractiveKoreaMap selectedRegionId="gangwon" />);

    expect(mockKoreaMap).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedRegionId: "gangwon",
      }),
    );
  });

  it("keeps the base map fill unchanged when a region is selected", async () => {
    const regionColors = { gangwon: "#123456" };

    await render(
      <InteractiveKoreaMap
        regionColors={regionColors}
        selectedRegionId="gangwon"
      />,
    );

    expect(mockKoreaMap).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultFill: expect.any(String),
        regionColors,
      }),
    );
  });

  it("handles shared map region presses", async () => {
    const onRegionPress = jest.fn();

    await render(<InteractiveKoreaMap onRegionPress={onRegionPress} />);
    const baseMapProps = mockKoreaMap.mock.calls[0][0] as {
      onRegionPress: (regionId: string) => void;
    };

    baseMapProps.onRegionPress("gyeongnam");

    expect(onRegionPress).toHaveBeenCalledWith("gyeongnam");
  });

  it("clears the selected region when the selected shared map region is pressed again", async () => {
    const onRegionPress = jest.fn();

    await render(
      <InteractiveKoreaMap
        selectedRegionId="gangwon"
        onRegionPress={onRegionPress}
      />,
    );
    const baseMapProps = mockKoreaMap.mock.calls[0][0] as {
      onRegionPress: (regionId: string) => void;
    };

    baseMapProps.onRegionPress("gangwon");

    expect(onRegionPress).toHaveBeenCalledWith(undefined);
  });

  it("clears the selected region when the selected hit zone is pressed again", async () => {
    const onRegionPress = jest.fn();
    const view = await render(
      <InteractiveKoreaMap
        selectedRegionId="gangwon"
        onRegionPress={onRegionPress}
      />,
    );

    fireEvent.press(view.getByTestId("region-hit-zone-gangwon"));

    expect(onRegionPress).toHaveBeenCalledWith(undefined);
  });

  it("passes region progress as a percentage label to markers", async () => {
    await render(<InteractiveKoreaMap />);

    expect(mockRegionMarker).toHaveBeenCalledWith(
      expect.objectContaining({
        name: expect.any(String),
        total: expect.stringMatching(/%$/),
      }),
    );
  });
});
