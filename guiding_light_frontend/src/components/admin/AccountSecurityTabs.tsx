import React, { useState } from 'react';
import AccountActivityLog from './AccountActivityLog';
import LoginSecurityLog from './LoginSecurityLog';

/** Both tabs remain behind the existing Admin-only AccountHistory route. */
export default function AccountSecurityTabs() {
  const [tab, setTab] = useState<'accounts' | 'login'>('accounts');
  return (
    <div className="space-y-6">
      <div role="tablist" aria-label="Administrative audit records" className="flex flex-wrap gap-3">
        <button type="button" role="tab" aria-selected={tab === 'accounts'}
          onClick={() => setTab('accounts')}
          className={`px-5 py-3 rounded-xl text-sm font-semibold transition-colors ${
            tab === 'accounts' ? 'bg-[#3a4740] text-white' : 'bg-white text-stone-600 border border-stone-200'
          }`}>Account Changes</button>
        <button type="button" role="tab" aria-selected={tab === 'login'}
          onClick={() => setTab('login')}
          className={`px-5 py-3 rounded-xl text-sm font-semibold transition-colors ${
            tab === 'login' ? 'bg-[#3a4740] text-white' : 'bg-white text-stone-600 border border-stone-200'
          }`}>Login Security</button>
      </div>
      {tab === 'accounts' ? <AccountActivityLog /> : <LoginSecurityLog />}
    </div>
  );
}
