#!/usr/bin/env python3
from pathlib import Path
import argparse,platform,shutil,subprocess,time
R=Path(__file__).resolve().parents[1]
def X(c,d=False):
 print(f'[{time.strftime("%H:%M:%S")}] [COMMAND] {" ".join(map(str,c))}',flush=True)
 if d:return 0
 p=subprocess.Popen(c,cwd=R,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True)
 for x in p.stdout:print(x.rstrip(),flush=True)
 return p.wait()
def main():
 a=argparse.ArgumentParser();a.add_argument('--dry-run',action='store_true');a.add_argument('--only',choices=['all','node','python','native','sql'],default='all');a=a.parse_args();print(f'[BUILD] {R.name} {platform.system()} {platform.machine()}')
 if a.only in ('all','node') and (R/'package.json').exists():
  pm='pnpm' if (R/'pnpm-lock.yaml').exists() and shutil.which('pnpm') else 'yarn' if (R/'yarn.lock').exists() and shutil.which('yarn') else 'npm'
  if shutil.which(pm):
   if X((['npm','ci'] if pm=='npm' and (R/'package-lock.json').exists() else [pm,'install']),a.dry_run) or X([pm,'run','build'],a.dry_run):return 1
  else:print('[SKIP] Node package manager missing')
 if a.only in ('all','python') and list(R.rglob('*.py')) and shutil.which('python'):
  p=next(p for p in R.rglob('*.py') if p.name!='__init__.py');
  if X(['python','-m','PyInstaller','--noconfirm','--clean',str(p)],a.dry_run):return 1
 if a.only in ('all','sql'):print(f'[DATABASE] {len(list(R.rglob("*.sql")))} SQL scripts discovered')
 print('[BUILD] DONE');return 0
if __name__=='__main__':raise SystemExit(main())
