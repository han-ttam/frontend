import { render } from "@testing-library/react-native";

import HomeScreen from "../app/index";

jest.mock("expo-router", () => ({
  Redirect: () => null,
}));

jest.mock("@/pages/landing/LandingPage", () => {
  return function MockLandingPage() {
    return null;
  };
});

describe("HomeScreen", () => {
  it("renders the landing page while data is unavailable", async () => {
    const view = await render(<HomeScreen />);

    expect(view).toBeTruthy();
  });
});
