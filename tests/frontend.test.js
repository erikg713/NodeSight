import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../src/App";
import "@testing-library/jest-dom";

// Mocking the Pi SDK to prevent initialization errors during testing
global.Pi = {
  init: jest.fn(),
  authenticate: jest.fn().mockResolvedValue({ user: { username: "test_pioneer" } }),
};

// Mocking TensorFlow.js and MobileNet for lightweight AI testing
jest.mock("@tensorflow-models/mobilenet", () => ({
  load: jest.fn().mockResolvedValue({
    classify: jest.fn().mockResolvedValue([
      { className: "Monstera Deliciosa", probability: 0.95 },
    ]),
  }),
}));

describe("NodeSight Frontend UI/UX", () => {
  test("renders the main action button for camera capture", () => {
    render(<App />);
    const captureButton = screen.getByRole("button", { name: /scan object/i });
    expect(captureButton).toBeInTheDocument();
  });

  test("displays loading state while the AI model is initializing", async () => {
    render(<App />);
    expect(screen.getByText(/initializing node/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText(/initializing/i)).not.toBeInTheDocument();
    });
  });

  test("successfully identifies an object and displays results", async () => {
    render(<App />);
    
    const captureButton = screen.getByRole("button", { name: /scan object/i });
    fireEvent.click(captureButton);

    const result = await screen.findByText(/Monstera Deliciosa/i);
    expect(result).toBeInTheDocument();
    expect(screen.getByText(/95%/)).toBeInTheDocument();
  });

  test("shows an error message if the camera access is denied", async () => {
    // Mocking a media device failure
    navigator.mediaDevices.getUserMedia = jest.fn().mockRejectedValue(new Error("Permission Denied"));
    
    render(<App />);
    const captureButton = screen.getByRole("button", { name: /scan object/i });
    fireEvent.click(captureButton);

    const errorMessage = await screen.findByText(/camera access denied/i);
    expect(errorMessage).toBeInTheDocument();
  });
});
