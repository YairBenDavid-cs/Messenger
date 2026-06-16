lesson 5 -Schema Design: Embedding vs Referencing

Embedding – key points
Related data is stored inside a single document as nested objects/arrays.
Best for small, one-to-few, tightly coupled data that is almost always read with the parent.
Reads:
Very fast when you need parent + children together (one document read).
Can become heavy if embedded arrays grow large (big document).
Writes:
Atomic across all embedded fields (one document = one all-or-nothing write).
Updating a small part still touches the larger document, which can be slower if it grows a lot.

Referencing – key points
Related data is stored in separate documents/collections, linked by id fields.
Best for one-to-many / many-to-many, large or unbounded child sets, or when children are useful on their own.
Reads:
Usually need multiple queries (parent, then children).
Very flexible querying (by different fields, ranges, etc.), works well with large numbers of documents.
Writes:
Each child is a small, independent document, so writes are light and scale well.
No single-document atomicity across parent and children; multi-document consistency needs extra logic/transactions.

Mental rules
Embed when data is: small, one-to-few, tightly coupled, usually read with the parent, and needs atomic updates together.
Reference when data is: large or unbounded, queried independently, or when you need flexible reads and cheap per-item writes.

lesson 6 Schema Design for the Chat App: Users, Conversations, Messages


tart from usage, not from the database
Design documents by looking at your main screens and API endpoints: what data do they need together in one go?
Optimize for common reads, keep writes simple
It’s OK to duplicate a little data if it makes very frequent reads cheaper, as long as the updates stay easy and safe.
Decide embed vs reference by size and access pattern
Small, bounded, almost always loaded with the parent → embed.
Large or unbounded, or often accessed alone → separate collection + reference.
For many-to-many, default to arrays of IDs
In document DBs, N:N is usually modeled by storing an array of foreign IDs on the “owning” side, instead of a separate junction collection.
Watch for unbounded growth inside a single doc
Any array that can grow without limit is a red flag; that data usually wants its own collection.
Give each document a clear responsibility
Each doc type should have one main concern (e.g., identity, group/aggregate, event/log) and not mix unrelated responsibilities.
Use clean, explicit naming
Names should say what they store (userId, participantUserIds) and match how the code thinks about the data, for both frontend and backend.

lesson 7 Mongoose Models, Schemas, and Validation

Field config object
 
Each field is usually defined as a config object:
 
type – the data type (String, Number, Boolean, Date, Types.ObjectId, arrays)
required – whether the field must be present when creating a document
default – value to auto-fill when the field is missing
Basic validators:
minlength / maxlength for strings
min / max for numbers
enum for “one of these values”
ObjectId + ref (references)
 
Use Types.ObjectId for fields that store another document’s _id.
Add ref: 'ModelName' to tell Mongoose which model/collection it points to.
This is how you model relations like message → user, message → conversation.
Timestamps
 
Schema option { timestamps: true } automatically adds:
createdAt
updatedAt
Prefer this over manually defining createdAt / updatedAt.
Indexes
 
Indexes are defined at the schema level with schema.index(...).
Single-field index: schema.index({ email: 1 }, { unique: true })
1 = ascending, -1 = descending
unique: true enforces no duplicate values in that field.
Compound index: schema.index({ conversationId: 1, createdAt: 1 })
Order matters: first key, then second key, etc.
Used for “filter by X and sort by Y” patterns (e.g., conversation + time).
Clean code habits
 
Use import { Schema, Types } from 'mongoose' and Types.ObjectId for IDs.
Keep schemas in their own files (data layer), no business logic inside.
Use timestamps instead of hand-rolled time fields when possible.
Prefer explicit schema.index(...) over hiding indexes inside field options, for clarity.

lesson 8  Reading Data: Queries, Filters, and Projection
est practices
 
Always think “minimum necessary data”:
Only return fields the API/client actually needs.
Use inclusion projection ({ field: 1 }) for API responses:
Safer when new fields are added later.
Keep projection in the repository/DAO, not in controllers:
Controller = HTTP / validation.
Repository = what to query and which fields.
Use clear method names that reflect intent:
findMessagesForConversationAfter(...)
findPublicUserProfileById(...)

lesson 11 : 
 Stable ordering needs a total order: createdAt + _id
 
Sort by: createdAt DESC, _id DESC for timelines.
Use _id as a tie-breaker when createdAt is equal → total, deterministic order.
Cursor payload: { createdAt, id } (both as strings).
find: filters by conversation (and cursor conditions).
sort: uses the same fields and directions as your cursor.
limit: page size.
1$or: [
2  { createdAt: { $lt: cursor.createdAt } },
3  {
4    createdAt: cursor.createdAt,
5    _id: { $lt: cursor.id },
6  },
7]
$lt (not <=) ensures no duplicates.
Index design: match filter + sort
conversationId first: every query filters by it.
Then createdAt: -1, _id: -1: exactly the sort order.
Mongo can then walk the index in order → no in-memory sort, cheap page fetch.
 
👉 Always design a compound index that matches your filter prefix + sort.
Stable order (createdAt + _id)
Cursor token (encode/decode)
find + cursor filter + sort + limit
Matching compound index
No deep skip

lesson 12
DTOs are for the boundary, not for business logic
Separate DTOs for input and output when needed
Use validation decorators on input DTOs
Keep DTOs flat and simple
Don’t leak database or auth internals into DTOs
Map explicitly between DAO ↔ DTO
Version DTOs when evolving your API

Keep DAOs in the data layer only
Align DAOs with the database schema, not the API
Never return DAOs directly from controllers
Explicit mapping functions (no magic)
Treat DAOs as persistence detail
Avoid putting business logic inside DAOs
Use TypeScript types/interfaces to make DAO vs DTO obvious