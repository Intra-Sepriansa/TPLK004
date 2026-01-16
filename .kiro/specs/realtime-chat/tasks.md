# Implementation Plan: Real-time Chat System

## Overview

Implementasi sistem chat real-time untuk komunikasi mahasiswa-dosen menggunakan Laravel Reverb untuk WebSocket, Inertia.js + React untuk frontend, dan MySQL untuk persistence.

## Tasks

- [x] 1. Setup Laravel Reverb dan Broadcasting
  - Install dan konfigurasi Laravel Reverb
  - Setup Laravel Echo di frontend
  - Konfigurasi broadcasting channels
  - _Requirements: Real-time infrastructure_

- [x] 2. Database Migrations dan Models
  - [x] 2.1 Create conversations table migration
    - Columns: id, type, name, description, course_id, created_by_type, created_by_id, timestamps
    - Indexes untuk type dan course_id
    - _Requirements: 1.1, 2.1_

  - [x] 2.2 Create conversation_participants table migration
    - Columns: id, conversation_id, participant_type, participant_id, role, joined_at, last_read_at, is_muted, is_blocked, timestamps
    - Unique constraint untuk conversation + participant
    - _Requirements: 1.1, 2.1_

  - [x] 2.3 Create messages table migration
    - Columns: id, conversation_id, sender_type, sender_id, content, type, reply_to_id, forwarded_from_id, edited_at, deleted_at, timestamps
    - Fulltext index untuk content search
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 8.1_

  - [x] 2.4 Create message_attachments table migration
    - Columns: id, message_id, file_name, file_path, file_type, file_size, mime_type, timestamps
    - _Requirements: 4.1, 4.2, 4.4_

  - [x] 2.5 Create message_reactions table migration
    - Columns: id, message_id, reactor_type, reactor_id, emoji, created_at
    - Unique constraint untuk message + reactor + emoji
    - _Requirements: 3.3_

  - [x] 2.6 Create user_online_status table migration
    - Columns: id, user_type, user_id, is_online, last_seen_at, updated_at
    - _Requirements: 6.1, 6.2, 6.5_

- [x] 3. Eloquent Models
  - [x] 3.1 Create Conversation model
    - Relationships: participants, messages, course, creator
    - Scopes: personal, group, forUser
    - Methods: getOtherParticipant, getUnreadCount
    - _Requirements: 1.1, 2.1_

  - [x] 3.2 Create ConversationParticipant model
    - Relationships: conversation, participant (morphTo)
    - Methods: markAsRead, mute, unmute, block
    - _Requirements: 1.5, 5.4_

  - [x] 3.3 Create Message model
    - Relationships: conversation, sender (morphTo), attachments, reactions, replyTo, forwardedFrom
    - Scopes: notDeleted, withType
    - Methods: markAsDeleted, edit
    - _Requirements: 3.1, 3.2, 3.4, 3.5_

  - [x] 3.4 Create MessageAttachment model
    - Relationships: message
    - Accessors: url, isImage, isDocument
    - _Requirements: 4.4_

  - [x] 3.5 Create MessageReaction model
    - Relationships: message, reactor (morphTo)
    - _Requirements: 3.3_

  - [x] 3.6 Create UserOnlineStatus model
    - Methods: setOnline, setOffline, updateLastSeen
    - _Requirements: 6.1, 6.2_

  - [ ] 3.7 Write property test for Conversation uniqueness
    - **Property 1: Conversation Uniqueness for Personal Chats**
    - **Validates: Requirements 1.1**

- [x] 4. Checkpoint - Run migrations and verify models
  - Ensure all migrations run successfully
  - Verify model relationships work correctly

- [x] 5. Broadcasting Events
  - [x] 5.1 Create NewMessageEvent
    - Broadcast to conversation channel
    - Include message with sender and attachments
    - _Requirements: 1.2_

  - [x] 5.2 Create MessageReadEvent
    - Broadcast read status to conversation
    - _Requirements: 1.3_

  - [x] 5.3 Create TypingEvent
    - Broadcast typing indicator
    - _Requirements: 1.4_

  - [x] 5.4 Create UserOnlineEvent
    - Broadcast online status changes
    - _Requirements: 6.1, 6.2_

  - [x] 5.5 Create MessageDeletedEvent
    - Broadcast when message deleted
    - _Requirements: 3.4_

  - [x] 5.6 Create MessageReactionEvent
    - Broadcast reaction changes
    - _Requirements: 3.3_

- [x] 6. Services Layer
  - [x] 6.1 Create ChatService
    - Methods: getOrCreatePersonalConversation, createGroupConversation, getConversationsForUser
    - Handle conversation creation logic
    - _Requirements: 1.1, 2.1_

  - [x] 6.2 Create MessageService
    - Methods: sendMessage, editMessage, deleteMessage, forwardMessage
    - Handle message operations with broadcasting
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 8.1_

  - [x] 6.3 Create AttachmentService
    - Methods: uploadAttachment, validateFile, deleteAttachment
    - Handle file validation and storage
    - _Requirements: 4.1, 4.2_

  - [x] 6.4 Create SearchService
    - Methods: searchGlobal, searchInConversation, searchByDateRange, searchByType
    - Handle message search operations
    - _Requirements: 7.1, 7.2, 7.5, 7.6_

  - [ ] 6.5 Write property tests for services
    - **Property 12: Attachment Validation**
    - **Property 14: Search Scope Correctness**
    - **Property 15: Search Filter Accuracy**
    - **Validates: Requirements 4.1, 4.2, 7.1, 7.2, 7.5, 7.6**

- [x] 7. Controllers
  - [x] 7.1 Create ChatController
    - index: List conversations with last message and unread count
    - show: Get conversation with paginated messages
    - store: Create new conversation
    - createGroupForCourse: Auto-create course group
    - _Requirements: 1.1, 2.1_

  - [x] 7.2 Create MessageController
    - store: Send message with optional attachments
    - update: Edit message (within 15 min)
    - destroy: Soft delete message
    - markAsRead: Update last_read_at
    - forward: Forward message to other conversations
    - _Requirements: 1.5, 3.1, 3.2, 3.4, 3.5_

  - [x] 7.3 Create ReactionController
    - store: Add reaction to message
    - destroy: Remove reaction
    - _Requirements: 3.3_

  - [x] 7.4 Create AttachmentController
    - store: Upload and attach file
    - download: Download attachment
    - _Requirements: 4.1, 4.2, 4.5_

  - [x] 7.5 Create SearchController
    - search: Global or conversation-specific search
    - _Requirements: 7.1, 7.2, 7.5, 7.6_

  - [ ] 7.6 Write property tests for controllers
    - **Property 11: Edit Time Constraint**
    - **Property 10: Soft Delete Behavior**
    - **Validates: Requirements 3.4, 3.5, 8.3**

- [ ] 8. Checkpoint - Test API endpoints
  - Ensure all API endpoints work correctly
  - Test with Postman or similar tool

- [ ] 9. Policies dan Authorization
  - [ ] 9.1 Create ConversationPolicy
    - viewAny, view, create, update, delete
    - Ensure user is participant
    - _Requirements: 9.2, 9.3_

  - [ ] 9.2 Create MessagePolicy
    - view, create, update, delete
    - Only sender can edit/delete own messages
    - _Requirements: 3.4, 3.5, 9.2_

  - [ ] 9.3 Create GroupAdminPolicy
    - Ensure only admin can manage group settings
    - _Requirements: 2.6_

  - [ ] 9.4 Write property test for authorization
    - **Property 6: Group Admin Authorization**
    - **Validates: Requirements 2.6**

- [x] 10. Routes
  - [x] 10.1 Define API routes for chat
    - Group under /api/chat prefix
    - Apply auth middleware (web, mahasiswa, dosen)
    - _Requirements: 9.2_

  - [x] 10.2 Define web routes for chat pages
    - /chat - Main chat page
    - /chat/{conversation} - Specific conversation
    - Fixed middleware to support all guards: web, mahasiswa, dosen
    - _Requirements: 10.1_

  - [x] 10.3 Define broadcasting channels
    - Private channel for conversations
    - Presence channel for online status
    - _Requirements: 1.2, 6.1_

- [x] 11. Frontend - Base Components
  - [x] 11.1 Create ChatLayout component
    - Sidebar with conversation list
    - Main area for active chat
    - Responsive design with dark mode
    - _Requirements: 10.1, 10.2_

  - [x] 11.2 Create ConversationList component
    - List conversations sorted by recent
    - Show unread badge
    - Search/filter functionality
    - _Requirements: 10.1, 1.6_

  - [x] 11.3 Create ConversationItem component
    - Avatar, name, last message preview
    - Unread count badge
    - Online indicator
    - _Requirements: 10.1, 6.4_

- [x] 12. Frontend - Chat Window Components
  - [x] 12.1 Create ChatWindow component
    - Message list with infinite scroll
    - Date separators
    - Loading states
    - _Requirements: 10.5, 10.4_

  - [x] 12.2 Create MessageBubble component
    - Different styles for own/other messages
    - Show sender info in groups
    - Display attachments, reactions
    - Context menu for actions
    - _Requirements: 10.3, 3.6_

  - [x] 12.3 Create MessageComposer component
    - Text input with emoji picker
    - File attachment button
    - Reply preview
    - Send button
    - _Requirements: 1.2, 4.1_

  - [x] 12.4 Create AttachmentPreview component
    - Image thumbnail
    - Document icon with name/size
    - Remove button
    - _Requirements: 4.3, 4.4_

  - [x] 12.5 Create ReplyPreview component
    - Show quoted message
    - Cancel reply button
    - _Requirements: 3.1_

- [x] 13. Frontend - Real-time Integration
  - [x] 13.1 Setup Laravel Echo in React
    - Configure Echo with Reverb
    - Create useEcho hook
    - _Requirements: 1.2_

  - [x] 13.2 Create useChat hook
    - Subscribe to conversation channel
    - Handle new messages
    - Handle typing indicators
    - _Requirements: 1.2, 1.4_

  - [x] 13.3 Create useOnlineStatus hook
    - Track user online status
    - Update presence channel
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 13.4 Implement typing indicator
    - Debounced typing events
    - Show "sedang mengetik..." text
    - _Requirements: 1.4_

- [x] 14. Frontend - Additional Features
  - [x] 14.1 Create MessageSearch component
    - Search input
    - Results list with highlighting
    - Navigate to message
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 14.2 Create ForwardMessageModal component
    - Select conversations
    - Preview message
    - Confirm forward
    - _Requirements: 3.2_

  - [x] 14.3 Create EmojiPicker component
    - Common emoji grid
    - Add reaction to message
    - _Requirements: 3.3_

  - [x] 14.4 Create ConversationInfo component
    - Show participants
    - Group settings (for admin)
    - Mute/block options
    - _Requirements: 2.5, 2.6, 5.4, 9.3_

- [ ] 15. Checkpoint - Test frontend components
  - Ensure all components render correctly
  - Test real-time updates

- [ ] 16. Integration - Course Group Auto-Creation
  - [ ] 16.1 Create CourseGroupObserver
    - Auto-create group when course created
    - Add enrolled students as participants
    - _Requirements: 2.1_

  - [ ] 16.2 Create EnrollmentObserver
    - Add student to group on enrollment
    - Remove student on drop
    - _Requirements: 2.2, 2.3_

  - [ ] 16.3 Write property test for course groups
    - **Property 4: Course Group Participant Completeness**
    - **Validates: Requirements 2.1, 2.5**

- [x] 17. Final Integration
  - [x] 17.1 Add chat link to navigation
    - Sidebar menu item
    - Unread count badge in nav
    - _Requirements: 5.2_

  - [ ] 17.2 Create notification preferences
    - Settings page integration
    - Mute/unmute conversations
    - _Requirements: 5.4, 5.6_

  - [ ] 17.3 Write property test for message persistence
    - **Property 16: Message Persistence**
    - **Property 17: Message Serialization Round-Trip**
    - **Validates: Requirements 8.1, 8.6**

- [ ] 18. Final Checkpoint
  - Ensure all tests pass
  - Verify real-time functionality
  - Test on multiple browsers/devices

## Notes

- All tasks including property-based tests are required
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Use Laravel Reverb for WebSocket (built-in Laravel solution)
