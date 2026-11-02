"""
AccessAI Hierarchical Switch-Scanning State Machine
===================================================
Enables full platform control for learners using single-switch, dual-switch,
or sip-and-puff interfaces.
Implements:
- Single-Switch Auto-Scanning (timed sequential highlight)
- Dual-Switch Step-Scanning (Switch 1: Step, Switch 2: Activate)
- Hierarchical Row-Column Scanning (reduces fatigue from O(N) to O(sqrt(N)))
- 200ms Post-Activation Spasm Debounce Guard
"""

import time
from typing import List, Dict, Any, Optional


class ScanMode:
    AUTO = "auto_scan"
    STEP = "step_scan"
    ROW_COLUMN = "row_column"


class SwitchScanningStateMachine:
    """
    Manages navigation focus and activation across interactive UI targets.
    """

    def __init__(
        self,
        scan_mode: str = ScanMode.STEP,
        scan_interval_ms: float = 1200.0,
        debounce_guard_ms: float = 200.0,
        mode: Optional[str] = None,
        step_interval_ms: Optional[float] = None
    ):
        self.scan_mode = mode if mode is not None else scan_mode
        interval = step_interval_ms if step_interval_ms is not None else scan_interval_ms
        self.scan_interval_ms = max(400.0, min(5000.0, interval))
        self.debounce_guard_ms = max(50.0, min(1000.0, debounce_guard_ms))

        self.targets: List[Dict[str, Any]] = []
        self.current_index: int = 0
        self.current_row: int = 0
        self.current_col: int = 0
        self.in_row_selection: bool = True
        self.last_action_time: float = 0.0

    @property
    def mode(self) -> str:
        return self.scan_mode

    @mode.setter
    def mode(self, val: str):
        self.scan_mode = val

    def set_targets(self, targets: List[Any]):
        """Accepts a list of strings or dicts and formats them."""
        formatted = []
        for i, t in enumerate(targets):
            if isinstance(t, dict):
                formatted.append(t)
            else:
                formatted.append({"id": f"target-{i}", "label": str(t), "value": t})
        self.load_targets(formatted)

    def set_row_column_grid(self, grid: List[List[Any]]):
        """Builds a hierarchical row-column matrix from 2D list."""
        self.scan_mode = ScanMode.ROW_COLUMN
        formatted = []
        for r_idx, row in enumerate(grid):
            for c_idx, item in enumerate(row):
                if isinstance(item, dict):
                    item["row"] = r_idx
                    item["col"] = c_idx
                    formatted.append(item)
                else:
                    formatted.append({
                        "id": f"rc-{r_idx}-{c_idx}",
                        "label": str(item),
                        "value": item,
                        "row": r_idx,
                        "col": c_idx
                    })
        self.load_targets(formatted)

    def load_targets(self, targets: List[Dict[str, Any]]):
        """Loads list of interactive elements [{id: 'btn-1', label: '...', row: 0, col: 0}, ...]."""
        self.targets = targets or []
        self.current_index = 0
        self.current_row = 0
        self.current_col = 0
        self.in_row_selection = True

    def handle_event(
        self,
        event_type: str,
        switch_id: int = 1,
        current_time_ms: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Processes switch input event:
        - switch_id=1 or 'step': Advance focus to next element / row
        - switch_id=2 or 'activate': Activate current focused element
        """
        now = current_time_ms if current_time_ms is not None else (time.time() * 1000.0)
        # Enforce 200ms debounce guard against involuntary spasms
        if (now - self.last_action_time) < self.debounce_guard_ms:
            target = self.get_focused_target()
            return {
                "action": "IGNORED_DEBOUNCE",
                "debounce_active": True,
                "activated": False,
                "remaining_guard_ms": round(self.debounce_guard_ms - (now - self.last_action_time), 1),
                "focused_target": target,
                "active_target": target.get("label", target.get("value")) if target else None,
                "current_index": self.current_index,
                "current_row": self.current_row,
                "current_col": self.current_col
            }

        self.last_action_time = now
        norm_event = event_type.lower().strip()

        # If switch_id == 2 or explicit activation event
        if switch_id == 2 or norm_event in ("switch_2", "activate", "enter", "select"):
            return self._activate_current()
        elif switch_id == 1 or norm_event in ("switch_1", "step", "space", "next", "press"):
            # In ROW_COLUMN mode, if we are in row selection, first activate selects row
            return self._step_forward()
        elif norm_event in ("back", "prev"):
            return self._step_backward()

        return {"action": "UNKNOWN_EVENT", "activated": False, "focused_target": self.get_focused_target()}

    def _step_forward(self) -> Dict[str, Any]:
        if not self.targets:
            return {"action": "NO_TARGETS", "activated": False, "focused_target": None, "active_target": None}

        if self.scan_mode == ScanMode.ROW_COLUMN:
            rows = self._get_unique_rows()
            if self.in_row_selection:
                self.current_row = (self.current_row + 1) % len(rows)
                target = self.get_focused_target()
                return {
                    "action": "STEP_ROW",
                    "activated": False,
                    "current_row": self.current_row,
                    "current_col": self.current_col,
                    "focused_target": target,
                    "active_target": target.get("label", target.get("value")) if target else None
                }
            else:
                row_targets = [t for t in self.targets if t.get("row", 0) == self.current_row]
                self.current_col = (self.current_col + 1) % len(row_targets)
                target = self.get_focused_target()
                return {
                    "action": "STEP_COL",
                    "activated": False,
                    "current_row": self.current_row,
                    "current_col": self.current_col,
                    "focused_target": target,
                    "active_target": target.get("label", target.get("value")) if target else None
                }

        # Linear Step
        self.current_index = (self.current_index + 1) % len(self.targets)
        target = self.get_focused_target()
        return {
            "action": "STEP",
            "activated": False,
            "current_index": self.current_index,
            "focused_target": target,
            "active_target": target.get("label", target.get("value")) if target else None
        }

    def _step_backward(self) -> Dict[str, Any]:
        if not self.targets:
            return {"action": "NO_TARGETS", "activated": False, "focused_target": None, "active_target": None}

        self.current_index = (self.current_index - 1) % len(self.targets)
        target = self.get_focused_target()
        return {
            "action": "STEP_BACK",
            "activated": False,
            "current_index": self.current_index,
            "focused_target": target,
            "active_target": target.get("label", target.get("value")) if target else None
        }

    def _activate_current(self) -> Dict[str, Any]:
        if not self.targets:
            return {"action": "NO_TARGETS", "activated": False, "focused_target": None, "active_target": None}

        if self.scan_mode == ScanMode.ROW_COLUMN and self.in_row_selection:
            # First switch click selects row; next steps traverse columns within that row
            self.in_row_selection = False
            self.current_col = 0
            target = self.get_focused_target()
            return {
                "action": "ROW_SELECTED",
                "activated": False,
                "current_row": self.current_row,
                "current_col": self.current_col,
                "in_column_selection": True,
                "focused_target": target,
                "active_target": target.get("label", target.get("value")) if target else None
            }

        target = self.get_focused_target()
        # Reset row selection state after firing action
        if self.scan_mode == ScanMode.ROW_COLUMN:
            self.in_row_selection = True

        return {
            "action": "ACTIVATED",
            "activated": True,
            "current_index": self.current_index,
            "current_row": self.current_row,
            "current_col": self.current_col,
            "target": target,
            "focused_target": target,
            "active_target": target.get("label", target.get("value")) if target else None
        }

    def get_focused_target(self) -> Optional[Dict[str, Any]]:
        if not self.targets:
            return None
        if self.scan_mode == ScanMode.ROW_COLUMN:
            row_targets = [t for t in self.targets if t.get("row", 0) == self.current_row]
            if row_targets:
                col_idx = min(self.current_col, len(row_targets) - 1)
                return row_targets[col_idx]
            return self.targets[0]
        return self.targets[self.current_index % len(self.targets)]

    def _get_unique_rows(self) -> List[int]:
        rows = sorted(list(set(t.get("row", 0) for t in self.targets)))
        return rows if rows else [0]

