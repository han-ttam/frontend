import { render } from "@testing-library/react-native";

import HomeScreen from "./index";

describe("HomeScreen", () => {
  it("renders the welcome text", async () => {
    const { getByText } = await render(<HomeScreen />);

    expect(getByText("Handdam")).toBeTruthy();
  });
});
