# Redesign Vendor Subscription Page

Redesign the Vendor Subscription page to provide a premium, modern experience. Show the vendor's current subscription status (Free Trial or paid plan) with a dynamic progress bar, and list all active subscription plans created by the Admin below it. Allow the vendor to subscribe, upgrade, or renew directly via a secure confirmation modal that activates the plan immediately and shows a SweetAlert2 success popup.

## User Review Required

> [!IMPORTANT]
> The current subscription system requires vendors to enter a reference transaction ID and wait for Admin approval.
> The new requirements specify a direct-activation flow on clicking "Confirm" in the modal. We will introduce a new backend API endpoint `/api/subscriptions/subscribe` to support this direct activation, while keeping the legacy `/purchase` endpoint intact.

## Open Questions

*No open questions at this stage. The requirements are fully detailed.*

## Proposed Changes

---

### Backend Components

#### [MODIFY] [SubscriptionController.java](file:///c:/Users/Snket/Desktop/project/Backend/bookmyplay-api/src/main/java/com/bookmyplay/controller/SubscriptionController.java)
- **Modify `getVendorSubscriptionStatus`**:
  - Sort the vendor subscriptions by `paymentDate` descending. This guarantees that the most recent subscription (whether active, trial, pending, or expired) is evaluated and returned first.
- **Add `/subscribe` endpoint**:
  - Implement a `@PostMapping("/subscribe")` endpoint.
  - When invoked, it:
    1. Fetches the plan details.
    2. Deactivates all existing active subscriptions for this vendor (sets their status and paymentStatus to `"EXPIRED"`).
    3. Creates a new active subscription record (`status = "ACTIVE"`, `paymentStatus = "APPROVED"`) starting today and expiring based on the plan duration.
    4. Generates a mock transaction reference (e.g. `SUB_<UUID_8>`).
    5. Saves the record to the database and returns it.

---

### Frontend Components

#### [MODIFY] [VendorPricing.js](file:///c:/Users/Snket/Desktop/project/Frontend/bookmyplay/src/pages/vendor/VendorPricing.js)
- **Top Card: "My Current Subscription Status"**:
  - Redesign into a premium, responsive layout.
  - Display the current plan name.
  - Display Status Badges (green for `ACTIVE`, orange for `FREE_TRIAL`, red for `EXPIRED`).
  - Render Start Date, Expiry Date, Days Remaining.
  - Implement a Bootstrap progress bar calculated dynamically from the start date (`paymentDate`), expiry date, and remaining days.
- **Plans Grid: "Available Membership Plans"**:
  - Load all ACTIVE plans from the database.
  - Handle the scenario where no plans exist by showing: *"No subscription plans are available. Please contact the administrator."*
  - Display plans as premium Bootstrap cards with:
    - Plan Name, Price, Duration.
    - Description.
    - Checkmark-bulleted Features list (determined dynamically from plan details to ensure premium aesthetics).
    - Soft shadow (`shadow-sm`) with a smooth hover translation (`translateY(-8px)`) and deeper shadow effect.
    - Soft green theme headers matching the Vendor Dashboard.
    - Inline Active/Inactive badges.
- **Button Behavior**:
  - If the user is on Free Trial: button shows `"Upgrade Now"`.
  - If the user has an Active Paid Plan:
    - If the plan card corresponds to the current plan: button is disabled and shows `"Current Plan"`.
    - Otherwise, button shows `"Renew Plan"`.
  - In other cases: button shows `"Subscribe Now"`.
- **Confirmation Modal**:
  - Implement a Bootstrap confirmation modal that triggers when clicking a plan's button.
  - Display: Selected Plan Name, Price, Duration, and calculated Expiry Date after activation.
  - Action buttons: "Confirm" and "Cancel".
- **SweetAlert2 Integration**:
  - On clicking "Confirm" in the modal:
    1. Invoke the backend `/subscribe` API.
    2. Display a success SweetAlert2 popup.
    3. Automatically refresh the page once the user closes the SweetAlert2 popup to reload the updated subscription status.
- **Code Cleanup**:
  - Remove unused states (e.g., `transactionId` input state, manual payment form).
  - Remove unused imports.

## Verification Plan

### Automated Tests
- Build and run the project after modifying files to verify compiling status.

### Manual Verification
1. Register a new vendor or log in as an existing vendor.
2. Confirm the "My Current Subscription Status" card displays the "Free Trial" details with an orange badge, correct remaining days, and progress bar.
3. Verify that the membership plans list below displays Admin-created active plans with features, pricing, and "Upgrade Now" buttons.
4. Hover over a plan card to check the shadow and slide-up transition.
5. Click "Upgrade Now" to verify the modal displays details: plan name, price, duration, and calculated expiry date.
6. Click "Confirm" to verify that the SweetAlert2 success message is shown, the page reloads, the top status card updates to the new plan with a green badge, and the card's button updates to a disabled "Current Plan".
