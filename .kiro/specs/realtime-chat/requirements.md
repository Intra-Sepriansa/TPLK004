# Requirements Document

## Introduction

Fitur Real-time Chat adalah sistem komunikasi terintegrasi yang memungkinkan mahasiswa dan dosen untuk berkomunikasi secara langsung dalam konteks akademik. Sistem ini mendukung chat personal (1-on-1), grup chat per mata kuliah, pengiriman file/attachment, notifikasi real-time, dan fitur-fitur advanced seperti reply, forward, dan message reactions.

## Glossary

- **Chat_System**: Sistem utama yang mengelola semua fungsi chat
- **Message**: Entitas pesan yang dikirim antar pengguna
- **Conversation**: Thread percakapan antara dua atau lebih pengguna
- **Participant**: Pengguna yang terlibat dalam conversation (mahasiswa atau dosen)
- **Attachment**: File yang dilampirkan pada pesan (gambar, dokumen, dll)
- **Message_Status**: Status pengiriman pesan (sent, delivered, read)
- **Typing_Indicator**: Indikator yang menunjukkan pengguna sedang mengetik
- **Online_Status**: Status kehadiran pengguna (online, offline, away)

## Requirements

### Requirement 1: Personal Chat (1-on-1)

**User Story:** As a mahasiswa or dosen, I want to send private messages to another user, so that I can communicate directly about academic matters.

#### Acceptance Criteria

1. WHEN a user initiates a new conversation, THE Chat_System SHALL create a unique conversation thread between the two participants
2. WHEN a user sends a message, THE Chat_System SHALL deliver the message to the recipient in real-time
3. WHEN a message is sent, THE Chat_System SHALL display the message status (sent, delivered, read)
4. WHEN a user is typing, THE Chat_System SHALL show a typing indicator to the other participant
5. WHEN a user views a conversation, THE Chat_System SHALL mark unread messages as read
6. WHEN a user searches for contacts, THE Chat_System SHALL return matching users (mahasiswa or dosen) based on name or identifier

### Requirement 2: Group Chat per Mata Kuliah

**User Story:** As a dosen, I want to create group chats for my courses, so that I can communicate with all enrolled students at once.

#### Acceptance Criteria

1. WHEN a dosen creates a course group chat, THE Chat_System SHALL automatically add all enrolled mahasiswa as participants
2. WHEN a new mahasiswa enrolls in a course, THE Chat_System SHALL automatically add them to the course group chat
3. WHEN a mahasiswa drops a course, THE Chat_System SHALL remove them from the course group chat
4. WHEN a message is sent to a group, THE Chat_System SHALL deliver it to all participants
5. WHEN viewing a group chat, THE Chat_System SHALL display the participant list and count
6. THE Chat_System SHALL allow only dosen to manage group settings (name, description, mute participants)

### Requirement 3: Message Features

**User Story:** As a user, I want to reply to, forward, and react to messages, so that I can have more interactive conversations.

#### Acceptance Criteria

1. WHEN a user replies to a message, THE Chat_System SHALL display the original message as a quote above the reply
2. WHEN a user forwards a message, THE Chat_System SHALL allow selecting one or more conversations as destinations
3. WHEN a user reacts to a message, THE Chat_System SHALL display the reaction emoji on the message
4. WHEN a user deletes a message, THE Chat_System SHALL mark it as deleted and display "Pesan telah dihapus"
5. WHEN a user edits a message within 15 minutes, THE Chat_System SHALL update the message and mark it as edited
6. WHEN a user long-presses a message, THE Chat_System SHALL show a context menu with available actions

### Requirement 4: File Attachments

**User Story:** As a user, I want to send files and images in chat, so that I can share academic materials easily.

#### Acceptance Criteria

1. WHEN a user attaches a file, THE Chat_System SHALL validate the file type (images, PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX)
2. WHEN a user attaches a file, THE Chat_System SHALL validate the file size (max 10MB per file)
3. WHEN an image is attached, THE Chat_System SHALL display a thumbnail preview in the chat
4. WHEN a document is attached, THE Chat_System SHALL display the file name, type icon, and size
5. WHEN a user clicks on an attachment, THE Chat_System SHALL allow downloading or previewing the file
6. IF a file upload fails, THEN THE Chat_System SHALL display an error message and allow retry

### Requirement 5: Real-time Notifications

**User Story:** As a user, I want to receive notifications for new messages, so that I don't miss important communications.

#### Acceptance Criteria

1. WHEN a new message arrives, THE Chat_System SHALL display a push notification (if enabled)
2. WHEN a new message arrives, THE Chat_System SHALL update the unread count badge
3. WHEN a user is mentioned in a group chat (@username), THE Chat_System SHALL send a priority notification
4. WHEN a user mutes a conversation, THE Chat_System SHALL suppress notifications for that conversation
5. WHEN a user is offline, THE Chat_System SHALL queue notifications and deliver when online
6. THE Chat_System SHALL allow users to configure notification preferences (sound, vibration, preview)

### Requirement 6: Online Presence

**User Story:** As a user, I want to see who is online, so that I know when to expect quick responses.

#### Acceptance Criteria

1. WHEN a user opens the app, THE Chat_System SHALL update their status to online
2. WHEN a user closes the app or is inactive for 5 minutes, THE Chat_System SHALL update their status to offline
3. WHEN viewing a conversation, THE Chat_System SHALL display the other user's online status
4. WHEN viewing a contact list, THE Chat_System SHALL show online indicators for each user
5. THE Chat_System SHALL display "Last seen" timestamp for offline users
6. THE Chat_System SHALL allow users to hide their online status (privacy setting)

### Requirement 7: Message Search

**User Story:** As a user, I want to search through my chat history, so that I can find specific information quickly.

#### Acceptance Criteria

1. WHEN a user searches globally, THE Chat_System SHALL search across all conversations
2. WHEN a user searches within a conversation, THE Chat_System SHALL search only that conversation
3. WHEN displaying search results, THE Chat_System SHALL highlight matching text
4. WHEN a user clicks a search result, THE Chat_System SHALL navigate to that message in context
5. THE Chat_System SHALL support searching by date range
6. THE Chat_System SHALL support searching by message type (text, image, file)

### Requirement 8: Message Persistence and Sync

**User Story:** As a user, I want my messages to be saved and synced, so that I can access them from any device.

#### Acceptance Criteria

1. WHEN a message is sent, THE Chat_System SHALL persist it to the database immediately
2. WHEN a user logs in from a new device, THE Chat_System SHALL sync all conversation history
3. WHEN a user deletes a message, THE Chat_System SHALL soft-delete it (retain for admin audit)
4. THE Chat_System SHALL retain messages for at least 1 academic year
5. WHEN network connection is lost, THE Chat_System SHALL queue messages and send when reconnected
6. FOR ALL valid Message objects, serializing then deserializing SHALL produce an equivalent object (round-trip property)

### Requirement 9: Security and Privacy

**User Story:** As a user, I want my conversations to be secure and private, so that sensitive academic information is protected.

#### Acceptance Criteria

1. THE Chat_System SHALL encrypt messages in transit using TLS
2. THE Chat_System SHALL require authentication for all chat operations
3. WHEN a user blocks another user, THE Chat_System SHALL prevent message delivery between them
4. THE Chat_System SHALL log all message activities for audit purposes
5. THE Chat_System SHALL allow admin to moderate and review reported messages
6. IF a user reports a message, THEN THE Chat_System SHALL flag it for admin review

### Requirement 10: UI/UX Requirements

**User Story:** As a user, I want a modern and intuitive chat interface, so that I can communicate efficiently.

#### Acceptance Criteria

1. THE Chat_System SHALL display conversations in a list sorted by most recent activity
2. THE Chat_System SHALL support dark mode and light mode themes
3. THE Chat_System SHALL display message timestamps in relative format (e.g., "5 menit lalu")
4. THE Chat_System SHALL group messages by date with date separators
5. THE Chat_System SHALL support infinite scroll for loading older messages
6. THE Chat_System SHALL provide visual feedback for all user actions (loading states, success, error)
