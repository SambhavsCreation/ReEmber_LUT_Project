# ReEmber API Reference

Base URL examples below use `http://localhost:8000`.
All JSON requests should include header `Content-Type: application/json`.

Authentication notes:
- Backend now supports AWS Cognito JWT Bearer tokens (`Authorization: Bearer <token>`).
- Existing endpoints remain backward compatible with clients that do not send tokens.
- If a Bearer token is sent and request body/query includes `user_id` / `uid` / `userId`, values must match token `sub` or backend returns `403`.
- Cognito pool/app client are currently hardcoded in backend settings for `User pool - 8vafno` and app client `StudentProject`.

## Accounts

### GET `/api/auth/ping`
What it does: Auth service health check.

```bash
curl "http://localhost:8000/api/auth/ping"
```

### POST `/api/auth/verify`
What it does: Verifies a Cognito JWT and returns normalized claims.

Token source:
- Preferred: `Authorization: Bearer <token>`
- Optional body fallback: `token`

```bash
curl -X POST "http://localhost:8000/api/auth/verify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <COGNITO_JWT>"
```

### GET `/api/auth/me`
What it does: Returns authenticated user claims for the supplied Bearer token.

Required header: `Authorization: Bearer <token>`

```bash
curl "http://localhost:8000/api/auth/me" \
  -H "Authorization: Bearer <COGNITO_JWT>"
```

### POST `/api/auth/match-user`
What it does: Checks whether supplied `user_id` matches authenticated token `sub`.

Required header: `Authorization: Bearer <token>`
Required body: one of `user_id` / `uid` / `userId`

```bash
curl -X POST "http://localhost:8000/api/auth/match-user" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <COGNITO_JWT>" \
  -d '{"user_id":"11111111-1111-1111-1111-111111111111"}'
```

### POST `/api/auth/register`
What it does: Creates a Cognito account with email/password.

Required body: `email`, `password`
Optional body: `name`

```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"StrongPassword123!","name":"Sam Lee"}'
```

### POST `/api/auth/confirm-signup`
What it does: Confirms a Cognito sign-up using the email verification code.

Required body: `email`, `code`

```bash
curl -X POST "http://localhost:8000/api/auth/confirm-signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","code":"123456"}'
```

### POST `/api/auth/resend-code`
What it does: Resends Cognito sign-up confirmation code.

Required body: `email`

```bash
curl -X POST "http://localhost:8000/api/auth/resend-code" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

### POST `/api/auth/login`
What it does: Authenticates a user with email/password and returns Cognito tokens.

Required body: `email`, `password`

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"StrongPassword123!"}'
```

### GET `/api/membership`
What it does: Returns the current membership tier for the specified user.

Required query: `user_id` (UUID)

```bash
curl "http://localhost:8000/api/membership?user_id=11111111-1111-1111-1111-111111111111"
```

### POST `/api/coupons/redeem`
What it does: Validates a redeem code and upgrades membership according to backend rules.

Required body: `user_id`, `code` (10 uppercase letters)

```bash
curl -X POST "http://localhost:8000/api/coupons/redeem" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"11111111-1111-1111-1111-111111111111","code":"ABCDEFGHIJ"}'
```

### POST `/api/coupons/mark-used`
What it does: Marks a coupon as used for a user and returns coupon usage state.

Required body: `coupon_code`, `user_id`

```bash
curl -X POST "http://localhost:8000/api/coupons/mark-used" \
  -H "Content-Type: application/json" \
  -d '{"coupon_code":"WELCOME2026","user_id":"11111111-1111-1111-1111-111111111111"}'
```

### GET `/api/notifications`
What it does: Fetches notifications for a user, sorted newest first.

Required query: `user_id`

```bash
curl "http://localhost:8000/api/notifications?user_id=11111111-1111-1111-1111-111111111111"
```

### POST `/api/notifications/read`
What it does: Marks a specific notification as read for a user.

Required body: `notification_id`, `user_id`

```bash
curl -X POST "http://localhost:8000/api/notifications/read" \
  -H "Content-Type: application/json" \
  -d '{"notification_id":"notif_123","user_id":"11111111-1111-1111-1111-111111111111"}'
```

### POST `/api/brevo/subscribe`
What it does: Creates or updates a Brevo contact and adds it to the configured marketing list.

Required body: `email`
Optional body: `firstName`, `lastName`, `attributes`

```bash
curl -X POST "http://localhost:8000/api/brevo/subscribe" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","firstName":"Sam","lastName":"Lee"}'
```

### POST `/api/push/devices`
What it does: Registers a device token for push notifications and returns an SNS endpoint ARN.

Required body: `platform` (`APNS` or `FCM`), `token`, `userId`
Optional body: `isSandbox`, `appId`, `deviceId`, `deviceModel`, `osVersion`, `appVersion`, `locale`, `timezone`

```bash
curl -X POST "http://localhost:8000/api/push/devices" \
  -H "Content-Type: application/json" \
  -d '{"platform":"FCM","token":"device-token","userId":"11111111-1111-1111-1111-111111111111"}'
```

### POST `/api/membership/trial`
What it does: Grants trial membership and auto-creates starter house/room data if missing.

Required body: `user_id`

```bash
curl -X POST "http://localhost:8000/api/membership/trial" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"11111111-1111-1111-1111-111111111111"}'
```

### POST `/api/membership/create-house`
What it does: Creates a house with default rooms and sets the requested membership tier.

Required body: `user_id`, `living_rooms`, `membership` (`none|basic|plus|pro`)

```bash
curl -X POST "http://localhost:8000/api/membership/create-house" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"11111111-1111-1111-1111-111111111111","living_rooms":2,"membership":"basic"}'
```

## Inventory

### GET `/api/houses`
What it does: Lists all houses owned by a user.

Required query: `user_id`

```bash
curl "http://localhost:8000/api/houses?user_id=11111111-1111-1111-1111-111111111111"
```

### POST `/api/houses/create`
What it does: Creates a new house record for a user.

Required body: `user_id`
Optional body: `display_name`

```bash
curl -X POST "http://localhost:8000/api/houses/create" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"11111111-1111-1111-1111-111111111111","display_name":"Main Home"}'
```

### PATCH `/api/houses/display-name/{house_id}`
What it does: Updates the display name of an existing house.

Path param: `house_id` (int)
Required body: `displayName` (or `name`)

```bash
curl -X PATCH "http://localhost:8000/api/houses/display-name/12" \
  -H "Content-Type: application/json" \
  -d '{"displayName":"Downtown Condo"}'
```

### DELETE `/api/houses/delete`
What it does: Deletes a house and related room rows.

Required query: `house_id` (int)

```bash
curl -X DELETE "http://localhost:8000/api/houses/delete?house_id=12"
```

### POST `/api/houses/migrate-delete`
What it does: Moves all items from a source house into a target house room, then deletes the source house.

Required body: `source_house_id`, `target_house_id`
Optional body: `new_room_name`

```bash
curl -X POST "http://localhost:8000/api/houses/migrate-delete" \
  -H "Content-Type: application/json" \
  -d '{"source_house_id":12,"target_house_id":13,"new_room_name":"Migrated items"}'
```

### GET `/api/rooms`
What it does: Lists rooms for a given house.

Required query: `house_id` (int)

```bash
curl "http://localhost:8000/api/rooms?house_id=12"
```

### POST `/api/rooms/create`
What it does: Creates a room inside a house.

Required body: `house_id`
Optional body: `name`, `banner`

```bash
curl -X POST "http://localhost:8000/api/rooms/create" \
  -H "Content-Type: application/json" \
  -d '{"house_id":12,"name":"Kitchen #1","banner":"kitchen"}'
```

### PATCH `/api/rooms/name/{room_id}`
What it does: Updates room name and/or banner values.

Path param: `room_id`
Required body: at least one of `name`, `banner`

```bash
curl -X PATCH "http://localhost:8000/api/rooms/name/7b583d9a-8abf-41a7-9d26-f26e0c27a1f7" \
  -H "Content-Type: application/json" \
  -d '{"name":"Primary Bedroom"}'
```

### DELETE `/api/rooms/delete/{room_id}`
What it does: Deletes a room by room id.

Path param: `room_id`

```bash
curl -X DELETE "http://localhost:8000/api/rooms/delete/7b583d9a-8abf-41a7-9d26-f26e0c27a1f7"
```

### GET `/api/items`
What it does: Returns active inventory items for a user, optionally filtered by house and paginated.

Required query: `uid`
Optional query: `house_id`, `cursor`, `limit`

```bash
curl "http://localhost:8000/api/items?uid=11111111-1111-1111-1111-111111111111&house_id=12&limit=100"
```

### POST `/api/items/blank`
What it does: Creates a minimal placeholder item to be filled in later.

Required body: `userId`
Optional body: `itemName`, `count`, `roomId`

```bash
curl -X POST "http://localhost:8000/api/items/blank" \
  -H "Content-Type: application/json" \
  -d '{"userId":"11111111-1111-1111-1111-111111111111","itemName":"Lamp","count":1}'
```

### DELETE `/api/items/delete`
What it does: Deletes a single inventory item.

Required query: `item_id`

```bash
curl -X DELETE "http://localhost:8000/api/items/delete?item_id=4b2dd2a3-5d1d-4ca2-90a0-754f86f8e2cb"
```

### PATCH `/api/items/category`
What it does: Updates the category tag for an item.

Required body: `id`, `item_category` (or `category`)

```bash
curl -X PATCH "http://localhost:8000/api/items/category" \
  -H "Content-Type: application/json" \
  -d '{"id":"4b2dd2a3-5d1d-4ca2-90a0-754f86f8e2cb","item_category":"electronics"}'
```

### POST `/api/items/image`
What it does: Manages item images by replacing, appending, or activating a selected image.

Required body: `userId`, `itemId`, `mode`
- If `mode=replace|append`, include `image_data` (base64)
- If `mode=activate`, include `image_s3`

```bash
curl -X POST "http://localhost:8000/api/items/image" \
  -H "Content-Type: application/json" \
  -d '{"userId":"11111111-1111-1111-1111-111111111111","itemId":"4b2dd2a3-5d1d-4ca2-90a0-754f86f8e2cb","mode":"replace","image_data":"<base64-image>"}'
```

### POST `/api/images/upload`
What it does: Uploads a base64 image to a caller-specified S3 key/path in the configured bucket.

Required body: `image_data`, `s3_path`
Optional body: `content_type`, `user_id`

Notes:
- `s3_path` can be a key like `images/custom/avatar.jpg`, a folder-like prefix like `images/custom/`, or an `s3://<bucket>/<key>` URL.
- If `s3_path` ends with `/`, the backend auto-generates a filename.

```bash
curl -X POST "http://localhost:8000/api/images/upload" \
  -H "Content-Type: application/json" \
  -d '{"image_data":"<base64-image>","s3_path":"images/external/u123/profile.jpg","content_type":"image/jpeg","user_id":"11111111-1111-1111-1111-111111111111"}'
```

### GET `/api/items/search`
What it does: Searches a user's items by partial item name.

Required query: `user_id`
Optional query: `item_name`

```bash
curl "http://localhost:8000/api/items/search?user_id=11111111-1111-1111-1111-111111111111&item_name=lamp"
```

### GET `/api/items/receipts`
What it does: Lists item receipt records and returns pre-signed URLs to access receipt files.

Required query: `uid`, `iid` (or `item_id`)
Optional query: `limit`, `after_id`, `expires`

```bash
curl "http://localhost:8000/api/items/receipts?uid=11111111-1111-1111-1111-111111111111&iid=4b2dd2a3-5d1d-4ca2-90a0-754f86f8e2cb"
```

### POST `/api/items/receipts/upload`
What it does: Uploads a receipt image and attaches it to an item.

Required body: `user_id`, `item_id`, `image_data`
Optional body: `file_name`, `content_type`

```bash
curl -X POST "http://localhost:8000/api/items/receipts/upload" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"11111111-1111-1111-1111-111111111111","item_id":"4b2dd2a3-5d1d-4ca2-90a0-754f86f8e2cb","image_data":"<base64-image>","file_name":"receipt.jpg","content_type":"image/jpeg"}'
```

### GET `/api/household_items/{item_id}`
What it does: Fetches full details for a single item.

Path param: `item_id`

```bash
curl "http://localhost:8000/api/household_items/4b2dd2a3-5d1d-4ca2-90a0-754f86f8e2cb"
```

### PATCH `/api/household_items/{item_id}`
What it does: Updates selected editable fields on a single item.

Path param: `item_id`
Optional body fields: `itemName`, `brand`, `model`, `price`, `count`, `roomId`

```bash
curl -X PATCH "http://localhost:8000/api/household_items/4b2dd2a3-5d1d-4ca2-90a0-754f86f8e2cb" \
  -H "Content-Type: application/json" \
  -d '{"itemName":"Desk Lamp","price":39.99,"count":2}'
```

### GET `/api/labels`
What it does: Lists all labels available for a user.

Required query: `userId`

```bash
curl "http://localhost:8000/api/labels?userId=11111111-1111-1111-1111-111111111111"
```

### POST `/api/labels`
What it does: Creates a label or updates the existing same-name label for that user.

Required body: `userId`, `labelName`
Optional body: `color`, `description`

```bash
curl -X POST "http://localhost:8000/api/labels" \
  -H "Content-Type: application/json" \
  -d '{"userId":"11111111-1111-1111-1111-111111111111","labelName":"Fragile","color":"#FFAA00","description":"Handle with care"}'
```

### PATCH `/api/labels/{label_id}`
What it does: Updates label name and/or description.

Path param: `label_id`
Required body: `userId`
Optional body: `labelName`, `description`

```bash
curl -X PATCH "http://localhost:8000/api/labels/ae34e7dc-dcd6-4f6f-b827-b10e4f3015e5" \
  -H "Content-Type: application/json" \
  -d '{"userId":"11111111-1111-1111-1111-111111111111","description":"Updated description"}'
```

### GET `/api/household_items/{item_id}/labels`
What it does: Returns all labels currently attached to an item.

Path param: `item_id`

```bash
curl "http://localhost:8000/api/household_items/4b2dd2a3-5d1d-4ca2-90a0-754f86f8e2cb/labels"
```

### POST `/api/household_items/{item_id}/labels`
What it does: Attaches an existing label to an item, or creates one by name then attaches it.

Path param: `item_id`
Required body: `labelId` or `labelName`
Optional body: `color` (used when creating by `labelName`)

```bash
curl -X POST "http://localhost:8000/api/household_items/4b2dd2a3-5d1d-4ca2-90a0-754f86f8e2cb/labels" \
  -H "Content-Type: application/json" \
  -d '{"labelName":"Fragile","color":"#FFAA00"}'
```

### DELETE `/api/household_items/{item_id}/labels`
What it does: Removes a label association from an item.

Path param: `item_id`
Required body: `labelId` or `labelName`

```bash
curl -X DELETE "http://localhost:8000/api/household_items/4b2dd2a3-5d1d-4ca2-90a0-754f86f8e2cb/labels" \
  -H "Content-Type: application/json" \
  -d '{"labelName":"Fragile"}'
```

### GET `/api/videos`
What it does: Lists video metadata for a user.

Required query: `user_id`

```bash
curl "http://localhost:8000/api/videos?user_id=11111111-1111-1111-1111-111111111111"
```

### GET `/api/videos/by-room`
What it does: Lists videos linked to a room, with optional paging.

Required query: `room_id`
Optional query: `cursor`, `limit`

```bash
curl "http://localhost:8000/api/videos/by-room?room_id=7b583d9a-8abf-41a7-9d26-f26e0c27a1f7&limit=20"
```

### GET `/api/videos/items`
What it does: Lists all items linked to a specific video.

Required query: `video_id`

```bash
curl "http://localhost:8000/api/videos/items?video_id=6f1266e6-44b8-4f9a-99c8-38756b4f6f64"
```

### POST `/api/videos/items/status`
What it does: Returns whether all items for a video are currently inactive.

Required body: `video_id`

```bash
curl -X POST "http://localhost:8000/api/videos/items/status" \
  -H "Content-Type: application/json" \
  -d '{"video_id":"6f1266e6-44b8-4f9a-99c8-38756b4f6f64"}'
```

### POST `/api/videos/items/accept`
What it does: Activates all items associated with a video.

Required body: `video_id`

```bash
curl -X POST "http://localhost:8000/api/videos/items/accept" \
  -H "Content-Type: application/json" \
  -d '{"video_id":"6f1266e6-44b8-4f9a-99c8-38756b4f6f64"}'
```

### POST `/api/videos/items/approve-single`
What it does: Activates one specific item by item id.

Required body: `item_id`

```bash
curl -X POST "http://localhost:8000/api/videos/items/approve-single" \
  -H "Content-Type: application/json" \
  -d '{"item_id":"4b2dd2a3-5d1d-4ca2-90a0-754f86f8e2cb"}'
```

### POST `/api/videos/upload-url`
What it does: Generates a pre-signed upload URL for direct client video upload to S3.

Required body: `user_id`
Optional body: `file_name`, `house_id`, `room_id`, `duration`

```bash
curl -X POST "http://localhost:8000/api/videos/upload-url" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"11111111-1111-1111-1111-111111111111","file_name":"kitchen.mp4","house_id":12,"room_id":"7b583d9a-8abf-41a7-9d26-f26e0c27a1f7","duration":42}'
```

### GET `/api/videos/stream`
What it does: Returns a pre-signed URL for secure video playback/download.

Required query: `key` (must begin with `videos/`)

```bash
curl "http://localhost:8000/api/videos/stream?key=videos/11111111-1111-1111-1111-111111111111/example.mp4"
```

### GET `/api/jobs`
What it does: Lists recent job records for a user.

Required query: `user_id`

```bash
curl "http://localhost:8000/api/jobs?user_id=11111111-1111-1111-1111-111111111111"
```

### GET `/api/exports/house`
What it does: Generates an encrypted Excel export for one house and stores it in S3.

Required query: `uid`, `house_id`
Optional query: `export_password`

```bash
curl "http://localhost:8000/api/exports/house?uid=11111111-1111-1111-1111-111111111111&house_id=12&export_password=MyStrongPassword"
```

### GET `/api/exports/house/list`
What it does: Lists previous house exports and optionally returns pre-signed download links.

Required query: `uid`, `house_id`
Optional query: `limit`, `cursor_created`, `cursor_id`, `presign`, `expires`

```bash
curl "http://localhost:8000/api/exports/house/list?uid=11111111-1111-1111-1111-111111111111&house_id=12&limit=20&presign=true&expires=3600"
```

### POST `/api/items/detect`
What it does: Analyzes an image with AI and returns predicted item fields.

Required body: `image_data` (base64 image)

```bash
curl -X POST "http://localhost:8000/api/items/detect" \
  -H "Content-Type: application/json" \
  -d '{"image_data":"<base64-image>"}'
```

### POST `/api/items/process-image`
What it does: Uploads an item image and creates a new item record from provided/derived data.

Required body: `user_id`, `image_data`
Optional body: `video_id`, `item_name`, `brand`, `model`, `price`, `currency`, `house_id`, `room_id`, `count`, `category`

```bash
curl -X POST "http://localhost:8000/api/items/process-image" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"11111111-1111-1111-1111-111111111111","image_data":"<base64-image>","item_name":"Office Chair","price":149.99,"currency":"USD","house_id":12,"room_id":"7b583d9a-8abf-41a7-9d26-f26e0c27a1f7","count":1,"category":"furniture"}'
```
