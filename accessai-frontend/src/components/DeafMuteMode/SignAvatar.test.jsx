import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import SignAvatar from "./SignAvatar";

describe("SignAvatar Component", () => {
  test("renders sign avatar container and control elements", () => {
    render(<SignAvatar gestureId="Thumb_Up" forceFallback={true} />);

    expect(screen.getByTestId("sign-avatar-container")).toBeInTheDocument();
    expect(screen.getByTestId("sign-avatar-fallback")).toBeInTheDocument();
    expect(screen.getByTestId("sign-avatar-replay-btn")).toBeInTheDocument();
    expect(screen.getByTestId("sign-avatar-pause-btn")).toBeInTheDocument();
  });

  test("gracefully displays 2D vector fallback with directional arrows when in fallback mode", () => {
    render(<SignAvatar gestureId="ILoveYou" forceFallback={true} />);

    expect(screen.getByTestId("sign-avatar-fallback")).toBeInTheDocument();
    expect(screen.getByText(/2D Accessible Vector Fallback Mode Active/i)).toBeInTheDocument();
    expect(screen.getByText("I Love You (ILY)")).toBeInTheDocument();
  });

  test("triggers replay callback and visual indicator when Replay button is clicked", () => {
    jest.useFakeTimers();
    const handleReplay = jest.fn();

    render(
      <SignAvatar
        gestureId="Victory"
        onReplay={handleReplay}
        forceFallback={true}
      />
    );

    const replayBtn = screen.getByTestId("sign-avatar-replay-btn");
    fireEvent.click(replayBtn);

    expect(handleReplay).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Replaying Gesture from Start/i)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.queryByText(/Replaying Gesture from Start/i)).not.toBeInTheDocument();
    jest.useRealTimers();
  });

  test("supports slow-motion speeds (1.0x, 0.5x, 0.25x)", () => {
    const handleSpeed = jest.fn();

    render(
      <SignAvatar
        gestureId="Pointing_Up"
        playbackSpeed={1.0}
        onSpeedChange={handleSpeed}
        forceFallback={true}
      />
    );

    const halfSpeedBtn = screen.getByTestId("speed-btn-0.5");
    expect(halfSpeedBtn).toBeInTheDocument();
    fireEvent.click(halfSpeedBtn);

    expect(handleSpeed).toHaveBeenCalledWith(0.5);

    const quarterSpeedBtn = screen.getByTestId("speed-btn-0.25");
    fireEvent.click(quarterSpeedBtn);

    expect(handleSpeed).toHaveBeenCalledWith(0.25);
  });

  test("toggles pause/resume state to freeze frames for inspection", () => {
    render(<SignAvatar gestureId="Thumb_Up" forceFallback={true} />);

    const pauseBtn = screen.getByTestId("sign-avatar-pause-btn");
    expect(pauseBtn).toHaveTextContent("⏸ Pause");

    fireEvent.click(pauseBtn);
    expect(pauseBtn).toHaveTextContent("▶ Resume");
    expect(screen.getByText("Paused")).toBeInTheDocument();

    fireEvent.click(pauseBtn);
    expect(pauseBtn).toHaveTextContent("⏸ Pause");
  });

  test("toggles fallback mode button", () => {
    render(<SignAvatar gestureId="Thumb_Up" forceFallback={true} />);

    const toggleBtn = screen.getByTestId("toggle-fallback-btn");
    expect(toggleBtn).toHaveTextContent("Exit Fallback");

    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveTextContent("Test Fallback");
  });

  test("supports view angle presets: Full Body, Upper Body, and Hands Zoom", () => {
    render(<SignAvatar gestureId="Thumb_Up" forceFallback={true} />);

    const fullBodyBtn = screen.getByTestId("view-full-body-btn");
    const upperBodyBtn = screen.getByTestId("view-upper-body-btn");
    const handsZoomBtn = screen.getByTestId("view-hands-zoom-btn");

    expect(fullBodyBtn).toBeInTheDocument();
    expect(upperBodyBtn).toBeInTheDocument();
    expect(handsZoomBtn).toBeInTheDocument();

    fireEvent.click(upperBodyBtn);
    expect(upperBodyBtn).toHaveClass("bg-cyan-600");

    fireEvent.click(handsZoomBtn);
    expect(handsZoomBtn).toHaveClass("bg-cyan-600");

    fireEvent.click(fullBodyBtn);
    expect(fullBodyBtn).toHaveClass("bg-cyan-600");
  });
});
