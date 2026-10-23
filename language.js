/* Three-language selector. The site content begins in Kazakh; Russian and English use Google Translate.
   Translation requires internet and should be checked for technical accuracy. */
(function(){
  const storageKey='serverlab-ai-language-v1';
  const supported=['kk','ru','en'];
  const labels={kk:'Қазақша',ru:'Русский',en:'English'};
  function setActive(lang){document.querySelectorAll('[data-site-language]').forEach(button=>{const active=button.dataset.siteLanguage===lang;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});}
  function applyTranslate(lang,attempt=0){
    if(!supported.includes(lang))return;
    localStorage.setItem(storageKey,lang);setActive(lang);
    if(lang==='kk'){
      // Restore the source language after Google Translate has modified the document.
      const wasTranslated=Boolean(document.querySelector('html.translated-ltr,html.translated-rtl')||document.cookie.includes('googtrans=/kk/ru')||document.cookie.includes('googtrans=/kk/en'));
      document.cookie='googtrans=; Max-Age=0; path=/';
      document.cookie=`googtrans=; Max-Age=0; path=/; domain=${location.hostname}`;
      const combo=document.querySelector('#google_translate_element select.goog-te-combo');
      if(combo){combo.value='';combo.dispatchEvent(new Event('change',{bubbles:true}));}
      if(wasTranslated && attempt===0)location.reload();
      return;
    }
    const combo=document.querySelector('#google_translate_element select.goog-te-combo');
    if(combo){combo.value=lang;combo.dispatchEvent(new Event('change',{bubbles:true}));return;}
    if(attempt<30)setTimeout(()=>applyTranslate(lang,attempt+1),250);
  }
  window.googleTranslateElementInit=function(){
    if(!window.google||!google.translate||!document.getElementById('google_translate_element'))return;
    new google.translate.TranslateElement({pageLanguage:'kk',includedLanguages:'kk,ru,en',autoDisplay:false,layout:google.translate.TranslateElement.InlineLayout.SIMPLE},'google_translate_element');
    const stored=localStorage.getItem(storageKey)||'kk';setActive(stored);
    if(stored!=='kk')applyTranslate(stored,0);
  };
  document.addEventListener('click',event=>{const button=event.target.closest('[data-site-language]');if(!button)return;const lang=button.dataset.siteLanguage;if(!supported.includes(lang))return;applyTranslate(lang,0);});
  document.addEventListener('DOMContentLoaded',()=>setActive(localStorage.getItem(storageKey)||'kk'));
  window.ServerLabLanguage={set:applyTranslate,get:()=>localStorage.getItem(storageKey)||'kk',labels};
})();
