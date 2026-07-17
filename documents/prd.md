# Product Requirements Document

## Product Name

**Commission Queue**
Working title for a web application that helps artists manage commissions, track progress, organize their queue, and share commission updates with clients through public links.

---

## 1. Product Summary

Commission Queue is a web-based commission management and note-taking application for artists.

Artists can:

* Create and manage commission records
* Store client and artwork details
* Add private notes
* Update commission progress
* Organize commissions into a queue
* Set their commission availability
* Share public tracking links with clients

Clients do not need accounts. They access a private public link where they can view:

* Their current queue position
* The progress of their commission
* Current commission status
* Artist-provided updates
* Estimated completion information, when available

The product should reduce repeated client messages such as “Any update?” while giving artists a simple workspace for managing ongoing commissions.

---

## 2. Problem Statement

Many independent artists manage commissions using a combination of direct messages, spreadsheets, notes applications, and social media conversations.

This creates several problems:

* Commission details become scattered across platforms
* Artists forget updates, deadlines, or client requirements
* Clients repeatedly ask about progress
* Artists manually explain queue position and availability
* Clients may misunderstand how long a commission will take
* Public queue lists may accidentally expose client identities or private information

Commission Queue provides one centralized workspace for the artist while giving each client a limited, privacy-safe progress view.

---

## 3. Product Goals

### Primary Goals

1. Help artists organize active and upcoming commissions.
2. Allow artists to record notes and progress updates for each commission.
3. Automatically calculate and display queue positions.
4. Let clients track their commission without creating an account.
5. Let artists clearly communicate whether commissions are open, limited, or closed.
6. Reduce repetitive status inquiries from clients.

### Secondary Goals

1. Give artists a clear overview of their workload.
2. Help artists identify delayed or inactive commissions.
3. Create a professional commission experience for clients.
4. Allow artists to share one public commission-status page through social media profiles.

---

## 4. Non-Goals for the MVP

The first version will not include:

* Client accounts
* Client messaging or live chat
* Payment processing
* Refund handling
* Contracts or digital signatures
* Marketplace discovery
* Artist-client matching
* File delivery or large artwork uploads
* Automated AI-generated artwork
* Team or studio accounts
* Complex accounting or tax reports

These features would significantly expand the product beyond its core purpose.

---

## 5. Target Users

### Primary User: Artist

An independent digital or traditional artist who accepts commissions and needs a simple way to manage:

* Clients
* Commission requirements
* Notes
* Progress
* Deadlines
* Queue position
* Availability

### Secondary User: Client

A person who commissioned artwork and wants to check:

* Whether their commission is queued or in progress
* Their current position in the queue
* The latest progress update
* The expected next step

Clients access the application through a unique public link and do not create accounts.

---

## 6. User Roles and Permissions

### Artist

Artists must log in to access their dashboard.

Artists can:

* Create, edit, archive, and delete commissions
* Add and manage clients
* Add private notes
* Add public progress updates
* Change commission status
* Reorder the commission queue
* Set availability
* Generate or disable client tracking links
* Control what information appears publicly

### Client

Clients do not log in.

Clients can only:

* Open their unique commission tracking link
* View their commission status
* View their queue position
* View public progress updates
* View estimated dates shared by the artist

Clients cannot:

* Edit commission information
* See private artist notes
* View other clients’ names or contact information
* View internal pricing or payment notes unless explicitly shared
* Change their queue position
* Access the artist dashboard

---

## 7. Core User Stories

### Artist Authentication

* As an artist, I want to create an account so that my commission records remain private.
* As an artist, I want to log in securely so that I can access my dashboard.
* As an artist, I want to log out from my account.
* As an artist, I want to reset my password if I forget it.

### Commission Management

* As an artist, I want to create a commission so that I can track a client request.
* As an artist, I want to record the client name, commission title, type, price, deadline, and requirements.
* As an artist, I want to update the commission status as work progresses.
* As an artist, I want to archive completed or cancelled commissions.
* As an artist, I want to search and filter commissions.

### Notes and Progress

* As an artist, I want to add private notes that only I can see.
* As an artist, I want to post public updates that the client can see.
* As an artist, I want to record milestones such as sketching, coloring, and final review.
* As an artist, I want to attach optional preview images to progress updates.

### Queue Management

* As an artist, I want to reorder commissions manually.
* As an artist, I want the application to calculate each active commission’s queue position.
* As an artist, I want paused commissions excluded from the active queue.
* As an artist, I want completed and cancelled commissions removed from the queue automatically.

### Availability

* As an artist, I want to mark commissions as open, limited, waitlist-only, or closed.
* As an artist, I want to set the number of available slots.
* As an artist, I want to add a short availability message.
* As an artist, I want clients and potential clients to see my current availability.

### Client Tracking

* As a client, I want to open a private link without creating an account.
* As a client, I want to see my queue position.
* As a client, I want to see the current stage of my commission.
* As a client, I want to see the artist’s latest update.
* As a client, I want to know whether the commission is waiting, active, paused, completed, or cancelled.

---

## 8. Commission Statuses

Each commission must have one primary status.

### Suggested Statuses

1. **Inquiry**

   * Initial request received
   * Not yet confirmed

2. **Awaiting Payment**

   * Commission accepted
   * Payment or deposit pending

3. **Queued**

   * Confirmed and waiting for the artist to begin

4. **In Progress**

   * Artist has started working

5. **Client Review**

   * Waiting for client feedback or approval

6. **Revision**

   * Artist is applying approved revisions

7. **Paused**

   * Temporarily inactive
   * Excluded from the active queue by default

8. **Completed**

   * Artwork completed and delivered

9. **Cancelled**

   * Commission will not continue

Artists should be allowed to customize the public label shown to clients while keeping the internal status standardized.

---

## 9. Progress Tracking

Each commission may include a progress percentage and milestone stages.

### Default Milestones

* Request confirmed
* Payment confirmed
* References received
* Sketch
* Line art
* Base colors
* Shading and details
* Client review
* Revisions
* Final delivery

Artists may:

* Enable or disable milestones
* Rename milestones
* Mark milestones as complete
* Add notes to a milestone
* Set the current stage
* Enter a manual completion percentage

The MVP should not calculate progress automatically based only on completed milestones. Artists should retain manual control because creative work rarely behaves like a factory conveyor belt, despite software’s constant attempts to pretend otherwise.

---

## 10. Queue Logic

### Default Queue Rules

* Only commissions with the status **Queued** or **In Progress** appear in the active queue.
* Completed, cancelled, paused, and inquiry-stage commissions do not count toward queue position.
* Artists can manually drag and reorder commissions.
* Queue positions update automatically after reordering or status changes.
* Each client sees only their own numerical queue position.

### Client Queue Display

The client page should show:

* `Position 3 of 8`
* Current status
* Whether the artist is currently working on the commission
* An optional estimated start date

The system must not show the names, usernames, commission titles, or contact information of other clients.

### Optional Public Artist Queue

Artists may enable a public queue page showing anonymized entries such as:

* Slot 1: In Progress
* Slot 2: Queued
* Slot 3: Queued

This feature should be disabled by default.

---

## 11. Availability Management

Artists can set one of the following availability states:

* **Open**
* **Limited Slots**
* **Waitlist Only**
* **Closed**
* **Temporarily Unavailable**

Artists may also define:

* Total available slots
* Number of occupied slots
* Expected reopening date
* Custom availability message
* Commission types currently accepted

Example:

> Commissions are currently limited to three character illustration slots. New slots are expected to open in August.

---

## 12. Artist Dashboard

The dashboard should provide an immediate overview of the artist’s workload.

### Dashboard Information

* Total active commissions
* Number of queued commissions
* Number currently in progress
* Number awaiting client feedback
* Number approaching deadlines
* Current availability status
* Recently updated commissions

### Dashboard Sections

1. **Active Queue**
2. **Needs Attention**
3. **Upcoming Deadlines**
4. **Recent Updates**
5. **Availability Controls**

The dashboard should prioritize clarity over decorative analytics. Artists need to know what requires attention, not admire a pie chart announcing that they are behind schedule.

---

## 13. Commission Record

Each commission should contain the following fields.

### Basic Information

* Commission title
* Client display name
* Client email or contact handle
* Commission type
* Description
* Reference links
* Date created
* Requested deadline
* Internal priority
* Current status

### Financial Information

* Agreed price
* Currency
* Payment status
* Deposit amount
* Remaining balance

Financial information is private by default.

### Queue Information

* Queue position
* Priority order
* Estimated start date
* Estimated completion date
* Paused status

### Notes

* Private artist notes
* Public client updates
* Revision notes
* Special requirements

### Files

For the MVP, the application may support:

* Reference image URLs
* Small progress-preview uploads
* Final-delivery link

Large file storage and final artwork hosting are outside the MVP scope.

---

## 14. Notes and Updates

The application must clearly separate private notes from public updates.

### Private Notes

Visible only to the artist.

Examples:

* Client prefers softer colors
* Do not forget alternate outfit
* Payment balance still pending
* Revision request may exceed agreed scope

### Public Updates

Visible to the client through the tracking link.

Examples:

* Sketch completed
* Waiting for your feedback
* Coloring is now in progress
* Final rendering should begin this week

Every update should include:

* Date and time
* Update title
* Update message
* Optional progress percentage
* Optional preview image
* Visibility setting

Public and private content must use visually distinct labels to reduce accidental sharing.

---

## 15. Client Tracking Page

Each commission receives a unique, difficult-to-guess tracking URL.

Example format:

```text
app.example.com/track/c7Jp9xL2
```

### Client Page Content

* Artist name or studio name
* Artist profile image
* Commission title or client-safe label
* Current status
* Queue position
* Progress percentage
* Current milestone
* Latest public update
* Update history
* Estimated start date
* Estimated completion date
* Artist availability
* Artist contact link

### Client Page Privacy

The client page must not reveal:

* Other clients’ identities
* Private notes
* Internal priority labels
* Payment details unless intentionally shared
* Internal revision discussions
* Artist dashboard information

Artists must be able to:

* Regenerate the tracking link
* Disable the tracking link
* Preview the client page
* Control which fields are visible

---

## 16. Main Pages

### Public Pages

1. Landing page
2. Artist public profile
3. Client commission tracking page
4. Invalid or expired tracking-link page

### Authentication Pages

1. Artist sign-up
2. Artist login
3. Forgot password
4. Reset password

### Protected Artist Pages

1. Dashboard
2. Commission list
3. Commission details
4. Create commission
5. Queue manager
6. Client list
7. Availability settings
8. Public profile settings
9. Account settings

---

## 17. Search and Filters

Artists should be able to search commissions by:

* Client name
* Commission title
* Contact handle
* Commission type

Artists should be able to filter by:

* Status
* Deadline
* Payment status
* Active or archived
* Queue position
* Needs client response
* Needs artist action

---

## 18. Notifications

### MVP Notifications

The application should display in-app reminders for:

* Upcoming deadlines
* Overdue commissions
* Commissions awaiting artist action
* Commissions awaiting client feedback
* Commissions without recent updates

### Optional Email Notifications

Artists may send or schedule an email notification when:

* A public progress update is posted
* The commission status changes
* The commission enters active production
* Client feedback is requested
* The commission is completed

Email notifications should be optional and disabled by default during the earliest MVP implementation.

---

## 19. Functional Requirements

### Authentication

* Artists must be able to register using email and password.
* Artists must verify their email before accessing protected features.
* Protected pages must reject unauthenticated access.
* Password reset must be supported.

### Commission CRUD

* Artists must be able to create, read, update, archive, and delete commissions.
* Deleted commissions should use soft deletion where possible.
* Archived commissions should remain searchable.

### Queue Management

* Artists must be able to reorder active commissions.
* Queue positions must update consistently.
* Queue calculations must only include eligible statuses.

### Public Tracking

* Every commission may have one active tracking token.
* Tracking tokens must be random and difficult to predict.
* Artists must be able to revoke or regenerate tokens.
* Public tracking pages must not require authentication.

### Data Ownership

* Every commission, client, note, and update must belong to one authenticated artist.
* Artists must never access records belonging to another artist.
* Database-level authorization policies must enforce ownership.

---

## 20. Non-Functional Requirements

### Security

* Use secure authentication.
* Use row-level database authorization.
* Never expose private notes through public APIs.
* Store public access through random tracking tokens.
* Validate all uploaded files.
* Rate-limit public tracking endpoints where practical.
* Sanitize user-generated text.

### Privacy

* Client contact information must remain private.
* Public queue pages must anonymize clients.
* Artists must control visible tracking-page fields.
* Tracking links should include a clear warning that anyone with the link can view the shared information.

### Performance

* Dashboard pages should load within two seconds under normal conditions.
* Queue reordering should feel immediate.
* Client tracking pages should work well on mobile devices.

### Accessibility

* Support keyboard navigation.
* Use readable contrast.
* Include visible form labels.
* Do not rely on color alone to represent status.
* Provide text alternatives for uploaded images.

### Responsiveness

The application must work on:

* Desktop
* Tablet
* Mobile

The client tracking page should be designed mobile-first because clients will commonly open links from messaging or social media applications.

---

## 21. Suggested Data Model

### Artist

* id
* email
* display_name
* username
* profile_image_url
* bio
* contact_url
* availability_status
* availability_message
* available_slots
* created_at
* updated_at

### Client

* id
* artist_id
* display_name
* email
* contact_handle
* preferred_contact_method
* private_notes
* created_at
* updated_at

### Commission

* id
* artist_id
* client_id
* title
* public_title
* description
* commission_type
* status
* progress_percentage
* queue_order
* priority
* requested_deadline
* estimated_start_date
* estimated_completion_date
* price
* currency
* payment_status
* public_tracking_enabled
* tracking_token
* created_at
* updated_at
* archived_at

### CommissionNote

* id
* commission_id
* artist_id
* title
* content
* visibility
* progress_percentage
* preview_image_url
* created_at
* updated_at

### CommissionMilestone

* id
* commission_id
* title
* description
* order_index
* is_completed
* completed_at
* is_public

### Reference

* id
* commission_id
* label
* url
* file_url
* created_at

---

## 22. Primary User Flows

### Artist Creates a Commission

1. Artist logs in.
2. Artist selects **New Commission**.
3. Artist selects an existing client or creates a new client.
4. Artist enters commission details.
5. Artist chooses an initial status.
6. Artist adds the commission to the queue.
7. The system generates a private tracking link.
8. Artist reviews the client-facing page.
9. Artist sends the tracking link to the client.

### Artist Updates Progress

1. Artist opens a commission.
2. Artist changes the milestone or progress percentage.
3. Artist writes an update.
4. Artist selects private or public visibility.
5. Artist optionally attaches a preview image.
6. Artist saves the update.
7. The client page reflects the new public information.

### Client Checks Progress

1. Client opens the tracking link.
2. The system validates the tracking token.
3. Client sees their queue position.
4. Client sees current progress and status.
5. Client reviews recent public updates.
6. Client contacts the artist externally when feedback is requested.

---

## 23. MVP Scope

The first release must include:

* Artist registration and login
* Password reset
* Artist dashboard
* Client records
* Commission creation and editing
* Commission statuses
* Private notes
* Public progress updates
* Manual progress percentage
* Commission milestones
* Drag-and-drop queue management
* Automatic queue-position calculation
* Artist availability controls
* Public client tracking links
* Mobile-responsive tracking pages
* Archive and search
* Basic privacy and ownership enforcement

---

## 24. Future Features

Possible later additions include:

* Client approval buttons
* Revision request forms
* Automated email updates
* Payment integrations
* Invoice generation
* Commission request forms
* Waitlist submissions
* Calendar view
* Estimated workload calculations
* Custom commission workflows
* Discord integration
* Social media profile widgets
* Analytics for turnaround time
* Reusable commission templates
* Multiple artist or studio accounts
* Artwork delivery and download protection

---

## 25. Success Metrics

The product should measure:

* Number of active artists
* Number of commissions created
* Percentage of commissions using tracking links
* Number of client tracking-page visits
* Average time between artist updates
* Percentage of commissions completed
* Average commission completion time
* Number of overdue commissions
* Artist retention after 30 days

### Product Success Indicators

The MVP is successful when:

* Artists can manage all active commissions from one dashboard.
* Clients can understand their status without contacting the artist.
* Queue positions remain accurate after reordering or status changes.
* Private notes never appear on public pages.
* Artists can set up and share a commission tracker within a few minutes.

---

## 26. Risks and Mitigations

### Risk: Public Links Expose Private Information

**Mitigation:**

* Use unpredictable tokens.
* Hide personal contact details by default.
* Allow artists to disable or regenerate links.
* Clearly separate public and private fields.

### Risk: Queue Position Creates Unrealistic Expectations

A client may interpret queue position as an exact delivery schedule.

**Mitigation:**

* Display a notice that queue positions may change.
* Let artists hide exact positions.
* Allow artists to show approximate labels such as “Up next” or “In queue.”
* Show estimates only when the artist provides them.

### Risk: Artists Accidentally Publish Private Notes

**Mitigation:**

* Default all new notes to private.
* Use clear visibility labels.
* Require confirmation before publishing sensitive fields.
* Provide a client-page preview.

### Risk: Scope Becomes Too Large

Payment systems, messaging, contracts, and marketplace features could overwhelm the MVP.

**Mitigation:**

* Keep the MVP focused on commission organization, progress, queue visibility, and public tracking.
* Treat business-management features as separate future modules.

---

## 27. Acceptance Criteria

The MVP is ready for release when:

1. An artist can register, verify their email, log in, and reset their password.
2. An artist can create a client and commission.
3. An artist can add private notes without exposing them publicly.
4. An artist can publish progress updates to a client.
5. An artist can reorder commissions in the active queue.
6. Queue positions update correctly after commission changes.
7. A client can open a unique tracking link without logging in.
8. The client can see their commission status, progress, and queue position.
9. The client cannot see information belonging to another client.
10. The artist can disable or regenerate a tracking link.
11. Completed, cancelled, and paused commissions are handled correctly.
12. The application works on desktop and mobile devices.
13. Database authorization prevents artists from accessing one another’s records.
14. Public pages never return private notes or internal artist fields.

---

## 28. Recommended MVP Technology

A practical implementation may use:

* **Frontend:** React or Next.js with TypeScript
* **Styling:** Tailwind CSS
* **Authentication:** Supabase Auth
* **Database:** Supabase PostgreSQL
* **Authorization:** Supabase Row Level Security
* **File Storage:** Supabase Storage
* **Deployment:** Vercel
* **Email:** Supabase Auth email initially, with Resend as a future option

The public commission tracker should fetch only data exposed through a secure database function, server endpoint, or carefully designed row-level access policy. The raw commission table should not be publicly readable merely because the record contains a tracking token.
