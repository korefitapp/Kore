const fs = require('fs');

function patchFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  // Insert selectedContact if missing
  if (!content.includes('const selectedContact =')) {
    content = content.replace(
      /const \[isSending, setIsSending\] = useState\(false\);/,
      `const [isSending, setIsSending] = useState(false);\n  const selectedContact = contacts.find((c) => c.id === selectedContactId);`
    );
  }

  // Remove profiles from dependency array if present
  content = content.replace(
    /newMessage, selectedContactId, currentUserId, profiles, isSending/g,
    'newMessage, selectedContactId, currentUserId, contacts, isSending'
  );

  // Fix read_at
  content = content.replace(/newMsg\.read_at/g, 'newMsg.status === "read"');

  fs.writeFileSync(filepath, content, 'utf8');
}

patchFile('app/(dashboard)/dashboard/nutri/messages/_components/MessagesClient.tsx');
patchFile('app/(dashboard)/dashboard/personal/messages/_components/MessagesClient.tsx');
