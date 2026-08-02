# Redesign Vendor Panel to Match Admin UI Layout

Redesign the entire Vendor module in the BookMyPlay frontend. The goal is to replace the old top navigation bar layout with a modern, professional, fixed left sidebar and top navbar dashboard layout (matching the Admin Panel), while keeping all current functionality, database interactions, and backend REST APIs intact.

## User Review Required

> [!IMPORTANT]
> - **Zero Backend Changes**: This is a frontend-only design upgrade. No Spring Boot or database alterations will be made.
> - **React 19 Compatibility**: Because the frontend is built using React 19, installing external charting packages like Recharts or Chart.js can lead to dependency resolution errors. To guarantee 100% stability, compilation, and performance, we will build premium, animated, and responsive SVG-based charts directly in the dashboards and analytics sections.
> - **Routes Registration**: We will register new routes under `/vendor/...` in `src/App.js` to enable smooth React Router-based navigation between the items in the sidebar.

## Open Questions

None at this time. The requirements are clear, and the design pattern matches the existing Admin Panel dashboard.

## Proposed Changes

We will restructure all pages inside the Vendor module to inherit a consistent layout: a fixed left sidebar (`VendorSidebar.js`) and a fixed top navbar (`VendorNavbar.js`), with the central content scrollable and responsive.

### Component Changes

---

#### [MODIFY] [VendorSidebar.js](file:///c:/Users/Snket/Desktop/project/Frontend/bookmyplay/src/components/VendorSidebar.js)
Create a modern, sleek sidebar supporting all requested menu items with React Icons, active page highlighting, hover transitions, and collapsibility on mobile.

#### [NEW] [VendorNavbar.js](file:///c:/Users/Snket/Desktop/project/Frontend/bookmyplay/src/components/VendorNavbar.js)
Create a top navigation bar that shows system alerts, unread counts, profile information, and dropdown settings, matching `AdminNavbar.js`.

### Page Redesigns & Additions

---

#### [MODIFY] [VendorDashboard.js](file:///c:/Users/Snket/Desktop/project/Frontend/bookmyplay/src/pages/VendorDashboard.js)
Convert the dashboard into a professional KPI-centric home.
- Render 10 gradient stats cards (Total Venues, Today's Bookings, Upcoming Bookings, Completed, Cancelled, Pending, Total/Monthly Earnings, Average Rating, Sub Status).
- Embed SVG charts showing Revenue Trends, Monthly Volume, and Venue performance splits.
- Include Quick Action shortcuts and Recent Activity tables (Recent Bookings, Reviews, Payments).

#### [NEW] [VendorVenues.js](file:///c:/Users/Snket/Desktop/project/Frontend/bookmyplay/src/pages/vendor/VendorVenues.js)
New page that contains the modern responsive Venue Management Table, housing venue lists, base pricing, timing, active ratings, and slot management links.

#### [MODIFY] [VendorBookings.js](file:///c:/Users/Snket/Desktop/project/Frontend/bookmyplay/src/pages/VendorBookings.js)
Redesign the booking interface with a Search input, dropdown filters, badges, and a custom details modal, plus pagination.

#### [NEW] [VendorBookingHistory.js](file:///c:/Users/Snket/Desktop/project/Frontend/bookmyplay/src/pages/vendor/VendorBookingHistory.js)
Dedicated Booking History page containing searchable log entries of past completed/cancelled bookings.

#### [NEW] [VendorEarnings.js](file:///c:/Users/Snket/Desktop/project/Frontend/bookmyplay/src/pages/vendor/VendorEarnings.js)
Create an Earnings Ledger displaying Today's/Weekly/Monthly/Yearly earnings, interactive SVG line charts mapping cash flows, and a payment history table.

#### [NEW] [VendorReviews.js](file:///c:/Users/Snket/Desktop/project/Frontend/bookmyplay/src/pages/vendor/VendorReviews.js)
Create a reviews page allowing search, pagination, and sorting of customer comments, venue star ratings, and review dates.

#### [NEW] [VendorAnalytics.js](file:///c:/Users/Snket/Desktop/project/Frontend/bookmyplay/src/pages/vendor/VendorAnalytics.js)
Create an analytics cockpit to visualize peak booking hours and venue popularity splits using high-fidelity SVG graphics.

#### [MODIFY] [VendorProfile.js](file:///c:/Users/Snket/Desktop/project/Frontend/bookmyplay/src/pages/VendorProfile.js)
Update profile view page layout to integrate with the sidebar and top navbar layout.

#### [NEW] [VendorNotifications.js](file:///c:/Users/Snket/Desktop/project/Frontend/bookmyplay/src/pages/vendor/VendorNotifications.js)
Create a dedicated Notifications page listing all system alerts with quick buttons to mark read or clear.

#### [NEW] [VendorSettings.js](file:///c:/Users/Snket/Desktop/project/Frontend/bookmyplay/src/pages/vendor/VendorSettings.js)
Dedicated settings module for updating business details, updating credentials, and setting preferences.

#### [MODIFY] [VendorPricing.js](file:///c:/Users/Snket/Desktop/project/Frontend/bookmyplay/src/pages/vendor/VendorPricing.js)
Redesign membership subscriptions into a clean, premium visual billing page with plan details and activation forms.

#### [MODIFY] [AddVenue.js](file:///c:/Users/Snket/Desktop/project/Frontend/bookmyplay/src/pages/AddVenue.js)
Adjust form container to adapt seamlessly to the sidebar + navbar layout.

#### [MODIFY] [EditVenue.js](file:///c:/Users/Snket/Desktop/project/Frontend/bookmyplay/src/pages/EditVenue.js)
Adjust form container to adapt seamlessly to the sidebar + navbar layout.

#### [MODIFY] [ManageSlots.js](file:///c:/Users/Snket/Desktop/project/Frontend/bookmyplay/src/pages/ManageSlots.js)
Redesign slot builder interface to match the layout shell.

#### [MODIFY] [App.js](file:///c:/Users/Snket/Desktop/project/Frontend/bookmyplay/src/App.js)
Register all new route configurations.

## Verification Plan

### Manual Verification
1. Login to the application as a Vendor.
2. Navigate through the new Sidebar to verify routing works smoothly.
3. Validate stats cards, SVG graphs, and responsive column layouts are rendered beautifully.
4. Verify all actions (Add Venue, Edit Venue, View slots, Delete Venue) continue to perform correct API calls.
5. Check notifications are read/cleared correctly.
6. Verify subscription purchase flows operate perfectly without issue.
