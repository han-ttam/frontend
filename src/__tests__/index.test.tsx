import { render } from "@testing-library/react-native";

import HomeScreen from "../app/index";

jest.mock("expo-router", () => ({
  Redirect: () => null,
}));

describe("HomeScreen", () => {
  it("renders the redirect without crashing", () => {
    const view = render(<HomeScreen />);

    expect(view).toBeTruthy();
  });
});
