import { fireEvent, render } from "@testing-library/react-native";

import { InteractiveKoreaMap } from "../InteractiveKoreaMap";

const mockKorea = jest.fn();
const mockRegionMarker = jest.fn();

jest.mock("@/components/Korea", () => ({
  Korea: (props: unknown) => {
    mockKorea(props);
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
  it("calls onRegionPress with the pressed region id", async () => {
    const onRegionPress = jest.fn();
    const view = await render(
      <InteractiveKoreaMap onRegionPress={onRegionPress} />,
    );

    fireEvent.press(view.getByTestId("region-hit-zone-gangwon"));

    expect(onRegionPress).toHaveBeenCalledWith("gangwon");
  });

  it("passes a lightly transparent primary fill to the selected region", async () => {
    await render(<InteractiveKoreaMap selectedRegionId="gangwon" />);

    expect(mockKorea).toHaveBeenCalledWith(
      expect.objectContaining({
        regionColors: expect.objectContaining({
          gangwon: "rgba(39, 199, 168, 0.22)",
        }),
      }),
    );
  });

  it("highlights both Seoul and Gyeonggi when the Seoul region is selected", async () => {
    await render(<InteractiveKoreaMap selectedRegionId="seoul" />);

    expect(mockKorea).toHaveBeenCalledWith(
      expect.objectContaining({
        regionColors: expect.objectContaining({
          seoul: "rgba(39, 199, 168, 0.22)",
          gyeonggi: "rgba(39, 199, 168, 0.22)",
        }),
      }),
    );
  });

  it("highlights metropolitan cities with their surrounding province group", async () => {
    await render(<InteractiveKoreaMap selectedRegionId="gyeongnam" />);

    expect(mockKorea).toHaveBeenCalledWith(
      expect.objectContaining({
        regionColors: expect.objectContaining({
          gyeongnam: "rgba(39, 199, 168, 0.22)",
          busan: "rgba(39, 199, 168, 0.22)",
          ulsan: "rgba(39, 199, 168, 0.22)",
        }),
      }),
    );
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
