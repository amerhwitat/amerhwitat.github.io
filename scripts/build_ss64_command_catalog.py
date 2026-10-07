#!/usr/bin/env python3
"""Build a compact, recursively discovered SS64 command index for Aurora.

Only command names, URLs, platform metadata and short original Aurora metadata are stored.
SS64 page prose is not copied into the repository.
"""
import html.parser, json, re, urllib.parse, urllib.request
from collections import deque
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
URLS={
    "Linux":"https://ss64.com/bash/",
    "Windows CMD":"https://ss64.com/nt/",
    "PowerShell":"https://ss64.com/ps/",
    "macOS":"https://ss64.com/mac/",
}
# Explicit Arabic command vocabulary used by the Aurora shell. Unknown commands remain
# searchable with Arabic labels and can be handed to an authorized native backend.
ALIASES={
"ls":["قائمة","اعرض","عرض"],"dir":["قائمة","اعرض","عرض"],"cat":["اقرأ","قراءة","اعرض"],"type":["اقرأ","قراءة"],
"pwd":["مسار","موقعي"],"cd":["انتقل","دخول"],"mkdir":["أنشئ","مجلد"],"touch":["المس","انشئ"],
"cp":["انسخ","نسخ"],"copy":["انسخ","نسخ"],"mv":["انقل","نقل"],"move":["انقل","نقل"],"rm":["احذف","حذف"],
"del":["احذف","حذف"],"grep":["ابحث","بحث"],"find":["ابحث","اعثر"],"echo":["اطبع","اكتب"],"printf":["اطبع","اكتب"],
"clear":["نظف","امسح"],"cls":["نظف","امسح"],"date":["تاريخ","الوقت"],"time":["وقت","الساعة"],
"whoami":["من انا","المستخدم"],"hostname":["اسم الجهاز"],"uname":["معلومات النظام"],"df":["مساحة القرص"],
"du":["حجم الملفات"],"free":["الذاكرة"],"top":["مراقبة العمليات"],"htop":["مراقبة متقدمة"],"ps":["العمليات","العمليات الجارية"],
"jobs":["المهام"],"fg":["مقدمة"],"bg":["خلفية"],"env":["البيئة"],"export":["صدّر"],"alias":["اسم مستعار"],
"set":["اضبط"],"unset":["احذف المتغير"],"source":["حمّل","مصدر"],"bash":["باش"],"sh":["صدفة"],"zsh":["زدش"],
"cmd":["موجه الأوامر"],"powershell":["باورشِل"],"pwsh":["باورشِل"],"Get-Process":["العمليات"],
"Get-Service":["الخدمات"],"Get-Command":["الأوامر"],"Get-Help":["المساعدة"],"Get-ChildItem":["قائمة الملفات"],
"Get-Content":["اقرأ المحتوى"],"Set-Location":["غيّر المسار"],"Get-Location":["المسار الحالي"],
"Test-Connection":["اختبر الاتصال"],"Get-NetAdapter":["واجهات الشبكة"],"Get-NetIPAddress":["عناوين الشبكة"],
"Get-NetTCPConnection":["اتصالات TCP"],"Get-NetUDPEndpoint":["نقاط UDP"],"Resolve-DnsName":["حل DNS"],
"Get-Volume":["الأقراص"],"Get-Disk":["الأقراص الفيزيائية"],"Get-Partition":["الأقسام"],
"kill":["اقتل","انهاء"],"chmod":["صلاحيات","غيّر الصلاحيات"],"chown":["المالك","غيّر المالك"],
"tar":["أرشيف","اضغط"],"zip":["ضغط","أرشفة"],"unzip":["فك الضغط"],"ssh":["اتصال آمن"],"scp":["نسخ آمن"],
"curl":["اجلب","تحميل"],"wget":["اجلب","تحميل"],"ping":["اختبر الشبكة","بنغ"],"ip":["الشبكة","عنوان الشبكة"],
"ifconfig":["الشبكة","واجهات الشبكة"],"ipconfig":["الشبكة","إعداد الشبكة"],"systemctl":["الخدمات","النظام"],
"service":["خدمة"],"sudo":["صلاحيات المدير","كمسؤول"],"apt":["حزم","ثبّت"],"apt-get":["حزم","ثبّت"],
"pacman":["حزم","ثبّت"],"brew":["حزم","ثبّت"],"open":["افتح","فتح"],"start":["شغّل","تشغيل"],
"shutdown":["إيقاف","اطفئ"],"reboot":["أعد التشغيل","إعادة التشغيل"],"help":["مساعدة","ساعدني"],
"man":["دليل","توثيق"],"history":["السجل","التاريخ"],"exit":["خروج","اخرج"],"quit":["خروج"],"apropos":["ابحث في الدليل","بحث الدليل"],
"whatis":["ما هو","ماهذا"],
}
class Links(html.parser.HTMLParser):
    def __init__(self): super().__init__(); self.links=[]; self.in_a=False; self.href=""; self.text=""
    def handle_starttag(self,t,a):
        if t=="a":
            d=dict(a); self.in_a=True; self.href=d.get("href",""); self.text=""
    def handle_data(self,d):
        if self.in_a:self.text+=d
    def handle_endtag(self,t):
        if t=="a" and self.in_a:
            self.links.append((re.sub(r"\s+"," ",self.text).strip(),self.href))
            self.in_a=False

def fetch(url):
    req=urllib.request.Request(url,headers={"User-Agent":"Aurora-SS64-Indexer/2.0"})
    return urllib.request.urlopen(req,timeout=30).read().decode("utf-8","ignore")

def command_from_url(url,platform):
    p=urllib.parse.urlparse(url)
    path=p.path.rstrip("/").split("/")
    if not path:return ""
    leaf=path[-1]
    if leaf.lower() in {"index","syntax","commands","basic","run"}:return ""
    if leaf.endswith(".html"): leaf=leaf[:-5]
    leaf=urllib.parse.unquote(leaf)
    if not re.match(r"^[A-Za-z0-9_+.%#@$!?-]{1,80}$",leaf):return ""
    # Detail pages with a descriptive title are still useful command references.
    return leaf

def crawl(platform,start,max_depth=3,max_pages=2500):
    root=urllib.parse.urlparse(start)
    q=deque([(start,0)]); seen=set(); found={}
    while q and len(seen)<max_pages:
        url,depth=q.popleft()
        u=urllib.parse.urldefrag(urllib.parse.urljoin(start,url))[0]
        if u in seen:continue
        p=urllib.parse.urlparse(u)
        if p.netloc!=root.netloc or not p.path.startswith(root.path):continue
        seen.add(u)
        try: html=fetch(u)
        except Exception as e:
            print("WARN",platform,u,e); continue
        parser=Links(); parser.feed(html)
        for label,href in parser.links:
            target=urllib.parse.urljoin(u,href)
            tp=urllib.parse.urlparse(target)
            if tp.netloc!=root.netloc or not tp.path.startswith(root.path):continue
            cmd=command_from_url(target,platform)
            clean=re.sub(r"\s+"," ",label).strip()
            # A-Z indexes expose command labels; detail URLs provide recursive coverage.
            if clean and re.match(r"^[A-Za-z0-9_%+./:@#!?$-]+$",clean) and len(clean)<=100:
                found.setdefault(clean.lower(),(clean,target))
            if depth<max_depth:
                q.append((target,depth+1))
    return list(found.values()),len(seen)

items=[]; stats={}
for platform,start in URLS.items():
    rows,pages=crawl(platform,start)
    stats[platform]={"pages":pages,"links":len(rows)}
    for cmd,url in rows:
        aliases=ALIASES.get(cmd.lower(),[])
        if not aliases:
            aliases=ALIASES.get(cmd,[])
        items.append({
            "command":cmd,
            "platform":platform,
            "aliases":aliases,
            "arabic_label":("أمر "+cmd),
            "arabic_search":["أمر "+cmd,"تعليمة "+cmd,"نفذ "+cmd],
            "description":"SS64 command reference",
            "source":"SS64",
            "url":url,
            "browser_runnable":cmd.lower() in {"ls","dir","pwd","echo","printf","clear","cls","date","whoami","uname","ver","help","cat","type","touch","mkdir","rm","del","cp","copy","mv","move","basename","dirname","true","false"}
        })
# De-duplicate by platform+command while preserving deterministic order.
uniq={}
for x in items: uniq[(x["platform"],x["command"].lower())]=x
items=sorted(uniq.values(),key=lambda x:(x["platform"].lower(),x["command"].lower()))
out={
    "schema":"aurora-ss64-command-catalog/v2",
    "generated_from":list(URLS.values()),
    "recursive":True,
    "max_depth":3,
    "crawl_stats":stats,
    "commands":items,
}
path=ROOT/"apps/chimera-ii-os/web/ss64-command-catalog.json"
path.write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("Generated",len(items),"commands from recursive SS64 crawl")
print(json.dumps(stats,ensure_ascii=False))
