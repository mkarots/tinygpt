# Database migrations

Each file in this directory runs **once**, in filename order, in the Supabase SQL editor.

`20260918000000_initial_schema.sql` is already applied. Do not run it again.

`20260925000000_tighten_public_chat.sql` must also be applied before public chat can load or save a visitor session. Without it, PostgREST returns a schema-cache miss for `find_visitor_chat` / `ensure_visitor_chat`.

The next change is a new file named `YYYYMMDDHHMMSS_short_name.sql`. Do not edit a file after it has been applied.
