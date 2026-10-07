#!/usr/bin/env python3
import html.parser,json,re,urllib.parse,urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
URLS={"Linux":"https://ss64.com/bash/","Windows CMD":"https://ss64.com/nt/","PowerShell":"https://ss64.com/ps/","macOS":"https://ss64.com/mac/"}
ALIASES={"ls":["قائمة","اعرض","عرض"],"apropos":["ابحث في الدليل","بحث الدليل"],"whatis":["ما هو","ماهذا"],"exit":["خروج","اخرج"],"quit":["خروج"],"uname":["معلومات النظام"],"df":["مساحة القرص"],"du":["حجم الملفات"],"free":["الذاكرة"],"top":["مراقبة العمليات"],"htop":["مراقبة متقدمة"],"ps":["العمليات","العمليات الجارية"],"jobs":["المهام"],"fg":["مقدمة"],"bg":["خلفية"],"env":["البيئة"],"export":["صدّر"],"alias":["اسم مستعار"],"set":["اضبط"],"unset":["احذف المتغير"],"source":["حمّل","مصدر"],"bash":["باش"],"sh":["صدفة"],"zsh":["زدش"],"cmd":["موجه الأوامر"],"powershell":["باورشِل"],"pwsh":["باورشِل"],"Get-Process":["العمليات"],"Get-Service":["الخدمات"],"Get-Command":["الأوامر"],"Get-Help":["المساعدة"],"Get-ChildItem":["قائمة الملفات"],"Get-Content":["اقرأ المحتوى"],"Set-Location":["غيّر المسار"],"Get-Location":["المسار الحالي"],"Test-Connection":["اختبر الاتصال"],"Get-NetAdapter":["واجهات الشبكة"],"Get-NetIPAddress":["عناوين الشبكة"],"Get-NetTCPConnection":["اتصالات TCP"],"Get-NetUDPEndpoint":["نقاط UDP"],"Resolve-DnsName":["حل DNS"],"Get-Volume":["الأقراص"],"Get-Disk":["الأقراص الفيزيائية"],"Get-Partition":["الأقسام"],"Get-Service":["الخدمات"],"dir":["قائمة","اعرض","عرض"],"cat":["اقرأ","قراءة","اعرض"],"type":["اقرأ","قراءة"],"pwd":["مسار","موقعي"],"cd":["انتقل","دخول"],"mkdir":["أنشئ","مجلد"],"touch":["المس","انشئ"],"cp":["انسخ","نسخ"],"copy":["انسخ","نسخ"],"mv":["انقل","نقل"],"move":["انقل","نقل"],"rm":["احذف","حذف"],"del":["احذف","حذف"],"grep":["ابحث","بحث"],"find":["ابحث","اعثر"],"echo":["اطبع","اكتب"],"printf":["اطبع","اكتب"],"clear":["نظف","امسح"],"cls":["نظف","امسح"],"date":["تاريخ","الوقت"],"time":["وقت","الساعة"],"whoami":["من انا","المستخدم"],"hostname":["اسم الجهاز"],"ps":["العمليات","العمليات الجارية"],"kill":["اقتل","انهاء"],"chmod":["صلاحيات","غيّر الصلاحيات"],"chown":["المالك","غيّر المالك"],"tar":["أرشيف","اضغط"],"zip":["ضغط","أرشفة"],"unzip":["فك الضغط"],"ssh":["اتصال آمن"],"scp":["نسخ آمن"],"curl":["اجلب","تحميل"],"wget":["اجلب","تحميل"],"ping":["اختبر الشبكة","بنغ"],"ip":["الشبكة","عنوان الشبكة"],"ifconfig":["الشبكة","واجهات الشبكة"],"ipconfig":["الشبكة","إعداد الشبكة"],"systemctl":["الخدمات","النظام"],"service":["خدمة"],"sudo":["صلاحيات المدير","كمسؤول"],"apt":["حزم","ثبّت"],"apt-get":["حزم","ثبّت"],"pacman":["حزم","ثبّت"],"brew":["حزم","ثبّت"],"open":["افتح","فتح"],"start":["شغّل","تشغيل"],"shutdown":["إيقاف","اطفئ"],"reboot":["أعد التشغيل","إعادة التشغيل"],"help":["مساعدة","ساعدني"],"man":["دليل","توثيق"],"history":["السجل","التاريخ"],"exit":["خروج","اخرج"]}
class P(html.parser.HTMLParser):
 def __init__(self): super().__init__(); self.rows=[]; self.in_a=False; self.href=""; self.text=""
 def handle_starttag(self,t,a):
  if t=="a": d=dict(a); self.in_a=True; self.href=d.get("href",""); self.text=""
 def handle_data(self,d):
  if self.in_a:self.text+=d
 def handle_endtag(self,t):
  if t=="a" and self.in_a:
   s=re.sub(r"\s+"," ",self.text).strip()
   if s and re.match(r"^[A-Za-z0-9_%+./:-]+$",s) and not s.startswith(("http","www")): self.rows.append((s,self.href))
   self.in_a=False
def fetch(u):
 req=urllib.request.Request(u,headers={"User-Agent":"Aurora-SS64-Indexer/1.0"}); return urllib.request.urlopen(req,timeout=30).read().decode("utf-8","ignore")
items=[]
for platform,url in URLS.items():
 try: html=fetch(url)
 except Exception as e: print("WARN",platform,e); continue
 p=P();p.feed(html);seen=set()
 for cmd,href in p.rows:
  key=(platform,cmd.lower())
  if key in seen: continue
  seen.add(key)
  items.append({"command":cmd,"platform":platform,"aliases":ALIASES.get(cmd.lower(),[]),"description":"SS64 command reference","source":"SS64","url":urllib.parse.urljoin(url,href) if href else url,"browser_runnable":cmd.lower() in {"ls","dir","pwd","echo","printf","clear","cls","date","whoami","uname","ver","help","cat","type","touch","mkdir","rm","del","cp","copy","mv","move","basename","dirname","true","false"}})
Path(ROOT/"apps/chimera-ii-os/web/ss64-command-catalog.json").write_text(json.dumps({"schema":"aurora-ss64-command-catalog/v1","generated_from":list(URLS.values()),"commands":items},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("Generated",len(items),"commands")
