from __future__ import annotations
import json
import sys
import tkinter as tk
from pathlib import Path
from tkinter import ttk
import webbrowser

def resource_path(name: str) -> Path:
    base = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parent))
    return base / name

def load_repositories():
    try:
        data = json.loads(resource_path("apps.json").read_text(encoding="utf-8"))
        return data.get("repositories", [])
    except Exception as exc:
        return [{"name": "Inventory unavailable", "branch": "—", "files": 0,
                 "areas": [], "languages": [], "python": "unknown",
                 "detail": str(exc), "url": "https://github.com/amerhwitat"}]

class PythonApplicationHub(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Python Application Hub")
        self.geometry("1000x650")
        self.minsize(760, 520)
        self.repositories = load_repositories()
        self._build()
        self.refresh()

    def _build(self):
        root = ttk.Frame(self, padding=14)
        root.pack(fill="both", expand=True)
        ttk.Label(root, text="Python Application Hub", font=("Segoe UI", 22, "bold")).pack(anchor="w")
        ttk.Label(root, text="Cross-repository application inventory and staged Python migration tracker.").pack(anchor="w", pady=(2, 12))
        controls = ttk.Frame(root); controls.pack(fill="x", pady=(0, 10))
        self.query = tk.StringVar()
        ttk.Entry(controls, textvariable=self.query).pack(side="left", fill="x", expand=True)
        self.query.trace_add("write", lambda *_: self.refresh())
        self.status = tk.StringVar(value="All migration statuses")
        combo = ttk.Combobox(controls, state="readonly", textvariable=self.status,
            values=["All migration statuses", "Python present", "Mixed / partial port", "Port candidate"])
        combo.pack(side="left", padx=(8, 0)); combo.bind("<<ComboboxSelected>>", lambda e: self.refresh())
        columns = ("name", "areas", "status", "languages", "files")
        self.table = ttk.Treeview(root, columns=columns, show="headings", selectmode="browse")
        for col, title, width in [
            ("name", "Repository", 180), ("areas", "Application areas", 340),
            ("status", "Python status", 150), ("languages", "Languages", 220), ("files", "Files", 75)
        ]:
            self.table.heading(col, text=title)
            self.table.column(col, width=width, anchor="w")
        self.table.pack(fill="both", expand=True)
        self.table.bind("<Double-1>", lambda e: self.open_selected())
        buttons = ttk.Frame(root); buttons.pack(fill="x", pady=(10, 0))
        ttk.Button(buttons, text="Open selected source", command=self.open_selected).pack(side="left")
        ttk.Button(buttons, text="Open Python web hub", command=lambda: webbrowser.open("https://amerhwitat.github.io/apps/python-app-hub/")).pack(side="left", padx=8)
        ttk.Button(buttons, text="Open Super Flash & ISO Tool info", command=lambda: webbrowser.open("https://amerhwitat.github.io/apps/python-app-hub/super-flash-iso/")).pack(side="left")
        self.footer = ttk.Label(root, text="")
        self.footer.pack(anchor="w", pady=(8, 0))

    def refresh(self):
        query = self.query.get().strip().lower()
        status = self.status.get()
        self.table.delete(*self.table.get_children())
        count = 0
        status_map = {"Python present": "existing", "Mixed / partial port": "partial", "Port candidate": "planned"}
        for repo in self.repositories:
            searchable = " ".join([repo.get("name", ""), repo.get("detail", ""),
                " ".join(repo.get("areas", [])), " ".join(repo.get("languages", []))]).lower()
            if query and query not in searchable:
                continue
            if status in status_map and repo.get("python") != status_map[status]:
                continue
            self.table.insert("", "end", iid=repo.get("id", repo.get("name", str(count))),
                values=(repo.get("name", ""), "; ".join(repo.get("areas", [])),
                {"existing": "Python present", "partial": "Mixed / partial port", "planned": "Port candidate"}.get(repo.get("python"), "Unknown"),
                ", ".join(repo.get("languages", [])), repo.get("files", 0)))
            count += 1
        self.footer.configure(text=f"{count} repositories shown · {len(self.repositories)} in inventory · double-click a row to open source")

    def open_selected(self):
        selected = self.table.selection()
        if not selected:
            return
        name = self.table.item(selected[0], "values")[0]
        repo = next((r for r in self.repositories if r.get("name") == name), None)
        if repo and repo.get("url"):
            webbrowser.open(repo["url"])

if __name__ == "__main__":
    PythonApplicationHub().mainloop()
