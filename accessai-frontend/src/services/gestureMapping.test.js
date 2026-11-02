import {
  GESTURES,
  GESTURE_CATEGORIES,
  SUPPORTED_SPEEDS,
  getGestureById,
  getAllGestures,
  getGesturesByCategory,
  searchGestures
} from "./gestureMapping";

describe("gestureMapping Service", () => {
  test("contains all primary sign gestures", () => {
    const gestures = getAllGestures();
    expect(gestures.length).toBeGreaterThanOrEqual(6);

    const ids = gestures.map((g) => g.id);
    expect(ids).toContain("Thumb_Up");
    expect(ids).toContain("Pointing_Up");
    expect(ids).toContain("Victory");
    expect(ids).toContain("ILoveYou");
    expect(ids).toContain("Open_Palm");
    expect(ids).toContain("Closed_Fist");
    expect(ids).toContain("Thank_You");
  });

  test("each gesture contains complete anatomical and linguistic metadata", () => {
    GESTURES.forEach((gesture) => {
      expect(gesture.id).toBeDefined();
      expect(gesture.label).toBeDefined();
      expect(gesture.category).toBeDefined();
      expect(gesture.avatarAction).toBeDefined();
      expect(gesture.icon).toBeDefined();
      expect(gesture.summary).toBeDefined();

      const exp = gesture.explanation;
      expect(exp).toBeDefined();
      expect(typeof exp.handshape).toBe("string");
      expect(typeof exp.orientation).toBe("string");
      expect(typeof exp.location).toBe("string");
      expect(typeof exp.movement).toBe("string");
      expect(typeof exp.nonManualMarkers).toBe("string");
      expect(typeof exp.memoryTip).toBe("string");
      expect(Array.isArray(exp.steps)).toBe(true);
      expect(exp.steps.length).toBeGreaterThan(0);
    });
  });

  test("getGestureById retrieves gesture case-insensitively", () => {
    const g1 = getGestureById("Thumb_Up");
    expect(g1).not.toBeNull();
    expect(g1.id).toBe("Thumb_Up");

    const g2 = getGestureById("thumb_up");
    expect(g2).not.toBeNull();
    expect(g2.id).toBe("Thumb_Up");

    const gInvalid = getGestureById("NonExistentGesture");
    expect(gInvalid).toBeNull();

    const gNull = getGestureById(null);
    expect(gNull).toBeNull();
  });

  test("getGesturesByCategory filters accurately", () => {
    const commands = getGesturesByCategory(GESTURE_CATEGORIES.COMMANDS);
    expect(commands.length).toBeGreaterThan(0);
    commands.forEach((c) => expect(c.category).toBe(GESTURE_CATEGORIES.COMMANDS));

    const all = getGesturesByCategory("all");
    expect(all.length).toBe(GESTURES.length);
  });

  test("searchGestures matches query keywords", () => {
    const peaceResults = searchGestures("peace");
    expect(peaceResults.some((g) => g.id === "Victory")).toBe(true);

    const fistResults = searchGestures("fist");
    expect(fistResults.some((g) => g.id === "Closed_Fist" || g.id === "Thumb_Up")).toBe(true);
  });

  test("SUPPORTED_SPEEDS contains 1.0x, 0.5x, and 0.25x for slow-motion study", () => {
    const speedVals = SUPPORTED_SPEEDS.map((s) => s.value);
    expect(speedVals).toContain(1.0);
    expect(speedVals).toContain(0.5);
    expect(speedVals).toContain(0.25);
  });
});
