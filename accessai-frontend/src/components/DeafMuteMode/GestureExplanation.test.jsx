import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import GestureExplanation from "./GestureExplanation";

describe("GestureExplanation Component", () => {
  test("renders gesture title, summary, and formation steps", () => {
    render(<GestureExplanation gestureId="Thumb_Up" />);

    expect(screen.getByText("Thumbs Up")).toBeInTheDocument();
    expect(screen.getByText(/Curl fingers into a firm fist/i)).toBeInTheDocument();
    expect(screen.getByText(/Non-Manual Markers/i)).toBeInTheDocument();
    expect(screen.getByText(/Memory Tip/i)).toBeInTheDocument();
  });

  test("triggers onReplay callback when replay button is clicked", () => {
    const handleReplay = jest.fn();
    render(<GestureExplanation gestureId="Thumb_Up" onReplay={handleReplay} />);

    const replayBtn = screen.getByTestId("explanation-replay-btn");
    expect(replayBtn).toBeInTheDocument();

    fireEvent.click(replayBtn);
    expect(handleReplay).toHaveBeenCalledTimes(1);
  });

  test("triggers onSpeedChange callback with slow-motion multipliers", () => {
    const handleSpeed = jest.fn();
    render(
      <GestureExplanation
        gestureId="Victory"
        onSpeedChange={handleSpeed}
        currentSpeed={1.0}
      />
    );

    const halfSpeedBtn = screen.getByTestId("explanation-speed-0.5");
    expect(halfSpeedBtn).toBeInTheDocument();

    fireEvent.click(halfSpeedBtn);
    expect(handleSpeed).toHaveBeenCalledWith(0.5);

    const quarterSpeedBtn = screen.getByTestId("explanation-speed-0.25");
    fireEvent.click(quarterSpeedBtn);
    expect(handleSpeed).toHaveBeenCalledWith(0.25);
  });

  test("allows switching gestures via category chips", () => {
    const handleSelect = jest.fn();
    render(
      <GestureExplanation
        gestureId="Thumb_Up"
        onSelectGesture={handleSelect}
      />
    );

    const victoryChip = screen.getByTestId("select-gesture-Victory");
    expect(victoryChip).toBeInTheDocument();

    fireEvent.click(victoryChip);
    expect(handleSelect).toHaveBeenCalledWith("Victory");
  });

  test("toggles mastered/practiced status", () => {
    render(<GestureExplanation gestureId="Thumb_Up" />);

    const markBtn = screen.getByTestId("mark-practiced-btn");
    expect(markBtn).toHaveTextContent("Mark as Practiced");

    fireEvent.click(markBtn);
    expect(markBtn).toHaveTextContent("✓ Mastered");

    fireEvent.click(markBtn);
    expect(markBtn).toHaveTextContent("Mark as Practiced");
  });
});
