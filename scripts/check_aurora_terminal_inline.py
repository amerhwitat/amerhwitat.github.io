#!/usr/bin/env python3
from html.parser import HTMLParser
from pathlib import Path
import subprocess
import tempfile

ROOT=Path(__file__).resolve().parents[1]
PAGES=[
    ROOT/"apps/chimera-ii-os/web/aurora_terminal.html",
    ROOT/"apps/chimera-ii-os/web/aurora-terminal-shell.html",
]
class Scripts(HTMLParser):
    def __init__(self):
        super().__init__();self.current=None;self.items=[]
    def handle_starttag(self,tag,attrs):
        if tag.lower()=="script":
            attrs=dict(attrs)
            self.current=[] if "src" not in attrs else None
    def handle_data(self,data):
        if self.current is not None:self.current.append(data)
    def handle_endtag(self,tag):
        if tag.lower()=="script" and self.current is not None:
            self.items.append("".join(self.current));self.current=None

def main():
    checked=0
    with tempfile.TemporaryDirectory() as temp:
        for page in PAGES:
            parser=Scripts();parser.feed(page.read_text(encoding="utf-8"))
            for index,source in enumerate(parser.items):
                target=Path(temp)/f"inline-{checked}.js"
                target.write_text(source,encoding="utf-8")
                subprocess.run(["node","--check",str(target)],check=True)
                checked+=1
    if checked==0:raise SystemExit("No inline terminal scripts were checked")
    print(f"Validated {checked} inline terminal script(s).")
if __name__=="__main__":main()
