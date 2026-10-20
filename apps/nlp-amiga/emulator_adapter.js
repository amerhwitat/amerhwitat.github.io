/* Adapter for the locally vendored SAE browser engine. */
(function(){
  const CORE=['prototypes.js','utils.js','dms.js','config.js','roms.js','memory.js','autoconf.js','expansion.js','events.js','gayle.js','ide.js','filesys.js','hardfile.js','dongle.js','input.js','serpar.js','custom.js','blitter.js','copper.js','playfield.js','video.js','audio.js','cia.js','disk.js','rtc.js','m68k.js','cpu.js','amiga.js'];
  const A=window.ChimeraAmiga={
    engine:null,cfg:null,running:false,files:{},
    log(m){const e=document.getElementById('log');if(e){e.textContent+=`[${new Date().toLocaleTimeString()}] ${m}\n`;e.scrollTop=e.scrollHeight;}},
    loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error(src));document.head.appendChild(s);});},
    async load(){try{for(const f of CORE)await this.loadScript('vendor/sae/sae/'+f);if(typeof window.ScriptedAmigaEmulator!=='function')throw new Error('ScriptedAmigaEmulator constructor unavailable');this.engine=new window.ScriptedAmigaEmulator();this.cfg=this.engine.getConfig();this.cfg.video.id='screenHost';this.cfg.video.enabled=true;this.log('Local SAE core loaded and configuration initialized.');return true;}catch(e){this.log('Local SAE core unavailable ('+e.message+'); external vAmigaWeb fallback only.');return false;}},
    readFile(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsBinaryString(file);});},
    async start(){
      if(!this.engine||!this.cfg){
        this.log('Opening vAmigaWeb externally. This page cannot inspect or certify the external emulator runtime.');
        const opened=window.open('https://vamigaweb.github.io/','_blank');
        if(opened){try{opened.opener=null;}catch(_){/* Cross-origin navigation may already have begun. */}return {kind:'fallback-opened'};}
        return {kind:'popup-blocked'};
      }
      try{
        const model=document.getElementById('model').value;
        if(this.cfg.model)this.cfg.model=model;
        if(this.cfg.chipset)this.cfg.chipset.ntsc=document.getElementById('video').value==='ntsc';
        if(!this.cfg.memory?.rom?.size){this.log('Select a Kickstart ROM before starting.');return {kind:'failed'};}
        const err=this.engine.start();
        if(typeof err!=='undefined'&&err!==0){this.log('SAE start error: '+err);return {kind:'failed'};}
        this.running=true;const placeholder=document.getElementById('placeholder');if(placeholder)placeholder.style.display='none';
        this.log('Local SAE emulator start requested successfully.');return {kind:'local'};
      }catch(e){this.log('Engine start error: '+e.message);return {kind:'failed'};}
    },
    pause(){if(!this.engine||!this.running){this.log('Pause unavailable: no running local SAE runtime.');return false;}if(typeof this.engine.pause!=='function'){this.log('Pause unsupported by the loaded SAE adapter.');return false;}this.engine.pause();this.running=false;this.log('Local SAE paused.');return true;},
    reset(){if(!this.engine){this.log('Reset unavailable: no local SAE runtime.');return false;}if(typeof this.engine.reset!=='function'){this.log('Reset unsupported by the loaded SAE adapter.');return false;}this.engine.reset();this.running=false;this.log('Local SAE reset requested.');return true;},
    async file(name,file){this.files[name]=file;this.log(`${name}: ${file.name} (${file.size} bytes) selected.`);if(!this.cfg){this.log('Selected file is not passed to the external vAmigaWeb tab; open that site and select the file there.');return;}const data=await this.readFile(file);if(name==='ROM'){this.cfg.memory.rom.name=file.name;this.cfg.memory.rom.data=data;this.cfg.memory.rom.size=file.size;}if(name==='DF0'||name==='DF1'){const n=name==='DF0'?0:1;const f=this.cfg.floppy.drive[n].file;f.name=file.name;f.data=data;f.size=file.size;if(this.running&&this.engine.insert)this.engine.insert(n);}if(name==='HDF')this.log('HDF selected; hardfile mapping is not implemented in this adapter yet.');},
    fullscreen(){document.getElementById('screenHost')?.requestFullscreen?.()}
  };
})();
