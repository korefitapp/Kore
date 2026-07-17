const fs = require('fs');
const path = require('path');

const files = [
  path.resolve(process.cwd(), 'app/(dashboard)/dashboard/nutri/messages/_components/MessagesClient.tsx'),
  path.resolve(process.cwd(), 'app/(dashboard)/dashboard/personal/messages/_components/MessagesClient.tsx')
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log(`Skipping ${file}`);
    continue;
  }

  let content = fs.readFileSync(file, 'utf-8');

  // Replace realtime subscription
  content = content.replace(
    /channel\("realtime:messages"\)[\s\S]*?\}\s*\)\s*\.subscribe\(\);/,
    `channel("realtime:chat_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          
          setLocalMessages((prev) => {
            if (selectedContactId === newMsg.contact_id && !prev.some(m => m.id === newMsg.id)) {
              return [...prev, newMsg];
            }
            return prev;
          });

          if (selectedContactId === newMsg.contact_id && !newMsg.is_from_me) {
            markMessagesAsRead(newMsg.contact_id);
          }

          setContacts(prev => prev.map(c => {
            if (c.id === newMsg.contact_id) {
              return {
                ...c,
                lastMessage: newMsg.text,
                lastMessageTime: newMsg.created_at,
                unreadCount: (!newMsg.is_from_me && selectedContactId !== newMsg.contact_id && newMsg.status !== "read") 
                  ? c.unreadCount + 1 : c.unreadCount
              };
            }
            return c;
          }));
        }
      )
      .subscribe();`
  );

  // Replace handleSendMessage tempMsg
  content = content.replace(
    /const tempMsg: ChatMessage = \{[\s\S]*?read_at: null,\s*\};/,
    `const tempMsg: ChatMessage = {
      id: \`local-\${Date.now()}\`,
      contact_id: selectedContactId,
      message_id: \`temp-\${Date.now()}\`,
      sender_id: currentUserId,
      text: textToSend,
      is_from_me: true,
      status: "sending",
      created_at: new Date().toISOString(),
    };`
  );

  // Replace msg.sender_id === currentUserId with msg.is_from_me
  content = content.replace(/msg\.sender_id === currentUserId/g, 'msg.is_from_me');

  // Replace msg.content with msg.text
  content = content.replace(/msg\.content/g, 'msg.text');

  fs.writeFileSync(file, content, 'utf-8');
  console.log(`Updated ${file}`);
}
