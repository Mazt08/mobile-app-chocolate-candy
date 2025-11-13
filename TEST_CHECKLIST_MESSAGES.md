# Messaging Feature Manual Test Checklist

## Preparation

- Ensure backend running: `npm run dev` inside `backend`.
- Ensure frontend running: `npm start` inside `chocolate-candy`.
- Have at least two accounts: one `admin`, one normal `user`.

## 1. Conversation Creation (User)

- Log in as user.
- Navigate to `Contact Us`.
- Submit subject + initial message.
- Expect: success toast / navigation (if implemented) and new conversation appears under `Messages` list.
- Admin side should receive realtime update (new conversation visible without manual refresh).

## 2. User Reply

- Open the conversation as user.
- Enter a text reply and send.
- Verify: message appears appended; admin inbox increments unread badge.

## 3. Admin Reply

- Log in (or switch) to admin.
- Open conversation from `Admin > Messages`.
- Reply with text.
- Verify: appears for admin; user side gets unread increment + realtime update.

## 4. Image Upload (User)

- User opens a conversation.
- Attach an image (png/jpg/webp <= 5MB) using file input.
- Optionally include text; send.
- Verify: image renders inline (thumbnail) in both user and admin views.
- Check underlying `<img src>` uses `/uploads/...` path or full URL.

## 5. Image Upload (Admin)

- Admin attaches image and sends.
- Verify same display client-side and user sees it after realtime refresh.

## 6. Mixed Message (image only)

- Send a message with only an image (no text) from both roles.
- Verify accepted and displayed.

## 7. Unread Counters

- With user logged out, counters hidden.
- User logs in: `/messages` badge shows 0 or current unread total.
- Admin side: `/admin/messages` badge aggregates admin_unread.
- Open a conversation -> unread for that side resets (badge totals adjust).
- Confirm realtime updates reduce badge without page reload.

## 8. Status Change (Admin)

- Admin toggles status to `closed` then to `open`.
- Verify: status persists; user gets realtime `conversation:status` update if listening.

## 9. Deletion (User)

- User deletes a conversation.
- Verify: removed from user list; admin receives realtime `conversation:deletedByUser` event (if surfaced) and sees user deletion flag/hard delete after admin also deletes.

## 10. Deletion (Admin)

- Admin deletes same conversation.
- Verify: conversation fully removed (hard delete when both sides deleted) and disappears from both lists.

## 11. Socket Reconnect

- Refresh user page mid-conversation: socket reconnects; events still arrive.
- Simulate network toggle (offline/online) if possible: messages continue after restore.

## 12. Validation & Edge Cases

- Attempt to send oversized image (>5MB) -> expect error alert.
- Attempt to send unsupported file type (e.g., PDF) -> expect rejection.
- Attempt to send blank message with no image -> send button disabled.
- Rapid consecutive sends: ensure no duplication or race condition.

## 13. Security

- Verify direct GET to `/uploads/<filename>` returns image only; no directory listing.
- Check that user cannot access another user's conversation by changing id in URL (should 404 / Forbidden).
- Confirm admin can access any conversation (expected behavior) but user cannot access admin endpoints.

## 14. Data Consistency

- Refresh both user and admin pages after several messages: order and counts preserved.
- Inspect database tables (conversations/messages) for correct `user_unread` / `admin_unread` values and `image_url` entries.

## 15. Points Regression

- Place an order to confirm existing points/offer logic still works (no interference from messaging changes).

## Post-Test

- Collect sample uploaded images; optionally prune `backend/uploads` for cleanup.
- Record any anomalies with timestamp and console log excerpts.

---

Use this checklist before release to validate core messaging functionality and attachments.
