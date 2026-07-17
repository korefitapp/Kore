const fs = require('fs');

function fixNutriMessages() {
  const path = 'app/(dashboard)/dashboard/nutri/messages/_components/MessagesClient.tsx';
  let content = fs.readFileSync(path, 'utf8');
  
  // Add formatDateSeparator if missing
  if (!content.includes('function formatDateSeparator')) {
    content = content.replace(
      /function isSameDay.*?}/s,
      `function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateSeparator(iso: string): string {
  if(!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  if (isSameDay(d, now)) return "Hoje";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d, yesterday)) return "Ontem";
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
}`
    );
  }
  
  content = content.replace(/newMsg\.read_at/g, 'newMsg.status === "read"');
  content = content.replace(/msg\.read_at/g, 'msg.status === "read"');
  fs.writeFileSync(path, content, 'utf8');
}

function fixPersonalMessages() {
  const path = 'app/(dashboard)/dashboard/personal/messages/_components/MessagesClient.tsx';
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/newMsg\.read_at/g, 'newMsg.status === "read"');
  content = content.replace(/msg\.read_at/g, 'msg.status === "read"');
  fs.writeFileSync(path, content, 'utf8');
}

function fixShopFinancial() {
  const path = 'app/(dashboard)/dashboard/shop/financial/_components/FinancialPageClient.tsx';
  let content = fs.readFileSync(path, 'utf8');
  // I already fixed the first one using multi_replace_file_content but maybe missed line 552
  content = content.replace(/getPayoutStatusConfig\(p\.status\)/g, 'getPayoutStatusConfig(p.status as any)');
  fs.writeFileSync(path, content, 'utf8');
}

function fixShopMessages() {
  const path = 'app/(dashboard)/dashboard/shop/messages/_components/MessagesPageClient.tsx';
  let content = fs.readFileSync(path, 'utf8');
  
  // Remove duplicates
  const dupRegex = /function isSameDay[\s\S]*?function formatDateSeparator[\s\S]*?function formatDateSeparator[\s\S]*?export function MessagesPageClient/s;
  if(dupRegex.test(content)) {
     // My previous script injected functions before export function MessagesPageClient.
     // I'll just strip the second occurrence or just rewrite the block.
     content = content.replace(/function isSameDay[\s\S]*?export function MessagesPageClient/, 
     `function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateSeparator(iso: string): string {
  if(!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  if (isSameDay(d, now)) return "Hoje";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d, yesterday)) return "Ontem";
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
}

export function MessagesPageClient`);
  }

  // Fix null string issues
  content = content.replace(/getInitials\(selectedContact\.full_name\)/g, 'getInitials(selectedContact.full_name || "")');
  content = content.replace(/contact\.phone/g, '(contact.phone || "")');
  content = content.replace(/selectedContact\.phone/g, '(selectedContact.phone || "")');
  content = content.replace(/newMsg\.read_at/g, 'newMsg.status === "read"');
  content = content.replace(/msg\.read_at/g, 'msg.status === "read"');
  content = content.replace(/inputValue/g, 'newMessage'); // inputValue -> newMessage
  
  fs.writeFileSync(path, content, 'utf8');
}

function fixAdherenceActions() {
  const path = 'app/actions/adherence-actions.ts';
  let content = fs.readFileSync(path, 'utf8');
  
  // The first array was fixed, now the other two
  content = content.replace(/day: weekDays\[d\.getDay\(\)\]/g, 'day: weekDays[d.getDay()]!');
  
  fs.writeFileSync(path, content, 'utf8');
}

try { fixNutriMessages(); } catch(e){}
try { fixPersonalMessages(); } catch(e){}
try { fixShopFinancial(); } catch(e){}
try { fixShopMessages(); } catch(e){}
try { fixAdherenceActions(); } catch(e){}

