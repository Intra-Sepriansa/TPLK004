# Design Document: Real-time Chat System

## Overview

Sistem Real-time Chat untuk TPLK004 adalah fitur komunikasi terintegrasi yang memungkinkan mahasiswa dan dosen berkomunikasi secara langsung. Sistem ini dibangun menggunakan Laravel dengan Inertia.js + React untuk frontend, dan Laravel Reverb untuk real-time WebSocket communication.

### Key Design Decisions

1. **Real-time Technology**: Laravel Reverb (native Laravel WebSocket server) untuk real-time messaging
2. **Database**: MySQL dengan optimized indexes untuk chat queries
3. **File Storage**: Laravel Storage dengan disk `public` untuk attachments
4. **Frontend State**: React state management dengan Inertia.js
5. **Polymorphic Users**: Support untuk User (dosen) dan Mahasiswa sebagai participants

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ ChatList    │  │ ChatWindow  │  │ MessageComposer         │  │
│  │ Component   │  │ Component   │  │ Component               │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                           │                                      │
│                    Laravel Echo (WebSocket Client)               │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                    WebSocket Connection
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                    Laravel Reverb                                │
│                  (WebSocket Server)                              │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                    Laravel Backend                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ ChatController│ │ MessageController│ │ Broadcasting Events │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                           │                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Eloquent Models                           ││
│  │  Conversation │ Message │ Participant │ Attachment │ Reaction││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │    MySQL      │
                    │   Database    │
                    └───────────────┘
```

## Components and Interfaces

### Backend Components

#### 1. Models

```php
// Conversation Model
class Conversation extends Model
{
    protected $fillable = ['type', 'name', 'description', 'course_id', 'created_by_type', 'created_by_id'];
    
    // type: 'personal' | 'group'
    // Relationships: participants(), messages(), course()
}

// Message Model  
class Message extends Model
{
    protected $fillable = ['conversation_id', 'sender_type', 'sender_id', 'content', 'type', 'reply_to_id', 'forwarded_from_id', 'edited_at', 'deleted_at'];
    
    // type: 'text' | 'image' | 'file' | 'system'
    // Relationships: conversation(), sender(), attachments(), reactions(), replyTo()
}

// ConversationParticipant Model
class ConversationParticipant extends Model
{
    protected $fillable = ['conversation_id', 'participant_type', 'participant_id', 'role', 'joined_at', 'last_read_at', 'is_muted', 'is_blocked'];
    
    // role: 'admin' | 'member'
    // participant_type: 'App\Models\User' | 'App\Models\Mahasiswa'
}

// MessageAttachment Model
class MessageAttachment extends Model
{
    protected $fillable = ['message_id', 'file_name', 'file_path', 'file_type', 'file_size', 'mime_type'];
}

// MessageReaction Model
class MessageReaction extends Model
{
    protected $fillable = ['message_id', 'reactor_type', 'reactor_id', 'emoji'];
}
```

#### 2. Controllers

```php
// ChatController - Manages conversations
class ChatController extends Controller
{
    public function index();           // List all conversations
    public function show($id);         // Get conversation with messages
    public function store(Request);    // Create new conversation
    public function createGroupForCourse($courseId); // Auto-create course group
}

// MessageController - Manages messages
class MessageController extends Controller
{
    public function store(Request);    // Send message
    public function update($id);       // Edit message
    public function destroy($id);      // Delete message
    public function markAsRead($conversationId); // Mark messages as read
}

// AttachmentController - Manages file uploads
class AttachmentController extends Controller
{
    public function store(Request);    // Upload attachment
    public function download($id);     // Download attachment
}
```

#### 3. Broadcasting Events

```php
// NewMessageEvent - Broadcast when new message sent
class NewMessageEvent implements ShouldBroadcast
{
    public $message;
    public function broadcastOn() { return new PrivateChannel('conversation.'.$this->message->conversation_id); }
}

// MessageReadEvent - Broadcast when messages read
class MessageReadEvent implements ShouldBroadcast
{
    public $conversationId, $userId, $readAt;
}

// TypingEvent - Broadcast typing indicator
class TypingEvent implements ShouldBroadcast
{
    public $conversationId, $userId, $userName, $isTyping;
}

// UserOnlineEvent - Broadcast online status
class UserOnlineEvent implements ShouldBroadcast
{
    public $userId, $userType, $isOnline, $lastSeen;
}
```

### Frontend Components

#### 1. ChatLayout Component
```typescript
// Main layout with sidebar and chat area
interface ChatLayoutProps {
    conversations: Conversation[];
    activeConversation?: Conversation;
    currentUser: User | Mahasiswa;
}
```

#### 2. ConversationList Component
```typescript
// List of conversations with search
interface ConversationListProps {
    conversations: Conversation[];
    activeId?: number;
    onSelect: (id: number) => void;
    onSearch: (query: string) => void;
}
```

#### 3. ChatWindow Component
```typescript
// Main chat area with messages
interface ChatWindowProps {
    conversation: Conversation;
    messages: Message[];
    currentUser: User | Mahasiswa;
    onSendMessage: (content: string, attachments?: File[]) => void;
    onLoadMore: () => void;
}
```

#### 4. MessageBubble Component
```typescript
// Individual message display
interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
    onReply: () => void;
    onReact: (emoji: string) => void;
    onDelete: () => void;
    onEdit: () => void;
    onForward: () => void;
}
```

#### 5. MessageComposer Component
```typescript
// Message input with attachments
interface MessageComposerProps {
    onSend: (content: string, attachments?: File[]) => void;
    replyTo?: Message;
    onCancelReply: () => void;
    disabled?: boolean;
}
```

## Data Models

### Database Schema

```sql
-- conversations table
CREATE TABLE conversations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('personal', 'group') NOT NULL,
    name VARCHAR(255) NULL,
    description TEXT NULL,
    course_id BIGINT NULL REFERENCES courses(id),
    created_by_type VARCHAR(255) NOT NULL,
    created_by_id BIGINT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_course (course_id)
);

-- conversation_participants table
CREATE TABLE conversation_participants (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id),
    participant_type VARCHAR(255) NOT NULL,
    participant_id BIGINT NOT NULL,
    role ENUM('admin', 'member') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP NULL,
    is_muted BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE KEY unique_participant (conversation_id, participant_type, participant_id),
    INDEX idx_participant (participant_type, participant_id)
);

-- messages table
CREATE TABLE messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id),
    sender_type VARCHAR(255) NOT NULL,
    sender_id BIGINT NOT NULL,
    content TEXT NULL,
    type ENUM('text', 'image', 'file', 'system') DEFAULT 'text',
    reply_to_id BIGINT NULL REFERENCES messages(id),
    forwarded_from_id BIGINT NULL REFERENCES messages(id),
    edited_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX idx_conversation (conversation_id),
    INDEX idx_sender (sender_type, sender_id),
    INDEX idx_created (created_at),
    FULLTEXT INDEX idx_content (content)
);

-- message_attachments table
CREATE TABLE message_attachments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    message_id BIGINT NOT NULL REFERENCES messages(id),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX idx_message (message_id)
);

-- message_reactions table
CREATE TABLE message_reactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    message_id BIGINT NOT NULL REFERENCES messages(id),
    reactor_type VARCHAR(255) NOT NULL,
    reactor_id BIGINT NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMP,
    UNIQUE KEY unique_reaction (message_id, reactor_type, reactor_id, emoji),
    INDEX idx_message (message_id)
);

-- user_online_status table
CREATE TABLE user_online_status (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_type VARCHAR(255) NOT NULL,
    user_id BIGINT NOT NULL,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen_at TIMESTAMP NULL,
    updated_at TIMESTAMP,
    UNIQUE KEY unique_user (user_type, user_id)
);
```

### TypeScript Interfaces

```typescript
interface Conversation {
    id: number;
    type: 'personal' | 'group';
    name: string | null;
    description: string | null;
    course_id: number | null;
    course?: Course;
    participants: Participant[];
    last_message?: Message;
    unread_count: number;
    created_at: string;
    updated_at: string;
}

interface Message {
    id: number;
    conversation_id: number;
    sender_type: string;
    sender_id: number;
    sender?: User | Mahasiswa;
    content: string | null;
    type: 'text' | 'image' | 'file' | 'system';
    reply_to_id: number | null;
    reply_to?: Message;
    forwarded_from_id: number | null;
    attachments: Attachment[];
    reactions: Reaction[];
    edited_at: string | null;
    deleted_at: string | null;
    created_at: string;
}

interface Participant {
    id: number;
    participant_type: string;
    participant_id: number;
    participant?: User | Mahasiswa;
    role: 'admin' | 'member';
    last_read_at: string | null;
    is_muted: boolean;
    is_online?: boolean;
}

interface Attachment {
    id: number;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: number;
    mime_type: string;
    url: string;
}

interface Reaction {
    id: number;
    emoji: string;
    reactor_type: string;
    reactor_id: number;
    reactor?: User | Mahasiswa;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Conversation Uniqueness for Personal Chats
*For any* two users (regardless of type), creating a personal conversation between them SHALL always return the same conversation ID, ensuring no duplicate personal chats exist.
**Validates: Requirements 1.1**

### Property 2: Message Read Status Consistency
*For any* conversation with unread messages, when a user views the conversation, all messages sent before the view timestamp SHALL be marked as read (last_read_at updated).
**Validates: Requirements 1.5**

### Property 3: Contact Search Accuracy
*For any* search query, all returned users SHALL have the search term present in either their name or identifier (NIM/email).
**Validates: Requirements 1.6**

### Property 4: Course Group Participant Completeness
*For any* course group chat, the participant count SHALL equal the number of enrolled mahasiswa plus the course dosen(s).
**Validates: Requirements 2.1, 2.5**

### Property 5: Group Message Visibility
*For any* message sent to a group conversation, all non-blocked participants SHALL be able to retrieve the message.
**Validates: Requirements 2.4**

### Property 6: Group Admin Authorization
*For any* group settings modification attempt by a non-admin participant, the operation SHALL fail with authorization error.
**Validates: Requirements 2.6**

### Property 7: Reply Message Integrity
*For any* reply message, the reply_to_id SHALL reference a valid, existing message within the same conversation.
**Validates: Requirements 3.1**

### Property 8: Forward Message Integrity
*For any* forwarded message, the forwarded_from_id SHALL reference a valid, existing message that the forwarder has access to.
**Validates: Requirements 3.2**

### Property 9: Reaction Validity
*For any* message reaction, the reaction SHALL be associated with a valid message and a valid user who is a participant in the conversation.
**Validates: Requirements 3.3**

### Property 10: Soft Delete Behavior
*For any* deleted message, the message SHALL have deleted_at set, and when retrieved, the content SHALL be replaced with deletion placeholder.
**Validates: Requirements 3.4, 8.3**

### Property 11: Edit Time Constraint
*For any* message edit attempt, if the time since creation exceeds 15 minutes, the edit SHALL fail. If within 15 minutes, edited_at SHALL be set.
**Validates: Requirements 3.5**

### Property 12: Attachment Validation
*For any* file attachment, the file type SHALL be in the allowed list AND the file size SHALL be <= 10MB. Invalid files SHALL be rejected.
**Validates: Requirements 4.1, 4.2**

### Property 13: Attachment Metadata Completeness
*For any* stored attachment, all metadata fields (file_name, file_type, file_size, mime_type) SHALL be populated and accurate.
**Validates: Requirements 4.4**

### Property 14: Search Scope Correctness
*For any* search operation, global search SHALL return results from all user's conversations, while conversation-specific search SHALL return results only from that conversation.
**Validates: Requirements 7.1, 7.2**

### Property 15: Search Filter Accuracy
*For any* search with date range filter, all results SHALL have created_at within the specified range. For type filter, all results SHALL match the specified message type.
**Validates: Requirements 7.5, 7.6**

### Property 16: Message Persistence
*For any* successfully sent message, the message SHALL be immediately retrievable from the database with all fields intact.
**Validates: Requirements 8.1**

### Property 17: Message Serialization Round-Trip
*For any* valid Message object, serializing to JSON then deserializing SHALL produce an equivalent Message object.
**Validates: Requirements 8.6**

## Error Handling

### API Error Responses

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| CONVERSATION_NOT_FOUND | 404 | Conversation does not exist |
| MESSAGE_NOT_FOUND | 404 | Message does not exist |
| UNAUTHORIZED_ACCESS | 403 | User not participant in conversation |
| INVALID_FILE_TYPE | 422 | File type not allowed |
| FILE_TOO_LARGE | 422 | File exceeds 10MB limit |
| EDIT_TIME_EXPIRED | 422 | Cannot edit message after 15 minutes |
| BLOCKED_USER | 403 | Cannot send message to blocked user |
| GROUP_ADMIN_REQUIRED | 403 | Only admin can perform this action |

### Error Handling Strategy

1. **Validation Errors**: Return 422 with detailed field errors
2. **Authorization Errors**: Return 403 with clear message
3. **Not Found Errors**: Return 404 with resource type
4. **Server Errors**: Return 500, log error, show generic message to user
5. **WebSocket Errors**: Attempt reconnection with exponential backoff

## Testing Strategy

### Unit Tests
- Model relationship tests
- Validation rule tests
- Policy authorization tests
- Service method tests

### Property-Based Tests (using Pest + Faker)
- Conversation uniqueness property
- Search accuracy property
- Attachment validation property
- Message serialization round-trip
- Edit time constraint property

### Integration Tests
- Full message flow (send → receive → read)
- File upload and download
- Group chat creation from course
- Real-time event broadcasting

### E2E Tests
- Complete chat workflow
- Multi-user conversation
- Offline message queuing

### Test Configuration
- Minimum 100 iterations for property tests
- Use SQLite in-memory for fast tests
- Mock WebSocket for unit tests
- Use Laravel Dusk for E2E tests
