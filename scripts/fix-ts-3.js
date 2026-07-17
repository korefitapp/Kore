const fs = require('fs');

function fixShopMessages() {
  const path = 'app/(dashboard)/dashboard/shop/messages/_components/MessagesPageClient.tsx';
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/getInitials\(selectedContactId\)/g, 'getInitials(selectedContactId || "")');
  fs.writeFileSync(path, content, 'utf8');
}

function fixAdherenceActions() {
  const path = 'app/actions/adherence-actions.ts';
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/day: weekDays\[d\.getDay\(\)\]/g, 'day: weekDays[d.getDay()]!');
  content = content.replace(/day: weekDays\[new Date\(now\.getFullYear\(\), now\.getMonth\(\), now\.getDate\(\) - i\)\.getDay\(\)\]/g, 'day: weekDays[new Date(now.getFullYear(), now.getMonth(), now.getDate() - i).getDay()]!');
  fs.writeFileSync(path, content, 'utf8');
}

try { fixShopMessages(); } catch(e){}
try { fixAdherenceActions(); } catch(e){}
